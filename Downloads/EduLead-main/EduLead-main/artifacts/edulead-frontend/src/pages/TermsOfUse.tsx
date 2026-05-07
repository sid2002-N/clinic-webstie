import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import SEOHead from '@/components/SEOHead';
import { EduLeadsLogo } from '../components/EduLeadsLogo';

const LAST_UPDATED = '3 May 2026';
const EFFECTIVE_DATE = '3 May 2026';
const COMPANY = 'EduLeads Kerala Private Limited';
const ADDRESS = 'Kochi, Kerala – 682 001, India';
const EMAIL = 'legal@eduleads.in';
const SUPPORT_EMAIL = 'support@eduleads.in';

const TOC = [
  { id: 'acceptance', label: '1. Acceptance of Terms' },
  { id: 'definitions', label: '2. Definitions' },
  { id: 'eligibility', label: '3. Eligibility' },
  { id: 'platform', label: '4. Platform & Services' },
  { id: 'accounts', label: '5. Accounts & Registration' },
  { id: 'subscriptions', label: '6. Subscriptions & Billing' },
  { id: 'student-data', label: '7. Student Data & Lead Ethics' },
  { id: 'acceptable-use', label: '8. Acceptable Use Policy' },
  { id: 'ip', label: '9. Intellectual Property' },
  { id: 'confidentiality', label: '10. Confidentiality' },
  { id: 'disclaimer', label: '11. Disclaimers & Warranties' },
  { id: 'liability', label: '12. Limitation of Liability' },
  { id: 'indemnity', label: '13. Indemnification' },
  { id: 'termination', label: '14. Suspension & Termination' },
  { id: 'governing-law', label: '15. Governing Law & Disputes' },
  { id: 'miscellaneous', label: '16. Miscellaneous' },
  { id: 'contact', label: '17. Contact' },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 48, scrollMarginTop: 90 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        {children}
      </div>
    </section>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ marginBottom: 14, ...style }}>{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 6, listStyleType: 'disc' }}>{item}</li>
      ))}
    </ul>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>;
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</p>
      {children}
    </div>
  );
}

