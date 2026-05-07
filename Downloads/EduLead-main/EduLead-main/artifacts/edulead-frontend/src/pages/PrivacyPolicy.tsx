import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import SEOHead from '@/components/SEOHead';
import { EduLeadsLogo } from '../components/EduLeadsLogo';

const LAST_UPDATED = '3 May 2026';
const EFFECTIVE_DATE = '3 May 2026';
const COMPANY = 'EduLeads Kerala Private Limited';
const COMPANY_SHORT = 'EduLeads Kerala';
const GSTIN = 'GSTIN: 32XXXXXXX';
const ADDRESS = 'Kochi, Kerala – 682 001, India';
const EMAIL = 'privacy@eduleads.in';
const GRIEVANCE_OFFICER = 'Siddharth P Santhosh';
const GRIEVANCE_EMAIL = 'grievance@eduleads.in';
const GRIEVANCE_PHONE = '+91 98765 43210';

const TOC = [
  { id: 'overview', label: '1. Overview' },
  { id: 'definitions', label: '2. Definitions' },
  { id: 'data-collected', label: '3. Information We Collect' },
  { id: 'how-collected', label: '4. How We Collect Information' },
  { id: 'use', label: '5. How We Use Your Information' },
  { id: 'sharing', label: '6. Sharing & Disclosure' },
  { id: 'consent', label: '7. Consent' },
  { id: 'retention', label: '8. Data Retention' },
  { id: 'security', label: '9. Data Security' },
  { id: 'rights', label: '10. Your Rights' },
  { id: 'cookies', label: '11. Cookies & Tracking' },
  { id: 'third-party', label: '12. Third-Party Services' },
  { id: 'children', label: '13. Minors' },
  { id: 'transfers', label: '14. Cross-Border Transfers' },
  { id: 'changes', label: '15. Changes to This Policy' },
  { id: 'grievance', label: '16. Grievance Officer' },
  { id: 'contact', label: '17. Contact Us' },
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

export default function PrivacyPolicy() {
  return (
    <div style={{ fontFamily: 'var(--font)', color: 'var(--text-primary)', paddingTop: 64 }}>
      <SEOHead
        title="Privacy Policy"
        description="Read EduLeads Kerala's privacy policy to understand how we collect, store, and protect your personal data in compliance with applicable Indian data protection laws."
        canonical="/privacy-policy"
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
              Privacy Policy
            </h1>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}><Bold>Effective date:</Bold> {EFFECTIVE_DATE}</p>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}><Bold>Last updated:</Bold> {LAST_UPDATED}</p>
            </div>
            <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 10, fontSize: 14, color: 'var(--brand-800)', lineHeight: 1.6 }}>
              This Privacy Policy is published in compliance with Rule 3(1) of the <Bold>Information Technology (Intermediaries Guidelines) Rules, 2011</Bold> and Rule 4 of the <Bold>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</Bold> under the <Bold>Information Technology Act, 2000</Bold>. It is also aligned with India's <Bold>Digital Personal Data Protection Act, 2023 (DPDPA)</Bold>.
            </div>
          </div>

          {/* Sections */}
          <Section id="overview" title="1. Overview">
            <P>
              {COMPANY} ("<Bold>EduLeads Kerala</Bold>", "<Bold>we</Bold>", "<Bold>our</Bold>", or "<Bold>us</Bold>") is a company incorporated under the Companies Act, 2013, having its registered office at {ADDRESS}. We operate the platform accessible at <Bold>eduleads.in</Bold> (the "<Bold>Platform</Bold>"), which provides AI-powered student lead generation and admissions counselling services to educational institutions across Kerala and India.
            </P>
            <P>
              This Privacy Policy ("<Bold>Policy</Bold>") describes how we collect, use, store, process, share, and protect personal information of:
            </P>
            <UL items={[
              'Students and prospective students ("Students") who interact with Mitra, our AI counsellor, via WhatsApp or other channels;',
              'Representatives, administrators, and staff of educational institutions and agencies that subscribe to our Platform ("College Users" or "Subscribers");',
              'Visitors to our website at eduleads.in.',
            ]} />
            <P>
              By using the Platform, interacting with Mitra, or submitting any information to us, you agree to the terms of this Policy. If you do not agree, please discontinue use of the Platform immediately.
            </P>
          </Section>

          <Section id="definitions" title="2. Definitions">
            <P>In this Policy, unless the context otherwise requires:</P>
            <UL items={[
              '"Body Corporate" has the meaning assigned to it under the IT Act, 2000.',
              '"Sensitive Personal Data or Information (SPDI)" means personal information as defined under Rule 3 of the SPDI Rules, 2011 — including passwords, financial information, biometric information, health conditions, sexual orientation, and contact numbers (phone numbers).',
              '"Personal Information" means any information that relates to a natural person which, either directly or indirectly, in combination with other information available, is capable of identifying such person.',
              '"Data Fiduciary" under the DPDPA 2023 means EduLeads Kerala, which determines the purpose and means of processing personal data.',
              '"Data Principal" means the individual (Student or College User) whose personal data is being processed.',
              '"Mitra" means our AI counsellor powered by OpenAI\'s GPT-4, deployed over WhatsApp to conduct student qualification conversations.',
              '"Tenant" means a subscribed educational institution or agency on the Platform.',
              '"Lead" means a qualified Student record generated through the Mitra conversation.',
            ]} />
          </Section>

          <Section id="data-collected" title="3. Information We Collect">
            <P><Bold>3.1 Information collected from Students (via Mitra on WhatsApp):</Bold></P>
            <UL items={[
              'Full name',
              'WhatsApp phone number (classified as Sensitive Personal Data under SPDI Rules, 2011)',
              'Desired course of study (e.g. B.Tech, MBA, BAMS)',
              'District / location in Kerala',
              'Approximate annual budget range for education',
              'Timeline for enrolment (current academic year / next year / exploring)',
              'Intent level (inferred from conversation)',
              'Full conversation transcript with Mitra',
              'Audio messages (voice notes), if sent — transcribed and deleted after processing',
              'IP address (where available via WhatsApp Business API)',
              'Timestamp and channel of consent',
            ]} />
            <P><Bold>3.2 Information collected from College Users (Subscribers):</Bold></P>
            <UL items={[
              'Name, designation, and official email address',
              'College or agency name, address, and GST number',
              'Login credentials (password stored as a bcrypt hash — never in plain text)',
              'Payment details (processed by Razorpay; we receive only a transaction reference — card/bank details are never stored on our servers)',
              'Activity logs: lead views, phone reveals, call logs, CSV exports',
              'IP addresses and browser user-agent strings',
            ]} />
            <P><Bold>3.3 Information collected automatically:</Bold></P>
            <UL items={[
              'Log files: IP address, browser type, pages visited, referrer URL, time and date of access',
              'Cookies and similar tracking technologies (see Section 11)',
              'Device information (screen resolution, operating system)',
            ]} />
          </Section>

          <Section id="how-collected" title="4. How We Collect Information">
            <UL items={[
              'Directly from you when you register, fill a form, or contact us',
              'Through Mitra\'s WhatsApp conversation — only after explicit consent is given by the Student (see Section 7)',
              'Through third-party integrations: Twilio (WhatsApp Business API), OpenAI (AI processing), Razorpay (payments)',
              'Through cookies and analytics tools on our website',
              'Through your interactions with the dashboard (College Users)',
            ]} />
          </Section>

          <Section id="use" title="5. How We Use Your Information">
            <P><Bold>5.1 For Students:</Bold></P>
            <UL items={[
              'To conduct an AI-powered admissions counselling conversation in Malayalam via WhatsApp',
              'To compute a lead quality score (0–100) using a deterministic algorithm based on your stated preferences',
              'To match you with colleges on our Platform that align with your course preferences, location, and budget',
              'To allow authorised college representatives to contact you regarding admission enquiries',
              'To send you relevant admissions information (you may opt out at any time)',
              'To improve Mitra\'s conversational accuracy and quality',
              'To comply with legal obligations',
            ]} />
            <P><Bold>5.2 For College Users:</Bold></P>
            <UL items={[
              'To provide access to the Platform and manage your subscription',
              'To deliver qualified lead records matching your stated preferences',
              'To process payments for subscriptions via Razorpay',
              'To send you platform updates, quota alerts, and product announcements',
              'To generate analytics and reports on lead performance',
              'To investigate disputes, enforce our Terms of Use, and prevent fraud',
            ]} />
            <P><Bold>5.3 Legal basis for processing (DPDPA 2023 alignment):</Bold></P>
            <UL items={[
              'Consent — obtained before processing any Student\'s personal data',
              'Contractual necessity — processing required to deliver services to College Users',
              'Legitimate interests — security monitoring, fraud prevention, platform improvement',
              'Legal obligation — tax records, audit logs, government requests',
            ]} />
          </Section>

          <Section id="sharing" title="6. Sharing & Disclosure">
            <P>We do not sell your personal information. We share personal data only as described below:</P>
            <P><Bold>6.1 With Subscribed Colleges (Tenants):</Bold></P>
            <P>
              When a Student Lead is allocated to a college, the college receives the Student's name, course interest, location, budget range, timeline, and intent score. The Student's phone number is shared only with colleges on the <Bold>Premium plan</Bold>, only when the college explicitly requests it via the "Reveal Phone" action, and only if the Student has given their consent. Each phone reveal is logged in our audit trail.
            </P>
            <P><Bold>6.2 With Service Providers (Data Processors):</Bold></P>
            <UL items={[
              'OpenAI (USA) — processes conversation messages to generate Mitra\'s responses. Subject to OpenAI\'s data processing agreement. Data may be processed outside India (see Section 14).',
              'Twilio Inc. (USA) — provides WhatsApp Business API and voice call services. Messages are routed through Twilio\'s infrastructure.',
              'Razorpay Software Pvt. Ltd. (India) — processes all payment transactions. Governed by Razorpay\'s Privacy Policy and PCI-DSS compliance framework.',
              'Amazon Web Services (AWS) — stores call recordings and audio files in S3 buckets located in the ap-south-1 (Mumbai) region.',
              'Microsoft Azure — provides Text-to-Speech for voice interactions, in ap-south region.',
            ]} />
            <P>All service providers are contractually bound to process personal data only as instructed by us and to maintain appropriate security measures.</P>
            <P><Bold>6.3 Legal or regulatory disclosure:</Bold></P>
            <P>We may disclose personal information to law enforcement agencies, government authorities, or courts of law when required by a valid court order, summons, or any other legal requirement under Indian law, including requests under Section 69 or Section 69B of the IT Act, 2000.</P>
            <P><Bold>6.4 Business transfer:</Bold></P>
            <P>In the event of a merger, acquisition, or sale of assets, personal data may be transferred to the successor entity, subject to equivalent privacy protections.</P>
          </Section>

          <Section id="consent" title="7. Consent">
            <P>
              <Bold>For Students:</Bold> Before Mitra processes any personal information, we send every Student a WhatsApp consent message explaining: (a) who we are; (b) what data will be collected; (c) how it will be used; and (d) that the Student may withdraw consent at any time by replying <Bold>STOP</Bold>. Processing begins only after the Student replies <Bold>YES</Bold>. This consent event is logged with a timestamp, channel, and hashed IP address.
            </P>
            <P>
              <Bold>Withdrawal of consent:</Bold> A Student may withdraw consent at any time by replying <Bold>STOP</Bold> to any Mitra message, or by contacting us at {EMAIL}. Upon withdrawal, no new data will be collected, and the Student's record will be soft-deleted within 30 days, subject to legal retention obligations.
            </P>
            <P>
              <Bold>For College Users:</Bold> By completing registration and accepting the Terms of Use, College Users give their informed consent to the collection and processing of their personal and organisational data as described in this Policy.
            </P>
          </Section>

          <Section id="retention" title="8. Data Retention">
            <UL items={[
              'Student personal data (name, course, location, budget, timeline): Retained for 24 months from the date of lead creation, or until consent is withdrawn, whichever is earlier.',
              'Student phone number (SPDI): Retained in encrypted form for 24 months. Deleted immediately upon consent withdrawal or Student\'s written request.',
              'WhatsApp conversation transcripts: Retained for 12 months for quality assurance and legal compliance, then permanently deleted.',
              'Voice call recordings: Retained for 90 days for dispute resolution, then permanently deleted from S3.',
              'College User account data: Retained for the duration of the subscription plus 3 years for tax and audit purposes under the Companies Act, 2013.',
              'Payment records: Retained for 8 years as required under Section 128 of the Companies Act, 2013.',
              'Audit logs (phone reveals, exports, login events): Retained for 5 years.',
            ]} />
          </Section>

          <Section id="security" title="9. Data Security">
            <P>
              We implement reasonable security practices and procedures as required under Rule 8 of the SPDI Rules, 2011, including:
            </P>
            <UL items={[
              'Student phone numbers are encrypted at rest using industry-standard Fernet symmetric encryption (AES-128-CBC). The encryption key is stored separately from the data.',
              'All data in transit is encrypted using TLS 1.2 or higher.',
              'Passwords are stored as bcrypt hashes with a work factor of 12. We never store passwords in plain text.',
              'Two-factor authentication (TOTP) is available for all College User accounts.',
              'Access to Student phone numbers is gated behind the Premium plan and generates an audit log entry for every reveal.',
              'Our servers are hosted on cloud infrastructure (AWS, ap-south-1 Mumbai region) with access control lists and VPC isolation.',
              'We perform periodic security reviews and vulnerability assessments.',
              'Rate limiting and brute-force protection are applied to all authentication endpoints.',
            ]} />
            <P>
              Despite our best efforts, no data transmission or storage system is 100% secure. In the event of a data breach that affects Sensitive Personal Data, we will notify affected users and, where required, the appropriate government authority, in accordance with applicable Indian law and the DPDPA 2023.
            </P>
          </Section>

          <Section id="rights" title="10. Your Rights">
            <P>Under the IT (SPDI) Rules, 2011 and the Digital Personal Data Protection Act, 2023, you have the following rights in respect of your personal data:</P>
            <UL items={[
              'Right to access — You may request a summary of the personal data we hold about you.',
              'Right to correction — You may request correction of inaccurate or incomplete data.',
              'Right to erasure — You may request deletion of your personal data. We will comply within 30 days, subject to legal retention obligations.',
              'Right to withdraw consent — Students may withdraw consent at any time by replying STOP or writing to us (see Section 7).',
              'Right to grievance redressal — You may file a complaint with our Grievance Officer (see Section 16).',
              'Right to nominate — Under DPDPA 2023, you may nominate an individual to exercise data rights on your behalf in the event of your death or incapacity.',
            ]} />
            <P>To exercise any of these rights, please write to us at <Bold>{EMAIL}</Bold> with your full name, registered contact, and a description of your request. We will respond within <Bold>30 days</Bold>.</P>
          </Section>

          <Section id="cookies" title="11. Cookies & Tracking">
            <P>Our website uses the following categories of cookies:</P>
            <UL items={[
              'Essential cookies — necessary for the website to function (login session, CSRF tokens). Cannot be disabled.',
              'Analytics cookies — help us understand how visitors use our site (page views, session duration). You may opt out via your browser settings.',
              'Preference cookies — remember your language and display settings.',
            ]} />
            <P>We do not use advertising or behavioural tracking cookies. You can manage or block cookies through your browser settings. Blocking essential cookies may prevent the Platform from functioning correctly.</P>
          </Section>

          <Section id="third-party" title="12. Third-Party Services">
            <P>Our Platform integrates with the following third-party services, each governed by their own privacy policies:</P>
            <UL items={[
              'WhatsApp Business (Meta Platforms Ireland Ltd.) — the primary channel through which Students interact with Mitra.',
              'OpenAI, L.L.C. — AI language model provider for Mitra\'s responses. See openai.com/policies/privacy-policy.',
              'Twilio Inc. — telecommunications infrastructure for WhatsApp and voice calls. See twilio.com/en-us/legal/privacy.',
              'Razorpay Software Pvt. Ltd. — payment processing. See razorpay.com/privacy.',
              'Amazon Web Services — cloud hosting and storage. See aws.amazon.com/privacy.',
            ]} />
            <P>We recommend reviewing each provider's privacy policy. EduLeads Kerala is not responsible for the privacy practices of third-party services.</P>
          </Section>

          <Section id="children" title="13. Minors">
            <P>
              Our Platform is intended for students who are 15 years of age or older. We do not knowingly collect personal information from children below the age of 15 without verifiable parental or guardian consent, as required under the Digital Personal Data Protection Act, 2023. If we become aware that we have inadvertently collected personal data from a minor below 15 without consent, we will delete it promptly.
            </P>
          </Section>

          <Section id="transfers" title="14. Cross-Border Data Transfers">
            <P>
              Some of our service providers — including OpenAI (USA) and Twilio (USA) — process data outside India. These transfers occur under contractual protections that require the recipient to maintain data security standards equivalent to those applicable in India under the IT Act and SPDI Rules. To the extent required by the DPDPA 2023 and notified by the Central Government, we will restrict transfers to jurisdictions that have not been blacklisted.
            </P>
            <P>
              Student phone numbers are stored exclusively within India (AWS Mumbai region) and are never transmitted to overseas processors.
            </P>
          </Section>

          <Section id="changes" title="15. Changes to This Policy">
            <P>
              We may update this Policy from time to time. Material changes will be notified via email (to registered College Users) and via a notice on our website at least 15 days before the change takes effect. Continued use of the Platform after the effective date of the updated Policy constitutes acceptance of the changes.
            </P>
            <P>The version history of this Policy is maintained internally and is available upon written request.</P>
          </Section>

          <Section id="grievance" title="16. Grievance Officer">
            <P>
              In accordance with Rule 5(9) of the SPDI Rules, 2011 and the IT (Intermediaries Guidelines and Digital Media Ethics Code) Rules, 2021, we have appointed a Grievance Officer to address complaints or concerns regarding the processing of personal data:
            </P>
            <div style={{ padding: '20px 24px', background: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 12, marginTop: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>{GRIEVANCE_OFFICER}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Grievance Officer — {COMPANY}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{ADDRESS}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Email: <a href={`mailto:${GRIEVANCE_EMAIL}`} style={{ color: 'var(--brand-700)' }}>{GRIEVANCE_EMAIL}</a></p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Phone: {GRIEVANCE_PHONE}</p>
            </div>
            <P style={{ marginTop: 16 }}>
              Complaints must be submitted in writing (email is acceptable). We will acknowledge receipt within <Bold>24 hours</Bold> and resolve the grievance within <Bold>30 days</Bold> of receipt.
            </P>
          </Section>

          <Section id="contact" title="17. Contact Us">
            <P>For any privacy-related queries, requests, or concerns, please contact us at:</P>
            <div style={{ padding: '20px 24px', background: 'var(--surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 12 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>{COMPANY}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{ADDRESS}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{GSTIN}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Privacy enquiries: <a href={`mailto:${EMAIL}`} style={{ color: 'var(--brand-700)' }}>{EMAIL}</a></p>
            </div>
          </Section>

          <div style={{ padding: '20px 24px', background: 'var(--surface-subtle)', borderRadius: 10, fontSize: 13, color: 'var(--text-tertiary)', marginTop: 16, lineHeight: 1.7 }}>
            This document constitutes the Privacy Policy of {COMPANY} and is a legally binding document. It is governed by the laws of India and subject to the exclusive jurisdiction of courts in Ernakulam, Kerala.
          </div>

        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
