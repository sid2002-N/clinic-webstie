# EduLeads Kerala — Innovation Roadmap

> A living document of future improvements, research directions, and feature ideas grounded in the current codebase architecture. Each item is described at the level of implementation detail, not just wishlist thinking.

---

## Table of Contents

1. [AI & Conversation Intelligence](#1-ai--conversation-intelligence)
2. [Voice & Audio Improvements](#2-voice--audio-improvements)
3. [Lead Scoring — From Rules to Machine Learning](#3-lead-scoring--from-rules-to-machine-learning)
4. [New Communication Channels](#4-new-communication-channels)
5. [Student Experience](#5-student-experience)
6. [College & Agency Tools](#6-college--agency-tools)
7. [Analytics & Predictive Intelligence](#7-analytics--predictive-intelligence)
8. [Billing & Business Model](#8-billing--business-model)
9. [Platform Expansion](#9-platform-expansion)
10. [Technical Infrastructure](#10-technical-infrastructure)
11. [Compliance & Trust](#11-compliance--trust)
12. [Integration Ecosystem](#12-integration-ecosystem)

---

## 1. AI & Conversation Intelligence

### 1.1 — Mitra Memory: Cross-Session Continuity

**Problem today:** Each conversation starts fresh. If a student messaged Mitra in January exploring B.Tech and comes back in March to say "I got my Plus Two results", Mitra has no memory of them.

**Innovation:** Build a persistent student knowledge graph. After each session completes, extract and store structured facts in a `StudentProfile` table: courses they mentioned, colleges they expressed interest in, budget hesitations, parental pressure signals. When a returning student contacts Mitra, prepend this profile summary as a compressed context block in the system prompt. The student should feel instantly recognised.

**Implementation sketch:**
- New model: `StudentProfile` — JSON fields for `known_courses`, `known_concerns`, `previous_intent`, `last_interaction_summary`.
- After `CONVERSATION_COMPLETE`, a Celery task summarises the conversation using GPT-4o and writes to `StudentProfile`.
- `WhatsAppHandler.handle_incoming()` loads `StudentProfile` and injects it into the system prompt before the conversation history.
- Redis caches the profile (TTL 24h) to avoid a DB read on every message.

---

### 1.2 — Emotion-Aware Responses

**Problem today:** Mitra's frustration detection is keyword-based ("stop", "useless", "മടുത്തു"). It misses subtler emotional signals — uncertainty ("ഞാൻ confused ആണ്"), family pressure ("അമ്മ engineering വേണം"), or financial anxiety ("fees കൂടുതലാണ്").

**Innovation:** Add an emotion classifier call after each student message. Use a lightweight prompt to classify the emotional state into one of five categories: `neutral`, `excited`, `uncertain`, `anxious`, `frustrated`. Have Mitra adapt its tone and response strategy accordingly — slower pacing for anxious students, more enthusiasm for excited ones, a reassurance template for uncertain ones.

**Implementation sketch:**
- Add `classify_emotion(message, context)` to `GPTCounsellorService` — a fast, cheap GPT-4o-mini call using a single-sentence classification prompt.
- Store `emotional_state` on the `Conversation` model.
- Pass `emotional_state` as a hint in the system prompt: "The student is currently feeling: anxious. Adjust tone accordingly."
- Colleges can see emotional trajectory on the lead detail page — useful signal for the first call.

---

### 1.3 — Mitra's Recommendation Engine (RECOMMEND State Upgrade)

**Problem today:** The `RECOMMEND` state exists but Mitra only has generic knowledge of colleges. It cannot actually recommend real colleges with real data.

**Innovation:** Build a `CollegeKnowledgeBase` that Mitra can query in real time during the RECOMMEND state. When a student says they want B.Tech in Computer Science in Thrissur with a budget of ₹3–5L, Mitra should pull the 3 best matching colleges from the database and mention them by name with a specific reason for each recommendation.

**Implementation sketch:**
- New model: `CollegeProgram` — `tenant`, `course_name`, `annual_fee`, `campus_location`, `ranking`, `specialisations`, `intake_season`, `management_quota_available`.
- Super admin or college admin populates this via a form on the dashboard.
- In the RECOMMEND state, `GPTCounsellorService.get_recommendations(lead_data)` queries `CollegeProgram` filtered by course + location + budget, returns top 3 as structured objects.
- These are injected into the GPT-4o prompt as factual context: "Real colleges matching this student: [list]". Mitra speaks about them naturally.
- This transforms Mitra from a data collector into a genuine counsellor and massively increases student trust and engagement.

---

### 1.4 — Multilingual Expansion: Mitra in Tamil & Hindi

**Problem today:** Mitra is Malayalam-only. Kerala has a significant Tamil-speaking population in districts like Idukki, Palakkad, and Thiruvananthapuram. Students from Tamil Nadu enquiring about Kerala colleges also exist.

**Innovation:** Make Mitra language-aware. Detect the student's language from their first message and respond in that language throughout. Tamil and Hindi should be primary targets. The system prompt already supports language injection.

**Implementation sketch:**
- Add `detect_language(message)` using a lightweight OpenAI call or `langdetect` library — returns `ml`, `ta`, `hi`, or `en`.
- Store `detected_language` on the `Conversation` model.
- Pass language as a directive in the system prompt: "Respond in Tamil. Use Tamil script."
- For TTS on voice calls: Twilio supports `Google.ta-IN-Neural2-A` (Tamil) and `Google.hi-IN-Neural2-A` (Hindi) in `<Say>` — same zero-setup approach as Malayalam.
- No new API keys required. One sprint of work.

---

### 1.5 — Intent Re-Scoring from Conversation Transcript

**Problem today:** `intent_level` is extracted once at the end of the conversation. If a student starts as "curious" but becomes clearly "enroll" by message 8, the lead score still reflects the initial weak signal.

**Innovation:** Run incremental intent extraction after every 3 messages and update `lead.dimension_scores['intent']` in place. This gives a much more accurate score for students who start hesitant but warm up during the conversation.

**Implementation sketch:**
- After every 3rd student message, queue a lightweight Celery task `update_intent_score(conversation_id)`.
- This calls a stripped-down extraction prompt — only returns `intent_level` (much cheaper than full extraction).
- If intent moved from `curious` → `explore` or `explore` → `enroll`, update the lead score immediately and re-categorise.
- Trigger a real-time WebSocket notification to logged-in college users if a lead in their portfolio just moved from Warm to Hot.

---

### 1.6 — GPT Fine-Tuning on Kerala Education Domain

**Problem today:** GPT-4o is a general model. It sometimes produces generic responses about admissions that do not reflect Kerala's specific context — e.g., it may not naturally know about Kerala University affiliations, KTU (APJ Abdul Kalam Technological University), CUSAT, NTA, KEAM, Cap Allotment process, or the specific course fees landscape in private colleges here.

**Innovation:** Create a fine-tuned GPT-4o (or GPT-4o-mini for cost) specifically trained on Kerala education context — course catalogs, allotment processes, typical fee ranges, popular colleges per district, entrance exam calendars.

**Implementation sketch:**
- Collect training data: 200–300 example conversations where Mitra gives accurate Kerala-specific advice.
- Add a "Kerala Education Context" document as a retrieval-augmented generation (RAG) knowledge base using OpenAI's Assistants API with file search.
- Near-term (no fine-tuning cost): inject a Kerala education factsheet as a system prompt attachment. This alone significantly improves response quality.
- Medium-term: fine-tune GPT-4o-mini on the curated conversation dataset.

---

## 2. Voice & Audio Improvements

### 2.1 — Streaming Voice with WebSocket (Eliminate Polling)

**Problem today:** The voice call flow polls Redis up to 12 times waiting for the Celery task to finish processing. This adds up to 12 seconds of silence on the call — a poor experience for a student expecting a responsive AI counsellor.

**Innovation:** Replace the polling model with a bidirectional WebSocket stream between Twilio and the Django backend using Twilio's Media Streams API. Audio chunks flow in real time, Whisper processes them incrementally, and GPT-4o starts generating before the student has even finished speaking.

**Implementation sketch:**
- Use Twilio `<Connect><Stream url="wss://your-backend/ws/voice-stream/"/>` instead of `<Record>`.
- A new Django Channels consumer `VoiceStreamConsumer` receives raw µ-law encoded audio chunks over WebSocket.
- Chunks are buffered and sent to OpenAI's Whisper streaming endpoint in parallel.
- Once a sentence boundary is detected (silence gap > 500ms), the transcript is sent to GPT-4o.
- GPT-4o streams its response back; each sentence fragment is synthesised by Google Neural2 and played back via the WebSocket.
- End-to-end latency drops from ~12 seconds to ~2–3 seconds.
- This makes Mitra feel like a real phone conversation, not an IVR.

---

### 2.2 — Local Whisper for Privacy & Speed

**Problem today:** All voice transcription is sent to OpenAI's cloud. This adds latency (~400ms per transcription), costs money per minute, and means student audio data leaves your infrastructure.

**Innovation:** Run a `whisper-medium` or `whisper-large-v3` model locally on a GPU inference server (A10G or T4). This brings transcription latency to ~100ms, eliminates per-minute costs, and keeps student voice data entirely on-premises.

**Implementation sketch:**
- Deploy `faster-whisper` (4× faster than original Whisper, same accuracy) on an AWS GPU instance.
- Expose a simple REST endpoint: `POST /transcribe` → returns `{"text": "...", "language": "ml"}`.
- In `WhisperSTTService`, add a `_transcribe_local(audio_bytes)` method that calls this endpoint.
- Fall back to OpenAI Whisper API if the local server is unavailable.
- Cost analysis: at 1,000 voice calls/month averaging 5 minutes each, local Whisper saves approximately ₹15,000/month in API costs versus OpenAI.

---

### 2.3 — Voice Personality Variants for Mitra

**Problem today:** Mitra always uses the same `Google.ml-IN-Neural2-A` voice. There is no way to A/B test whether a different voice performs better.

**Innovation:** Support multiple Mitra voice profiles that can be A/B tested or selected by the college. Google Neural2 offers four Malayalam voices (A, B, C, D). Azure offers SobhaNeural (female) and MidhunNeural (male).

**Implementation sketch:**
- Add `tts_voice` field to `Tenant` model (default: `Google.ml-IN-Neural2-A`).
- The `MITRA_VOICE` constant in `views.py` and `masked_calling.py` becomes tenant-specific.
- Super admin can configure voice per tenant from the admin panel.
- Long term: allow A/B testing — 50% of calls use voice A, 50% use voice B. Track conversion rate by voice variant. Pick the winner after 1,000 calls.

---

### 2.4 — Background Noise Cancellation Before Transcription

**Problem today:** Kerala students often call from busy markets, bus stands, or college canteens. Background noise significantly reduces Whisper's transcription accuracy for Malayalam.

**Innovation:** Apply a noise-cancellation pre-processing step on the audio before sending it to Whisper. `denoiser` (by Facebook Research) or `noisereduce` (Python library) can clean the audio in under 50ms on CPU.

**Implementation sketch:**
- In `WhisperSTTService.transcribe_from_url()`, after downloading the audio bytes, pass them through `noisereduce.reduce_noise()`.
- This is a single pip install (`noisereduce`, `soundfile`, `librosa`) and about 10 lines of code.
- Expected accuracy improvement for noisy environments: 15–25% reduction in transcription errors based on published benchmarks.

---

## 3. Lead Scoring — From Rules to Machine Learning

### 3.1 — Conversion-Feedback Loop for Score Calibration

**Problem today:** The current scoring is a hand-tuned rule system. Weights (Intent=30, Budget=20, etc.) were decided by intuition, not data. A student scored 85 might never convert. A student scored 45 might be the college's best admission.

**Innovation:** Track actual conversion outcomes (`LeadAllocation.conversion_outcome`) and use them to train a gradient boosting model (XGBoost or LightGBM) that predicts conversion probability instead of using the hand-crafted formula. After 3–6 months of data accumulation, this model will be significantly more accurate than the rule system.

**Implementation sketch:**
- After 3 months, export `(lead_data → conversion_outcome)` pairs from the database.
- Train a `ConversionPredictor` model using `scikit-learn`'s `GradientBoostingClassifier`.
- Serialise the model with `joblib` and load it in `LeadScoringService` as a shadow model.
- Run both models in parallel for 30 days. Compare their predictions against actual outcomes.
- When the ML model outperforms the rule system (measured by precision@top-20%), switch it to primary.
- Store trained models in S3 with versioning. Roll back is a single config change.

---

### 3.2 — Behavioural Signals Beyond Conversation

**Problem today:** The score is computed only from the 5 profile fields Mitra extracts. It ignores rich behavioural signals available in the conversation itself.

**Innovation:** Extract and score additional behavioural signals from the conversation transcript:

| Signal | Scoring insight |
|---|---|
| Number of messages sent | More messages = more engaged |
| Average response time | Fast replies = high interest |
| Questions asked by student | "ഫീസ് ennatha?" shows serious intent |
| Length of student messages | Long responses indicate engagement |
| How many times student mentioned a specific college | Strong preference signal |
| Student initiated the conversation (vs. ad redirect) | Organic enquiries convert better |
| Time of day of contact | Evening/night contacts may be post-school serious students |

**Implementation sketch:**
- Add a `BehaviouralSignalExtractor` class in `services/ai/`.
- After conversation completion, compute these 7 signals from the `Message` records.
- Store them in `lead.dimension_scores` as additional JSON fields.
- Feed them into the scoring formula (initially as a 10-point "Engagement" dimension, replacing Completeness).

---

### 3.3 — Score Confidence Intervals

**Problem today:** A lead with score 68 and a lead with score 72 are shown as fundamentally different (Warm vs Hot) even though the difference is within noise. Colleges make different follow-up decisions based on this distinction.

**Innovation:** Add a confidence range to every score. Instead of showing "Score: 68", show "Score: 68 ± 8". This communicates that the actual conversion probability is somewhere in the [60–76] range, which is the honest representation for a deterministic rule model.

**Implementation sketch:**
- Add `score_confidence` field to the `Lead` model (integer, default 10).
- `LeadScoringService.compute()` calculates confidence based on data completeness — a fully-complete lead (all 5 fields confirmed) has ±5 confidence. A partial lead with only 3 fields filled has ±15.
- Frontend score ring shows the confidence band as a lighter outer arc.
- Colleges can filter leads by "score range" instead of fixed category — e.g., show all leads where the confidence interval overlaps with ≥70.

---

## 4. New Communication Channels

### 4.1 — Instagram DM Integration

**Problem today:** Kerala college ads primarily run on Instagram. When a student clicks "Send Message" on an Instagram ad, they go to Instagram DMs — not WhatsApp. This lead is lost.

**Innovation:** Integrate with the Meta Messaging API to handle Instagram Direct Messages. Mitra should be able to counsel students over Instagram DM with the exact same conversation logic.

**Implementation sketch:**
- Create a new `InstagramDMWebhookView` in `apps/webhooks/views.py`.
- Register a new webhook URL with Meta's Webhook API: `/api/webhooks/instagram/`.
- The Instagram message format is slightly different from WhatsApp but both use the Meta Graph API for sending replies.
- A `channel` field already exists on `Student.consent_given` — add `instagram_dm` as a valid value.
- The same `WhatsAppHandler.handle_incoming()` logic works; only the transport layer (send method) changes.
- This single integration likely doubles the number of leads captured, since Instagram is the primary ad platform for this audience.

---

### 4.2 — Web Chat Widget

**Problem today:** EduLeads Kerala has no web presence that students can interact with. College websites cannot embed Mitra on their own sites.

**Innovation:** Build an embeddable JavaScript chat widget that colleges can add to their own website with a single `<script>` tag. The widget opens a chat window where Mitra runs in the browser, with the same conversation logic as WhatsApp.

**Implementation sketch:**
- Build a `ChatWidget` React component that connects to the existing WebSocket endpoint (`ws/leads/{lead_id}/`).
- For first contact, the widget makes an anonymous `POST /api/chat/start/` that creates a temporary `Student` record with a browser-generated fingerprint.
- Package the component as a standalone UMD bundle via Vite: `chat-widget.umd.js`.
- Colleges embed it: `<script src="https://edulead.in/widget/chat-widget.umd.js" data-tenant="college-slug"></script>`
- Leads created through the widget appear in the college's dashboard with `source: web_widget`.
- Consent is captured via a checkbox in the widget UI before the first message.
- This creates a second acquisition channel that runs 24/7 on the college's own website.

---

### 4.3 — SMS Fallback Channel

**Problem today:** Some students in rural Kerala do not use WhatsApp. Basic phone and SMS is still common in Wayanad, Idukki, and parts of Kasaragod.

**Innovation:** When a WhatsApp message delivery fails after 30 minutes (Twilio `undelivered` status), automatically fall back to SMS. Mitra's responses are already text-only and work perfectly in SMS format if kept under 160 characters (or split across multiple SMS segments).

**Implementation sketch:**
- Monitor Twilio message status callbacks. If `status == 'undelivered'` after 30 min, queue `send_sms_fallback` Celery task.
- Truncate or summarise Mitra's response to ≤ 300 characters for SMS.
- Use the same Twilio account — SMS uses the same `TWILIO_ACCOUNT_SID`.
- Track `preferred_channel` on the `Student` model: `whatsapp`, `sms`, `voice`. After 2 failed WhatsApp deliveries, mark the student as `preferred_channel: sms`.

---

### 4.4 — WhatsApp Business API Upgrade (Cloud API)

**Problem today:** The current integration uses Twilio as a WhatsApp gateway. Twilio adds a per-message markup on top of Meta's rates, and limits some WhatsApp features like interactive buttons, list messages, and carousel templates.

**Innovation:** Migrate to Meta's official WhatsApp Business Cloud API. This removes the Twilio middleman, cuts messaging costs by ~40%, and unlocks interactive message types that dramatically improve the counselling experience.

**Unlocked features:**
- **List messages** — Mitra can present 4–5 course options as a tappable list instead of typing them out.
- **Quick reply buttons** — "Yes / No / Tell me more" buttons reduce friction and improve response quality.
- **Template messages** — Send structured follow-up messages (admission reminders, result notifications) that don't count against the session window.
- **Reaction support** — Mitra can "react" to a student's message with 👍 to acknowledge receipt while processing.

**Implementation sketch:**
- New `WhatsAppCloudAPIHandler` class in `services/communications/`.
- Replace `self.twilio_client.messages.create(...)` with `httpx.post(META_API_URL, json=payload)`.
- Meta webhook signature validation replaces Twilio signature validation in middleware.
- Keep Twilio as fallback during the migration period — route 10% of traffic to the new handler, monitor, then increase.

---

## 5. Student Experience

### 5.1 — Student Portal (Progressive Web App)

**Problem today:** Students interact with Mitra only through WhatsApp or phone. There is no web interface where a student can see their own profile, check which colleges have received their information, or update their preferences.

**Innovation:** Build a lightweight student-facing Progressive Web App. The student receives a unique link via WhatsApp after their conversation completes. This link opens a minimal portal where they can:
- See their lead profile (name, course, location, budget, score category shown as "Your match strength")
- See anonymised college names matched to them ("3 colleges in Thrissur are interested in your profile")
- Update their preferences ("I changed my mind — I now want MBA not B.Tech")
- Request data deletion (GDPR right to erasure)
- Schedule a callback from a college counsellor

**Implementation sketch:**
- New Django app `apps/student_portal/` with JWT-based authentication using a one-time link sent via WhatsApp.
- One-time link format: `/student/{signed_token}` — Django signs the student ID with `TimestampSigner` (valid 7 days).
- Vite builds the student portal as a separate entry point under `/portal/`.
- New serializer `StudentPublicProfileSerializer` — shows only non-sensitive fields and anonymised college info.
- When a student updates preferences, a `rescore_and_reallocate` Celery task runs immediately.

---

### 5.2 — Proactive Re-Engagement Campaigns

**Problem today:** If a student completes the conversation in February but admission season is April, there is no mechanism to re-engage them with timely information.

**Innovation:** Build an automated nurture campaign system. Define campaign templates with trigger conditions. For example: "15 days before KEAM result date, message all students in our database who expressed interest in Engineering in Kerala."

**Campaign types:**
- **Date-based:** "KEAM results are out. Log in to see your matched colleges."
- **Score threshold:** "Your profile score increased to Hot. More colleges are now interested."
- **Inactivity re-engagement:** "It has been 30 days since we spoke. Are you still planning to apply this year?"
- **Event-based:** "Admission open day at [College] on Saturday. You matched their criteria."

**Implementation sketch:**
- New model `CampaignTemplate` — `message_template` (Jinja2), `trigger_type` (date/score/inactivity/event), `trigger_config` (JSON), `target_filter` (JSON query).
- New Celery beat task `check_campaign_triggers_daily` — evaluates all active campaigns against the student database.
- Students who match receive a WhatsApp template message (pre-approved with Meta).
- Campaign performance tracked: sent, delivered, read, responded, converted.

---

### 5.3 — Mitra's Post-Conversation Satisfaction Survey

**Problem today:** There is no feedback loop from students about their experience with Mitra. You have no way of knowing if Mitra's responses were helpful, confusing, or inappropriate.

**Innovation:** 24 hours after a conversation completes, send a single WhatsApp message to the student: "Hi [name], how was your experience talking with Mitra? Reply 1 (Very helpful) / 2 (Somewhat helpful) / 3 (Not helpful)." Store the rating on the `Conversation` model.

**Implementation sketch:**
- New Celery beat task `send_satisfaction_surveys_daily` — finds conversations completed 24 hours ago without a survey sent.
- Sends a single WhatsApp message via Twilio with `SatisfactionSurveyTemplate`.
- Incoming replies of "1", "2", or "3" in the subsequent 48-hour window are matched to the survey and stored.
- Aggregate satisfaction score visible on the super admin analytics page.
- Low-rated conversations (score=3) are flagged for manual review by the super admin.

---

## 6. College & Agency Tools

### 6.1 — Smart Lead Inbox with Auto-Prioritisation

**Problem today:** The college dashboard shows leads in allocation order. A college user must manually scan through the list to find who to call first.

**Innovation:** Build an "Inbox" view that auto-sorts leads by a composite priority score: raw lead score + recency + whether the student has been contacted yet + historical conversion rate for similar profiles at this college. The lead the system thinks is most likely to convert today is always at the top.

**Implementation sketch:**
- New `InboxPriorityScore` computed field on `LeadAllocation`:
  `priority = (lead.score * 0.5) + (recency_score * 0.3) + (college_match_score * 0.2)`
  where `recency_score` decays from 100 to 0 over 14 days, and `college_match_score` is based on how well this lead's profile matches the college's historical conversion patterns.
- The inbox endpoint `GET /api/leads/inbox/` returns leads sorted by `InboxPriorityScore`.
- Frontend shows a "Best to call today" section at the top of the leads page, separate from the full lead list.

---

### 6.2 — Call Outcome Logging (Post-Call Form)

**Problem today:** Colleges contact students outside the platform (direct call, WhatsApp from personal number) and there is no way to record what happened. Conversion data is sparse.

**Innovation:** After a masked call ends, automatically show a post-call form in the dashboard: "How did the call go?" with structured outcomes: `No answer / Interested — will apply / Not interested / Wrong number / Asked to call back`. If "call back" is selected, show a date picker and create a reminder task.

**Implementation sketch:**
- `CallRecord.ended_at` triggers a WebSocket push to the college user's dashboard.
- A non-blocking modal appears: "Call to [Student name] ended. What was the outcome?"
- College user selects outcome + optional notes.
- `PATCH /api/leads/{id}/call-outcome/` updates `LeadAllocation.conversion_outcome` and `Lead.status`.
- Reminders stored in a new `FollowUpTask` model with Celery beat processing.
- Aggregate call outcome data feeds into the college's analytics and informs the ML scoring model (Section 3.1).

---

### 6.3 — College Performance Benchmarking

**Problem today:** Colleges have no idea whether their conversion rate is good or bad compared to similar colleges on the platform.

**Innovation:** Show anonymised benchmarking data in the analytics section: "Your conversion rate is 12%. Top colleges on this platform convert 28% of Hot leads." This motivates colleges to improve their follow-up process and creates a sticky "performance improvement" narrative.

**Implementation sketch:**
- New analytics endpoint `GET /api/analytics/benchmark/` — returns platform percentiles for: response time to new lead, conversion rate by category, calls made per lead.
- Data is anonymised — no tenant names revealed, only aggregate buckets.
- Frontend renders a simple percentile chart: "You are in the 42nd percentile for response time."
- Super admin can disable benchmarking per tenant if requested.

---

### 6.4 — Separate Agency Dashboard

**Problem today:** Agencies (lead aggregators/brokers) use the same dashboard as colleges, but their workflow is completely different. Agencies don't directly admit students — they distribute leads to multiple colleges and earn a commission.

**Innovation:** Build a dedicated Agency Dashboard with different primary KPIs: leads received, leads forwarded to client colleges, commission earned per lead, client college performance overview.

**Implementation sketch:**
- New `AgencyClient` model: `agency_tenant`, `college_tenant`, `commission_per_lead`, `active`.
- Agency dashboard page shows: total leads in portfolio, leads forwarded (by client), pipeline value.
- New API endpoints under `/api/agency/` for agency-specific operations.
- `AgencyRoute` guard in the frontend — same as `AdminRoute` but checks `tenant_type == 'agency'`.

---

### 6.5 — Bulk Lead Import for Existing Databases

**Problem today:** Many colleges have existing databases of prospective students from admission fairs, entrance exam portal partnerships, or their own websites. There is no way to import these into EduLeads and run them through the scoring and allocation system.

**Innovation:** Allow colleges to upload a CSV/Excel file of existing leads. The system imports them, scores each record with whatever fields are available, and adds them to the college's allocation pool. For partial profiles, the system can trigger a WhatsApp message to the student inviting them to complete their profile with Mitra.

**Implementation sketch:**
- New admin endpoint `POST /api/leads/import/` — accepts multipart CSV upload.
- A Celery task processes each row: validate fields, create `Student` + `Lead` records, run `LeadScoringService`.
- For leads with incomplete profiles, optionally send a WhatsApp message: "Hi [name], [College] shared your contact with us. Would you like to answer 3 quick questions to match you with the right course?"
- Import progress shown in real time via WebSocket.
- Duplicate detection: if a phone number already exists in the system, update the existing record rather than create a duplicate.

---

## 7. Analytics & Predictive Intelligence

### 7.1 — Lead Velocity Forecasting

**Problem today:** Colleges find out they have exhausted their quota only when it happens. There is no forward-looking visibility.

**Innovation:** Show a quota velocity forecast: "At your current lead intake rate, your Pro quota of 30 will be exhausted in 8 days. Upgrade to Premium to continue receiving leads." This creates natural upsell moments and prevents unpleasant surprises.

**Implementation sketch:**
- Calculate rolling 7-day lead intake rate for each tenant.
- `days_until_exhaustion = remaining_quota / daily_rate`
- Show a forecast banner in the dashboard when `days_until_exhaustion < 14`.
- Trigger an email + in-app notification at 14 days, 7 days, and 3 days remaining.
- This is one of the highest-ROI analytics features for revenue — it directly drives plan upgrades.

---

### 7.2 — Admission Season Demand Heatmap

**Problem today:** The super admin analytics page shows historical data but does not visualise geographic or course-level demand patterns.

**Innovation:** Build an interactive demand heatmap: a map of Kerala districts where heat intensity represents number of students enquiring per course. Colleges can use this to see which districts are underserved for their courses — a powerful sales tool for the platform.

**Implementation sketch:**
- Use `lead.location` (district) and `lead.course_interest` as the two dimensions.
- Aggregate counts with a `GROUP BY location, course_interest` query.
- Frontend: use `react-simple-maps` or Leaflet with Kerala GeoJSON to render the heatmap.
- Add a course filter dropdown — "Show demand for: [B.Tech / MBA / MBBS / ...]".
- Super admin can export the heatmap data as CSV. Useful for sales conversations with prospective colleges.

---

### 7.3 — Conversion Attribution Model

**Problem today:** When a student converts (gets admission), the platform records it, but there is no analysis of what factors led to conversion — was it the masked call? The lead score? The speed of follow-up?

**Innovation:** Build a conversion attribution model that identifies the strongest predictors of conversion for each college. Outputs like "Colleges that call within 2 hours of receiving a lead convert 3× more than those who call the next day" give colleges actionable intelligence.

**Implementation sketch:**
- After accumulating 500+ conversions on the platform, run a logistic regression on features: `time_to_first_call`, `number_of_calls_made`, `lead_score`, `lead_category`, `college_plan`, `student_location`.
- Display top 3 actionable insights per college on their analytics page.
- Update monthly as new conversion data arrives.

---

### 7.4 — Real-Time Platform Health Dashboard (Super Admin)

**Problem today:** The super admin has no operational visibility — no way to see if Mitra is responding slowly, if Celery tasks are backing up, or if WhatsApp delivery rates have dropped.

**Innovation:** Build a real-time operational health page in the admin panel showing:
- Average GPT-4o response time (last 100 calls)
- Celery queue depth (pending tasks)
- WhatsApp delivery rate (last 1 hour)
- Active voice calls (live)
- Failed tasks in the last 24 hours (with error type breakdown)
- Redis memory usage

**Implementation sketch:**
- Each Celery task records its duration and outcome to a `TaskMetrics` table (or a Redis sorted set for efficiency).
- New endpoint `GET /api/admin/health/` returns a JSON snapshot of all health indicators.
- Frontend auto-refreshes every 30 seconds.
- Red/Amber/Green traffic light icons for each indicator based on configured thresholds.
- This replaces the need for Grafana/Prometheus in early production and gives the super admin actionable visibility without external tooling.

---

## 8. Billing & Business Model

### 8.1 — Pay-Per-Lead Model (Alternative to Subscription)

**Problem today:** Smaller colleges with irregular admission seasons don't want to pay ₹2,999/month for 10 months when they only need leads in February–April.

**Innovation:** Add a Pay-Per-Lead pricing tier. Colleges pay ₹299 per Hot lead, ₹149 per Warm lead, ₹49 per Cold lead. No monthly commitment. This dramatically lowers the barrier to entry and opens the platform to smaller colleges and individual departments.

**Implementation sketch:**
- New plan type: `pay_per_lead` in the `Tenant` model.
- Instead of quota, maintain a `credit_balance` (in paise) on the tenant.
- When a lead is allocated, deduct the appropriate credit.
- At zero balance, pause allocation and send a top-up prompt.
- Razorpay payment links used for credit top-ups (₹5,000, ₹10,000, ₹25,000 credit packs).
- This model appeals to colleges that are already interested but hesitate at the subscription commitment.

---

### 8.2 — Commission-Based Model for Conversions

**Problem today:** The platform's revenue is entirely from subscriptions, not tied to actual admissions. Colleges that convert 1% and colleges that convert 25% pay the same amount.

**Innovation:** Add an optional "Success Fee" tier. Colleges on this tier pay a lower subscription (₹999/month) but pay ₹1,500 per confirmed admission through the platform. The platform earns more when the college earns more — fully aligned incentives.

**Implementation sketch:**
- New model `AdmissionConfirmation` — college marks a lead as `converted_admission` and uploads proof (PDF upload to S3).
- Super admin reviews and approves the confirmation.
- On approval, Razorpay payment link for `ADMISSION_FEE` is sent to the college.
- A 7-day payment window applies. Non-payment freezes new lead allocation.
- This model requires a verification step but builds enormous trust — the platform only earns when the college earns.

---

### 8.3 — Referral Program for Colleges

**Problem today:** There is no mechanism for colleges to refer other colleges to the platform. Organic word-of-mouth in the Kerala education sector is powerful but uncaptured.

**Innovation:** Give each college a unique referral code. When a new college signs up using their code, both colleges get 1 month of free quota. The referring college earns ₹500 credit for every month their referral remains an active subscriber.

**Implementation sketch:**
- Add `referral_code` (auto-generated UUID prefix) and `referred_by` FK on the `Tenant` model.
- Registration form includes an optional "Referral code" field.
- A Celery beat task checks active referrals monthly and credits the referrer's account.
- Super admin can see referral network graph in analytics.

---

## 9. Platform Expansion

### 9.1 — Pan-India Expansion (Phase 2 States)

**Problem today:** EduLeads is Kerala-only. The Indian education lead market is massive — Tamil Nadu, Karnataka, Maharashtra, and Telangana each have larger college ecosystems than Kerala.

**Innovation roadmap:**

| Phase | States | What changes |
|---|---|---|
| Phase 1 (now) | Kerala | Malayalam TTS/STT, Kerala geography |
| Phase 2 | Tamil Nadu + Karnataka | Tamil + Kannada TTS, regional geography, local college knowledge |
| Phase 3 | Maharashtra + Telangana | Marathi + Telugu, JEE/MHT-CET context |
| Phase 4 | All India | Hindi-primary with regional overlays |

**Technical requirements per state:**
- New `market` field on `Tenant` and `Lead` models.
- Language-detected TTS voice (Twilio has Neural2 voices for Tamil, Kannada, Telugu, Marathi, Hindi).
- State-specific college program knowledge base.
- State-specific entrance exam calendar in Mitra's prompt context.
- Regional phone number pools from Twilio.

---

### 9.2 — White-Label Product for Large College Groups

**Problem today:** Large college groups (like MG University affiliates, CUSAT network, LBS institutions) may want their own branded version of Mitra — "Meet Priya, your CUSAT counsellor" — rather than the generic EduLeads branding.

**Innovation:** Build a white-label offering. The college group gets their own subdomain (`cusat.edulead.in`), their own AI name and personality, a custom WhatsApp number, and branded dashboard. Under the hood it runs on the exact same infrastructure.

**Implementation sketch:**
- New `Brand` model: `tenant`, `ai_name`, `ai_personality_prompt`, `primary_colour`, `logo_url`, `custom_domain`.
- `GPTCounsellorService` reads `Brand.ai_personality_prompt` and injects it as the system prompt prefix.
- `_twiml_say()` reads `Brand.tts_voice` from the tenant's brand config.
- Frontend reads `Brand.primary_colour` and `Brand.logo_url` from a `GET /api/brand/` endpoint on load.
- White-label is priced at a custom enterprise contract (₹50,000+/month) with dedicated support.

---

### 9.3 — Mitra for Schools (Grade 10–12 Counselling)

**Problem today:** EduLeads targets students already looking for colleges. But the decision process starts earlier — Grade 10 students choosing their Plus Two stream, and Grade 12 students preparing for entrance exams.

**Innovation:** A separate product line: **Mitra for Schools**. Schools subscribe to give their students access to Mitra for career and stream counselling. Mitra helps Grade 10 students choose between Science/Commerce/Humanities, prepares them for the decision, and generates a "career readiness report" for parents.

**Implementation sketch:**
- New `product_type` field on `Tenant`: `college`, `school`, `agency`.
- A school-specific system prompt for Mitra covering Grade 10 stream selection and Grade 12 entrance exam guidance.
- A student "Career Report" PDF generated after the conversation — GPT-4o writes a personalised 1-page summary of the student's interests, recommended streams, and suggested colleges for the future.
- Schools pay per-student or by annual subscription.
- Leads from school conversations can be optionally shared to the college marketplace 2 years later (with consent).

---

## 10. Technical Infrastructure

### 10.1 — Event Sourcing for Lead History

**Problem today:** The `Lead` model stores only the current state. There is no history of how a lead's score changed over time, who changed its status, or when it was reallocated.

**Innovation:** Implement an event sourcing pattern for lead state changes. Every significant event (`scored`, `allocated`, `status_changed`, `re-scored`, `decayed`, `phone_revealed`) is appended to an immutable `LeadEvent` log. The current lead state is derived from replaying these events.

**Benefits:**
- Full audit trail for compliance.
- Ability to "time-travel" — see what a lead looked like at any past point.
- Analytics on event timelines — how long do leads spend in each status?
- Debugging — trace exactly why a lead was scored 72 on a specific date.

**Implementation sketch:**
- New model `LeadEvent`: `lead`, `event_type`, `payload` (JSON), `created_at`, `created_by`.
- Every service that modifies a lead also calls `LeadEventService.record(lead, event_type, payload)`.
- New admin endpoint `GET /api/admin/leads/{id}/events/` — returns the full event timeline.
- Eventually, replace `Lead.score` with a computed property derived from event replay for full consistency.

---

### 10.2 — Multi-Region Active-Active Deployment

**Problem today:** All compute runs in a single region. A Kerala college calling at 10pm during peak admission season and an outage in ap-south-1 takes down the entire platform.

**Innovation:** Deploy to two AWS regions: `ap-south-1` (Mumbai) as primary and `ap-southeast-1` (Singapore) as secondary. Use Route 53 latency-based routing to direct traffic to the nearest healthy region. PostgreSQL uses RDS Global Database for cross-region replication.

**Why this matters:** During KEAM result day (typically June), 10,000+ students may message Mitra within a 2-hour window. Active-active across two regions doubles the throughput ceiling.

---

### 10.3 — Offline-First Celery Task Queue with Dead Letter Queue

**Problem today:** If a Celery task fails after 3 retries, it disappears. There is no way to recover it, inspect the failure, or retry it manually.

**Innovation:** Implement a Dead Letter Queue (DLQ) using Redis streams. Every task that exhausts its retry budget is moved to a DLQ stream instead of being dropped. The super admin can see DLQ contents and individually retry or discard them.

**Implementation sketch:**
- Add a `task_failed` signal handler in `config/celery.py` — when `max_retries` is exceeded, push `{task_name, args, kwargs, error, timestamp}` to a Redis stream `celery:dlq`.
- New admin endpoint `GET /api/admin/dlq/` — returns DLQ contents.
- `POST /api/admin/dlq/{id}/retry/` — pops the task from DLQ and re-queues it.
- The health dashboard (Section 7.4) shows DLQ depth as a key operational metric.

---

### 10.4 — GraphQL API for Flexible Client Queries

**Problem today:** The REST API is rigid — each endpoint returns a fixed set of fields. The frontend makes multiple API calls to assemble a single page's data (leads list + quota + recent conversions = 3 separate requests).

**Innovation:** Add a GraphQL API alongside the existing REST API. The college dashboard can fetch exactly the fields it needs in a single round trip. This is especially valuable for the student portal (Section 5.1) where a lightweight mobile client needs a custom data shape.

**Implementation sketch:**
- Add `strawberry-graphql-django` to the backend.
- Define `Query` types for `Lead`, `Tenant`, `LeadAllocation`.
- The dashboard's overview page goes from 3 API calls to 1 GraphQL query.
- REST API is kept for webhook endpoints — GraphQL is additive only.

---

## 11. Compliance & Trust

### 11.1 — DPDP Act Compliance (Digital Personal Data Protection Act 2023)

**Problem today:** India's DPDP Act came into effect in 2023. It requires explicit consent for processing personal data, the right to erasure, and data localisation for sensitive data. The current consent system (`Student.consent_given`) is a good start but is not fully compliant.

**Required additions:**

| Requirement | Current status | What needs to change |
|---|---|---|
| Purpose limitation | Not recorded | Store `consent_purpose` explicitly on each data point |
| Consent withdrawal | Soft-delete exists | Must stop all processing within 24 hours and confirm by message |
| Data principal access | No student portal | Implement student data export (Section 5.1) |
| Data localisation | No explicit constraint | Ensure all student data stays in Indian AWS regions (ap-south-1) |
| Grievance officer | Not appointed | Add a `GRIEVANCE_OFFICER_EMAIL` setting and expose it in the privacy policy |
| Consent receipt | Not sent | Send a WhatsApp confirmation after consent is recorded |

**Implementation sketch:**
- Extend the `ConsentService` to send a WhatsApp confirmation message with the exact purposes for which data will be used.
- Add `consent_version` to track which version of the consent text was agreed to.
- Build a `DataPrincipalRequestView` — students can request export or deletion via a web form (no login required — uses phone number OTP verification).
- Add S3 bucket policy that restricts replication to Indian regions only.

---

### 11.2 — End-to-End Conversation Encryption

**Problem today:** Conversation messages are stored in plain text in the `Message` model. Anyone with database access can read every conversation.

**Innovation:** Encrypt conversation message content at rest using per-student Fernet keys (the same approach already used for phone numbers). The encryption key is derived from `SECRET_KEY + student_id` — this means revoking a student's data means deleting their key, after which their messages are permanently unreadable.

**Implementation sketch:**
- Add `encrypt_message(student_id, text)` and `decrypt_message(student_id, ciphertext)` functions to `services/compliance/`.
- Modify `Message.content` to be stored as ciphertext.
- `Message.content` property getter auto-decrypts on access.
- Existing messages can be migrated in a one-time management command `encrypt_legacy_messages`.

---

### 11.3 — SOC 2 Type II Readiness Checklist

For EduLeads to sell to large institutions and enterprise clients, SOC 2 compliance is increasingly expected. The following controls are the highest-priority gaps:

| Control | Priority | Status |
|---|---|---|
| Access logs for all admin actions | High | AuditLog model exists — ensure 100% coverage |
| MFA for all admin accounts | High | TOTP exists — enforce it as mandatory for superadmin |
| Automated vulnerability scanning | High | Add Dependabot + Snyk to CI/CD pipeline |
| Incident response playbook | Medium | Document + store in the repo |
| Penetration test report | Medium | Commission annually once production |
| Data backup verification | High | Automate restore testing monthly |
| Employee access review | Medium | Quarterly review of which users have superadmin access |

---

## 12. Integration Ecosystem

### 12.1 — CRM Integration (HubSpot, Salesforce, Zoho)

**Problem today:** Larger colleges and agencies already use HubSpot or Zoho CRM to manage their admissions pipeline. They have to duplicate data between EduLeads and their CRM.

**Innovation:** Build native CRM integrations. When a lead is allocated to a college, it is automatically pushed to their CRM as a new contact with all lead data mapped to CRM fields. Two-way sync: when the college marks a lead as "Converted" in HubSpot, it reflects back in EduLeads.

**Implementation sketch:**
- New model `CRMIntegration`: `tenant`, `crm_type` (hubspot/zoho/salesforce), `api_key` (encrypted), `field_mapping` (JSON).
- A `CRMSyncService` with provider-specific adapters: `HubSpotAdapter`, `ZohoAdapter`.
- On `LeadAllocation` creation, if the tenant has an active CRM integration, queue `sync_lead_to_crm` Celery task.
- Webhook from CRM → `POST /api/webhooks/crm/` to handle status updates coming back in.

---

### 12.2 — College ERP Integration (Fedena, Campusoft)

**Problem today:** When a student is admitted, the college still has to manually re-enter all the student data into their ERP system (Fedena, Campusoft, or custom-built).

**Innovation:** When a lead's status is set to `converted`, automatically push the student's data to the college's ERP via their API. This eliminates double data entry and makes EduLeads the top-of-funnel for the entire student lifecycle.

**Implementation sketch:**
- Similar adapter pattern to CRM integration above.
- `ERPPushService` with Fedena REST API and Campusoft API adapters.
- On `lead.status == 'converted'` event, trigger `push_student_to_erp` Celery task.
- Map EduLeads fields → ERP student record fields.
- Super admin can test the connection and view push logs.

---

### 12.3 — KEAM / JEE Score Integration

**Problem today:** Mitra asks students about their "intent" and "timeline" but has no access to actual entrance exam scores. A student who scored in the top 5% of KEAM is a fundamentally different lead than one who did not take the exam — but the scoring system cannot distinguish them.

**Innovation:** Partner with NTA (National Testing Agency) or scrape public KEAM rank lists to build a lookup service. If a student provides their application number or roll number, Mitra can verify their rank and use it as an additional scoring dimension.

**Implementation sketch:**
- New Mitra conversation state: `EXAM_SCORE_COLLECT` (optional, between INTENT_QUALIFY and RECOMMEND).
- "Would you like to share your KEAM rank or JEE percentile for a more accurate college match? (Completely optional)"
- If provided, call `KEAMRankLookupService.verify(application_number)` — validates the rank from the public NTA data.
- A verified KEAM rank in the top 10% adds 15 bonus points to the lead score (new dimension).
- This creates a strong competitive advantage — EduLeads leads have verified academic credentials, which colleges trust far more.

---

*Document version: May 2026. Review this roadmap quarterly against platform growth metrics. Prioritise items that directly increase either lead volume (top-line) or conversion rate (value delivered to colleges).*