export default function TermsOfUse() {
  return (
    <div style={{ fontFamily: 'var(--font)', color: 'var(--text-primary)', paddingTop: 64 }}>
      <SEOHead
        title="Terms of Use"
        description="Review the Terms of Use for EduLeads Kerala — the conditions under which colleges and students access our AI-powered admissions platform."
        canonical="/terms-of-use"
      />

      {/* Navbar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: 'rgba(255,255,255,0.97)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <EduLeadsLogo size={34} />
        </Link>
        <Link to="/" style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to home
        </Link>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>

        {/* Sidebar TOC */}
        <aside className="hidden lg:block" style={{ width: 240, flexShrink: 0, position: 'sticky', top: 90 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 14 }}>Contents</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TOC.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', padding: '5px 10px', borderRadius: 6, transition: 'all 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* Page header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 9999, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', fontSize: 12, fontWeight: 600, color: 'var(--brand-700)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Legal Document
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 16 }}>
              Terms of Use
            </h1>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}><Bold>Effective date:</Bold> {EFFECTIVE_DATE}</p>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}><Bold>Last updated:</Bold> {LAST_UPDATED}</p>
            </div>
            <div style={{ marginTop: 20, padding: '16px 20px', background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 10, fontSize: 14, color: '#92400e', lineHeight: 1.6 }}>
              <Bold>Please read these Terms carefully before using the Platform.</Bold> By registering, subscribing, or accessing any part of the EduLeads Kerala Platform, you confirm that you have read, understood, and agree to be bound by these Terms of Use and our <Link to="/privacy-policy" style={{ color: 'var(--brand-700)' }}>Privacy Policy</Link>. These Terms constitute a legally binding agreement under the <Bold>Indian Contract Act, 1872</Bold>.
            </div>
          </div>

          <Section id="acceptance" title="1. Acceptance of Terms">
            <P>
              These Terms of Use ("<Bold>Terms</Bold>") are a binding contract between you ("<Bold>Subscriber</Bold>", "<Bold>College User</Bold>", "<Bold>you</Bold>", or "<Bold>your</Bold>") and <Bold>{COMPANY}</Bold> ("{COMPANY} / EduLeads Kerala / we / us / our"), a company incorporated under the Companies Act, 2013, having its registered office at {ADDRESS}.
            </P>
            <P>
              These Terms govern your access to and use of the EduLeads Kerala Platform, website at <Bold>eduleads.in</Bold>, associated mobile interfaces, APIs, dashboards, and all related services (collectively, the "<Bold>Platform</Bold>").
            </P>
            <P>
              If you are accessing the Platform on behalf of an educational institution, company, or agency, you represent that you have the authority to bind that entity to these Terms. The term "you" shall then refer to both you individually and that entity.
            </P>
            <P>
              These Terms are published in compliance with the requirements of the <Bold>Information Technology (Intermediaries Guidelines and Digital Media Ethics Code) Rules, 2021</Bold>.
            </P>
          </Section>

          <Section id="definitions" title="2. Definitions">
            <UL items={[
              '"Platform" means the EduLeads Kerala SaaS platform, including the web dashboard, APIs, AI counsellor (Mitra), and all related services.',
              '"Subscriber" or "Tenant" means an educational institution, college, university, coaching centre, or agency that has registered and subscribed to the Platform.',
              '"College User" means any individual (admin, staff, or team member) associated with a Subscriber account.',
              '"Student" means a prospective student who interacts with Mitra on WhatsApp.',
              '"Lead" means a qualified Student record generated through Mitra\'s conversation, allocated to a Tenant.',
              '"Mitra" means the AI-powered WhatsApp counsellor operated by EduLeads Kerala using OpenAI\'s GPT-4.',
              '"Plan" means a subscription tier (Basic, Pro, or Premium) with defined features, lead quotas, and pricing.',
              '"Quota" means the maximum number of Leads allocated to a Subscriber per billing cycle.',
              '"Confidential Information" means any non-public information disclosed by either party, including Lead data, pricing, business strategy, and technical architecture.',
            ]} />
          </Section>

          <Section id="eligibility" title="3. Eligibility">
            <P>To use the Platform as a Subscriber, you must:</P>
            <UL items={[
              'Be a legally registered educational institution, agency, or business entity in India;',
              'Have at least one authorised representative who is 18 years of age or older;',
              'Provide accurate registration information, including a valid GST number (if applicable) and official email address;',
              'Not be barred from entering contracts under the Indian Contract Act, 1872 (i.e., not be of unsound mind, not be insolvent, and not be otherwise disqualified);',
              'Agree to comply with all applicable laws, including the University Grants Commission (UGC) guidelines, AICTE norms, and any state-level regulation applicable to your institution.',
            ]} />
            <P>
              EduLeads Kerala reserves the right to verify eligibility and reject or terminate any account that does not meet these criteria or that provides false information.
            </P>
          </Section>

          <Section id="platform" title="4. Platform & Services">
            <Sub title="4.1 Core Services">
              <P>The Platform provides:</P>
              <UL items={[
                'Access to the AI counsellor Mitra, which qualifies student leads via WhatsApp in Malayalam;',
                'A lead management dashboard for viewing, filtering, and managing allocated Student Leads;',
                'Lead scoring (0–100) based on intent, course interest, budget, timeline, and completeness;',
                'Masked calling (Pro and Premium plans) — allows college representatives to call students without revealing their personal phone number;',
                'Phone number reveal (Premium plan only) — decrypted student phone number, subject to per-reveal logging;',
                'CSV export of leads (Premium plan only);',
                'Analytics and quota reporting.',
              ]} />
            </Sub>
            <Sub title="4.2 Service Availability">
              <P>
                We aim to maintain 99% uptime for the Platform but do not guarantee uninterrupted service. Scheduled maintenance will be announced at least 24 hours in advance. We are not liable for service disruptions caused by third-party providers (Twilio, OpenAI, Razorpay, AWS) or force majeure events.
              </P>
            </Sub>
            <Sub title="4.3 Service Changes">
              <P>
                We reserve the right to modify, suspend, or discontinue any feature of the Platform at any time with reasonable notice. Material changes that affect your core service will be communicated at least 30 days in advance.
              </P>
            </Sub>
          </Section>

          <Section id="accounts" title="5. Accounts & Registration">
            <UL items={[
              'Each Subscriber account is associated with one Tenant. A Tenant may invite multiple College Users (admins and staff) under their account.',
              'You are responsible for maintaining the confidentiality of your login credentials. You must not share your password with third parties.',
              'You must notify us immediately at ' + SUPPORT_EMAIL + ' if you become aware of any unauthorised access to your account.',
              'We are not liable for losses arising from your failure to maintain account security.',
              'Each registered email address may be associated with only one Subscriber account.',
              'You must keep your account details (name, address, GST number, contact email) accurate and up to date.',
              'Two-factor authentication (2FA) is available and strongly recommended for all admin accounts.',
            ]} />
          </Section>

          <Section id="subscriptions" title="6. Subscriptions & Billing">
            <Sub title="6.1 Plans and Pricing">
              <P>
                The Platform offers three subscription plans: <Bold>Basic (₹2,999/month)</Bold>, <Bold>Pro (₹6,999/month)</Bold>, and <Bold>Premium (₹14,999/month)</Bold>. Each plan includes a defined monthly Lead quota and feature set. Current pricing is published at <Link to="/pricing" style={{ color: 'var(--brand-700)' }}>eduleads.in/pricing</Link>.
              </P>
            </Sub>
            <Sub title="6.2 Billing & Payment">
              <UL items={[
                'All payments are processed by Razorpay Software Pvt. Ltd., a PCI-DSS compliant payment gateway. We do not store card numbers or UPI IDs on our servers.',
                'Subscriptions are billed monthly on the date of activation.',
                'All prices are exclusive of Goods and Services Tax (GST). Applicable GST at the current rate will be added at checkout. A GST-compliant invoice will be issued for each billing cycle.',
                'Failed payments will trigger a retry cycle. If payment is not received within 7 days, the account will be downgraded to read-only access.',
              ]} />
            </Sub>
            <Sub title="6.3 Quota & Rollover">
              <UL items={[
                'Unused lead quota from the current billing cycle carries over to the next cycle, up to a maximum of: 5 leads (Basic), 15 leads (Pro), or 50 leads (Premium).',
                'Rolled-over quota expires at the end of the following billing cycle.',
                'Quota is not transferable between Subscriber accounts.',
              ]} />
            </Sub>
            <Sub title="6.4 Refunds & Cancellation">
              <UL items={[
                'Subscriptions may be cancelled at any time. Cancellation takes effect at the end of the current billing period. No refunds are issued for the unused portion of the current cycle.',
                'Refunds for billing errors (duplicate charges, system errors) will be processed within 7 business days upon verification.',
                'We do not offer refunds solely on the basis that leads did not convert into admissions, as lead quality and conversion depend on factors outside our control.',
              ]} />
            </Sub>
            <Sub title="6.5 Plan Upgrades & Downgrades">
              <P>
                Upgrades take effect immediately and are billed on a pro-rata basis. Downgrades take effect at the start of the next billing cycle. Data associated with higher-tier features (phone reveals, exports) will be retained but inaccessible after downgrade until the plan is upgraded again.
              </P>
            </Sub>
          </Section>

          <Section id="student-data" title="7. Student Data & Lead Ethics">
            <P>
              This section is critical. Subscribers must read and comply with it fully. Violations may result in immediate account termination.
            </P>
            <UL items={[
              'Student Leads are provided solely for the purpose of legitimate admission outreach. You may not use Lead data for any other commercial purpose.',
              'You must not sell, sublicense, or transfer Lead data to any third party, including other educational institutions not on the Platform.',
              'You must contact students only through appropriate channels (phone call, WhatsApp) and only regarding their stated course interest.',
              'You must comply with the Telecom Commercial Communications Customer Preference Regulations (TRAI DND regulations) when contacting students.',
              'You must not contact a student who has registered on the National Do Not Call (NDNC) Registry unless the student has explicitly consented to be contacted.',
              'You must not make false, misleading, or coercive claims to students about admissions, scholarships, seat availability, or fee waivers.',
              'Phone numbers obtained through the Premium "Reveal Phone" feature must not be stored beyond the duration of your subscription. Upon subscription cancellation or downgrade, you must delete all stored student phone numbers.',
              'All student phone reveal actions are logged in an immutable audit trail. We cooperate with law enforcement investigations regarding misuse of student data.',
              'Any use of student data that violates the Consumer Protection Act, 2019, the TRAI Act, 1997, or any applicable UGC/AICTE guidelines is strictly prohibited.',
            ]} />
          </Section>

          <Section id="acceptable-use" title="8. Acceptable Use Policy">
            <P>You agree not to use the Platform to:</P>
            <UL items={[
              'Violate any applicable Indian law, including but not limited to the IT Act, 2000, the IPC, the Consumer Protection Act, 2019, or TRAI regulations;',
              'Upload, post, or transmit content that is defamatory, obscene, harassing, fraudulent, or that infringes on third-party intellectual property rights;',
              'Attempt to gain unauthorised access to any part of the Platform, other Subscriber accounts, or our infrastructure;',
              'Reverse-engineer, decompile, disassemble, or attempt to extract source code from the Platform;',
              'Use automated scripts, bots, or scrapers to extract data from the Platform;',
              'Interfere with or disrupt the Platform\'s servers or networks;',
              'Introduce viruses, trojans, worms, or other malicious code into the Platform;',
              'Misrepresent your institution\'s identity, accreditation status, or course offerings to students;',
              'Create multiple Subscriber accounts to circumvent quota limits;',
              'Use the Platform to conduct any unlicensed collection or sale of personal data.',
            ]} />
            <P>
              We reserve the right to investigate and take appropriate legal action against any user who violates this Acceptable Use Policy, including reporting to law enforcement authorities.
            </P>
          </Section>

          <Section id="ip" title="9. Intellectual Property">
            <Sub title="9.1 Our IP">
              <P>
                The Platform, including its software, algorithms (including Mitra's conversation design and lead scoring methodology), dashboards, user interfaces, brand elements, trademarks, logos, and all documentation, are the exclusive intellectual property of {COMPANY} and are protected under the <Bold>Copyright Act, 1957</Bold>, the <Bold>Trade Marks Act, 1999</Bold>, and applicable international IP law. Nothing in these Terms grants you any ownership right in our IP.
              </P>
            </Sub>
            <Sub title="9.2 Your Data">
              <P>
                You retain ownership of the data you upload to the Platform (e.g. college profiles, course information). You grant EduLeads Kerala a non-exclusive, royalty-free licence to use that data solely to provide the Platform's services.
              </P>
            </Sub>
            <Sub title="9.3 Aggregated Analytics">
              <P>
                We may use anonymised, aggregated data derived from Platform usage (e.g. industry-level conversion rates, regional student interest patterns) to improve our services and publish market insights. Such aggregated data will not identify any individual Student or Subscriber.
              </P>
            </Sub>
          </Section>

          <Section id="confidentiality" title="10. Confidentiality">
            <P>
              Each party agrees to: (a) keep the other party's Confidential Information strictly confidential; (b) not disclose it to any third party without prior written consent; and (c) use it only for the purpose of performing obligations under these Terms.
            </P>
            <P>
              This obligation does not apply to information that: (i) is or becomes publicly available without breach; (ii) was already known to the receiving party; (iii) is independently developed; or (iv) must be disclosed under law or valid court order — in which case the disclosing party will notify the other party promptly.
            </P>
            <P>
              College Users acknowledge that the Lead scoring methodology, AI conversation design, and allocation algorithm are proprietary trade secrets of EduLeads Kerala and are Confidential Information.
            </P>
          </Section>

          <Section id="disclaimer" title="11. Disclaimers & Warranties">
            <P>
              <Bold>The Platform is provided on an "as is" and "as available" basis.</Bold> To the maximum extent permitted under applicable Indian law, EduLeads Kerala expressly disclaims all warranties, express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </P>
            <P>We do not warrant that:</P>
            <UL items={[
              'The Platform will be uninterrupted, error-free, or secure at all times;',
              'Any Lead will result in a student enquiry, campus visit, application, or admission;',
              'Mitra\'s AI responses will be 100% accurate, complete, or free from error — AI outputs are probabilistic by nature;',
              'The Platform will meet your specific admissions targets or business outcomes.',
            ]} />
            <P>
              EduLeads Kerala is a technology intermediary connecting colleges with prospective students. We are not a recruitment agency, education consultant, or counsellor, and we do not guarantee admission outcomes.
            </P>
          </Section>

          <Section id="liability" title="12. Limitation of Liability">
            <P>
              To the fullest extent permissible under Indian law, EduLeads Kerala's total aggregate liability arising out of or in connection with these Terms — whether in contract, tort (including negligence), or otherwise — shall not exceed the total subscription fees paid by you in the <Bold>three months immediately preceding the event giving rise to the claim</Bold>.
            </P>
            <P>EduLeads Kerala shall not be liable for:</P>
            <UL items={[
              'Indirect, incidental, special, consequential, or punitive damages;',
              'Loss of revenue, profits, goodwill, data, or business opportunity;',
              'Damages arising from third-party service failures (Twilio, OpenAI, Razorpay, AWS);',
              'Losses caused by your failure to maintain account security;',
              'Incorrect lead data resulting from inaccurate information provided by a Student to Mitra;',
              'Any action taken by you in reliance on Lead information that causes harm to a Student or a third party.',
            ]} />
            <P>
              Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation, or any liability that cannot be excluded under the Consumer Protection Act, 2019, or any other mandatory Indian statute.
            </P>
          </Section>

          <Section id="indemnity" title="13. Indemnification">
            <P>
              You agree to defend, indemnify, and hold harmless EduLeads Kerala, its directors, officers, employees, agents, and licensors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to:
            </P>
            <UL items={[
              'Your use of the Platform in violation of these Terms;',
              'Your misuse of Student Lead data, including contacting students in violation of TRAI DND regulations or using data for unauthorised purposes;',
              'Any false or misleading claims made by you or your institution to students;',
              'Your violation of any applicable law, regulation, or third-party right;',
              'Any content or information you submit to the Platform that infringes a third party\'s rights.',
            ]} />
          </Section>

          <Section id="termination" title="14. Suspension & Termination">
            <Sub title="14.1 Termination by You">
              <P>You may cancel your subscription at any time through the Platform dashboard or by writing to {SUPPORT_EMAIL}. Termination takes effect at the end of the current billing cycle. You retain read-only access to your historical data for 30 days after termination.</P>
            </Sub>
            <Sub title="14.2 Termination / Suspension by Us">
              <P>We may suspend or terminate your account immediately and without prior notice if:</P>
              <UL items={[
                'You violate any provision of the Acceptable Use Policy (Section 8) or Section 7 (Student Data Ethics);',
                'You misuse, sell, or sublicense Student Lead data;',
                'You fail to make payment within 7 days of a failed billing attempt;',
                'We receive a valid order from a court or law enforcement authority directing us to do so;',
                'We reasonably believe your use poses a legal, reputational, or security risk to EduLeads Kerala or to Students.',
              ]} />
              <P>For lesser violations, we will issue a warning with a reasonable opportunity to cure before suspension.</P>
            </Sub>
            <Sub title="14.3 Effect of Termination">
              <P>
                Upon termination: your right to access the Platform ceases; Lead data allocated to you during the subscription period remains in our systems subject to our retention schedule; you must permanently delete all Student phone numbers you stored locally; your obligation to maintain confidentiality of Lead data survives termination.
              </P>
            </Sub>
          </Section>

          <Section id="governing-law" title="15. Governing Law & Disputes">
            <P>
              These Terms are governed by and construed in accordance with the laws of the <Bold>Republic of India</Bold>, without regard to its conflict of laws principles. The courts of <Bold>Ernakulam, Kerala</Bold> shall have exclusive jurisdiction to adjudicate any dispute arising out of or in connection with these Terms.
            </P>
            <P>
              <Bold>Arbitration:</Bold> Before initiating formal legal proceedings, both parties agree to attempt resolution through good-faith negotiation for a period of 30 days. If unresolved, disputes shall be referred to binding arbitration under the <Bold>Arbitration and Conciliation Act, 1996</Bold>, before a sole arbitrator mutually agreed upon by both parties. The seat of arbitration shall be Kochi, Kerala. Proceedings shall be conducted in English. The arbitral award shall be final and binding.
            </P>
            <P>
              Nothing in this section prevents either party from seeking urgent interim or injunctive relief from a competent court.
            </P>
          </Section>

          <Section id="miscellaneous" title="16. Miscellaneous">
            <UL items={[
              'Entire Agreement: These Terms, together with the Privacy Policy and any Order Form or Subscription Agreement, constitute the entire agreement between you and EduLeads Kerala regarding the Platform.',
              'Severability: If any provision of these Terms is found unlawful or unenforceable by a court of competent jurisdiction, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force.',
              'Waiver: Our failure to enforce any right or provision of these Terms is not a waiver of that right. Any waiver must be in writing.',
              'Assignment: You may not assign your rights or obligations under these Terms without our prior written consent. We may assign our rights to a successor entity in the event of a merger or acquisition.',
              'Force Majeure: Neither party shall be liable for failure to perform obligations due to events beyond their reasonable control, including natural disasters, government actions, power outages, internet infrastructure failure, or pandemic.',
              'Notices: Notices to EduLeads Kerala must be sent to legal@eduleads.in. Notices to Subscribers will be sent to the registered email address on the account.',
              'Language: These Terms are drafted in English. In the event of any conflict between an English version and a translation, the English version shall prevail.',
              'Updates: We may update these Terms at any time. Material changes will be notified 30 days in advance via email and dashboard notice. Continued use after the effective date constitutes acceptance.',
            ]} />
          </Section>

          <Section id="contact" title="17. Contact">
            <P>For legal enquiries, compliance concerns, or notices under these Terms:</P>
            <div style={{ padding: '20px 24px', background: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 12 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>{COMPANY}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{ADDRESS}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Legal: <a href={`mailto:${EMAIL}`} style={{ color: 'var(--brand-700)' }}>{EMAIL}</a></p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Support: <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--brand-700)' }}>{SUPPORT_EMAIL}</a></p>
            </div>
          </Section>

          <div style={{ padding: '20px 24px', background: 'var(--surface-subtle)', borderRadius: 10, fontSize: 13, color: 'var(--text-tertiary)', marginTop: 16, lineHeight: 1.7 }}>
            These Terms of Use constitute a legally binding agreement governed by Indian law. By using the EduLeads Kerala Platform, you confirm that you have read, understood, and agreed to these Terms. Jurisdiction: Ernakulam, Kerala, India.
          </div>

        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
