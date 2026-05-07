import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { CheckCircle2, Zap, Users, TrendingUp, Shield, Star, ArrowRight, Lock } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import SEOHead from '@/components/SEOHead';
import { EduLeadsLogo } from '@/components/EduLeadsLogo';

const LANDING_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://edulead.in/#organization',
      name: 'EduLeads Kerala',
      url: 'https://edulead.in',
      logo: { '@type': 'ImageObject', url: 'https://edulead.in/favicon.svg' },
      description: 'AI-powered lead generation platform connecting Kerala students with colleges through Mitra, a Malayalam AI counsellor.',
      address: { '@type': 'PostalAddress', addressLocality: 'Kochi', addressRegion: 'Kerala', addressCountry: 'IN' },
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: 'support@eduleads.in' },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://edulead.in/#website',
      url: 'https://edulead.in',
      name: 'EduLeads Kerala',
      publisher: { '@id': 'https://edulead.in/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'EduLeads Kerala',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Multi-tenant SaaS that uses AI to connect Kerala students with the right colleges via WhatsApp and voice counselling.',
      offers: [
        { '@type': 'Offer', name: 'Basic', price: '2999', priceCurrency: 'INR' },
        { '@type': 'Offer', name: 'Pro', price: '6999', priceCurrency: 'INR' },
        { '@type': 'Offer', name: 'Premium', price: '14999', priceCurrency: 'INR' },
      ],
    },
  ],
};

const plans = [
  {
    key: 'basic', name: 'Basic', price: '₹2,999',
    features: ['10 leads/month', 'AI WhatsApp counsellor', 'Basic analytics', 'Email support'],
  },
  {
    key: 'pro', name: 'Pro', price: '₹6,999', popular: true,
    features: ['30 leads/month', 'Masked calling', 'Advanced analytics', 'Priority support', 'Chat with students'],
  },
  {
    key: 'premium', name: 'Premium', price: '₹14,999',
    features: ['100 leads/month', 'Exclusive leads', 'Phone number reveal', 'CSV export', 'Dedicated manager'],
  },
];

const steps = [
  {
    num: '01', icon: Zap, title: 'AI Counsellor Engages',
    desc: 'Our Malayalam AI counsellor Mitra chats with students on WhatsApp and qualifies them with real questions.',
  },
  {
    num: '02', icon: TrendingUp, title: 'Leads are Scored',
    desc: 'Every lead is scored 0–100 based on intent, budget, course interest, and timeline.',
  },
  {
    num: '03', icon: Users, title: 'Matched to Colleges',
    desc: 'Hot leads are instantly distributed to the best-fit college on the platform in real time.',
  },
];

const stats = [
  { value: '500+', label: 'Leads delivered' },
  { value: '50+', label: 'Kerala colleges' },
  { value: '< 1.5s', label: 'AI response time' },
];

const trust = [
  { icon: Shield, title: 'Student privacy first', desc: 'Phone numbers are masked by default. Data shared only after consent.' },
  { icon: Star, title: 'GDPR compliant', desc: "We follow Kerala's data protection guidelines and let students opt out at any time." },
  { icon: CheckCircle2, title: 'Verified intent data', desc: 'AI counsellor gathers real signals — budget, timeline, course preference.' },
  { icon: Lock, title: 'DPDP Act compliant', desc: "Built to comply with India's Digital Personal Data Protection Act 2023." },
];

const testimonials = [
  {
    quote: 'We filled 38 seats in one admission season using EduLeads. The Malayalam AI actually works — students respond to Mitra like it is a real counsellor.',
    name: 'Rajesh Kumar',
    role: 'Principal, MES College, Ernakulam',
    initials: 'RK',
    avatarBg: '#1E3A5F',
  },
  {
    quote: 'The lead scoring is accurate. When Mitra says a student is hot, 7 out of 10 times they actually enroll. We stopped wasting time on unqualified inquiries.',
    name: 'Sreeja Nair',
    role: 'Admissions Head, FISAT, Angamaly',
    initials: 'SN',
    avatarBg: '#2D7D46',
  },
  {
    quote: 'Phone numbers are protected until we upgrade. This gave our management the confidence to trust the platform completely. Very professional approach.',
    name: 'Arun Pillai',
    role: 'Director, Albertian Institute, Kochi',
    initials: 'AP',
    avatarBg: '#254d7a',
  },
];

const iconBgByStep = ['#edf4fb', '#fffbeb', '#f0faf4'];
const iconColorByStep = ['#1E3A5F', '#d97706', '#2D7D46'];

function SectionHeader({ overline, heading, subheading, dark = false }: {
  overline: string;
  heading: React.ReactNode;
  subheading?: string;
  dark?: boolean;
}) {
  return (
    <div className="section-header" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
      <div className={`section-overline${dark ? ' dark' : ''}`}>
        <span className="overline-dot" />
        {overline}
      </div>
      <h2 className={`section-heading${dark ? ' dark' : ''}`}>
        {heading}
      </h2>
      {subheading && (
        <p className={`section-subheading${dark ? ' dark' : ''}`}>
          {subheading}
        </p>
      )}
    </div>
  );
}

// ── Animated Mitra chat demo ─────────────────────────────────
type ChatMsg = { role: 'ai' | 'user'; text: string; id: number };

const CHATS = [
  // 1 · Mitra initiates · Malayalam
  {
    lang: 'മലയാളം', userColor: '#1E3A5F', score: 87,
    messages: [
      { role: 'ai' as const,   text: 'ഹലോ! 👋 Admission-ന് ഏത് course ആണ് interest?' },
      { role: 'user' as const, text: 'Computer Science B.Tech' },
      { role: 'ai' as const,   text: 'നല്ല choice! 😊 Etha district prefer ആണ്?' },
      { role: 'user' as const, text: 'Ernakulam, Thrissur okke aakum' },
      { role: 'ai' as const,   text: 'Per year budget ഏതാണ്ട് എത്ര?' },
      { role: 'user' as const, text: '₹1.5L-ൽ ഉള്ളിൽ ആകണം' },
    ],
  },
  // 2 · Student initiates · Manglish
  {
    lang: 'Manglish', userColor: '#2D7D46', score: 82,
    messages: [
      { role: 'user' as const, text: 'Hai, MBA Finance-nu admission undaakumo?' },
      { role: 'ai' as const,   text: 'Undaakum! 😊 Etha district prefer cheyyunu?' },
      { role: 'user' as const, text: 'Kochi side aayaal nalla' },
      { role: 'ai' as const,   text: 'Nalla! Budget per year ethra okke kaanum?' },
      { role: 'user' as const, text: '1.5L-il ullil vennam' },
      { role: 'ai' as const,   text: 'Perfect, best options nokkaam! 👍' },
    ],
  },
  // 3 · Student initiates · Malayalam
  {
    lang: 'മലയാളം', userColor: '#1E3A5F', score: 79,
    messages: [
      { role: 'user' as const, text: 'BSc Nursing-ന് admission details അറിയണം' },
      { role: 'ai' as const,   text: '😊 Hostel വേണോ, അതോ day scholar?' },
      { role: 'user' as const, text: 'Day scholar, Thrissur nearby ആണ്' },
      { role: 'ai' as const,   text: 'Okay! Per year budget ഏതാണ്ട് എത്ര?' },
      { role: 'user' as const, text: '80k to 1L-ൽ ഉള്ളിൽ' },
      { role: 'ai' as const,   text: 'നല്ല! Matching colleges ready ആക്കാം 👍' },
    ],
  },
  // 4 · Mitra initiates · Manglish
  {
    lang: 'Manglish', userColor: '#2D7D46', score: 76,
    messages: [
      { role: 'ai' as const,   text: 'Hai! 😊 College admission-nu ethalum plan undo?' },
      { role: 'user' as const, text: 'BCA cheyyanam, IT field-il pokkanam' },
      { role: 'ai' as const,   text: 'Nalla! Etha district prefer cheyyunu?' },
      { role: 'user' as const, text: 'Thrissur or Palakkad side' },
      { role: 'ai' as const,   text: 'Budget per year ethra okke kaanum?' },
      { role: 'user' as const, text: '1L-il ullil ayaal mathi' },
    ],
  },
  // 5 · Student initiates · Malayalam
  {
    lang: 'മലയാളം', userColor: '#1E3A5F', score: 85,
    messages: [
      { role: 'user' as const, text: 'LLB-ന് admission enquire ചെയ്യണം' },
      { role: 'ai' as const,   text: 'നല്ല! 😊 Full time ആണോ, part time?' },
      { role: 'user' as const, text: 'Full time thanne' },
      { role: 'ai' as const,   text: 'College location prefer ഉണ്ടോ?' },
      { role: 'user' as const, text: 'Ernakulam-ൽ ആണെങ്കിൽ perfect' },
      { role: 'ai' as const,   text: 'ശരി! Best options ഞാൻ ready ആക്കാം 👍' },
    ],
  },
  // 6 · Student initiates · Manglish
  {
    lang: 'Manglish', userColor: '#2D7D46', score: 78,
    messages: [
      { role: 'user' as const, text: 'B.Pharm-nu admission enginaa undo?' },
      { role: 'ai' as const,   text: 'Undo! 😊 Etha side college prefer cheyyunu?' },
      { role: 'user' as const, text: 'Kochi or Ernakulam side' },
      { role: 'ai' as const,   text: 'Nalla! Budget per year ethra okke?' },
      { role: 'user' as const, text: '80k to 1L-il ullil' },
      { role: 'ai' as const,   text: 'Perfect! Colleges ready aakaam 👍' },
    ],
  },
];

function MitraChat() {
  const [loop, setLoop] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [langVisible, setLangVisible] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const msgAreaRef = useRef<HTMLDivElement>(null);

  const chat = CHATS[loop % CHATS.length];

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => ids.push(setTimeout(fn, ms));

    // Reset; briefly hide badge so it fades back in
    setMessages([]); setIsTyping(false); setShowScore(false); setCalculating(false);
    setLangVisible(false);
    at(() => setLangVisible(true), 150);

    const msgs = chat.messages;

    // Build a timeline that respects who sends each message:
    // - AI message  → show typing indicator first, then reveal bubble
    // - User message → bubble pops in directly (no typing indicator)
    const TYPING_DURATION = 1200;
    let t = 500;
    const addMsg = (msg: typeof msgs[0], id: number) => {
      if (msg.role === 'ai') {
        at(() => setIsTyping(true), t);
        t += TYPING_DURATION;
        at(() => { setIsTyping(false); setMessages(p => [...p, { ...msg, id }]); }, t);
      } else {
        at(() => setMessages(p => [...p, { ...msg, id }]), t);
      }
      t += 850; // pause between messages
    };

    msgs.forEach((msg, i) => addMsg(msg, i + 1));
    // Show "calculating…" indicator, then reveal score after a beat
    at(() => setCalculating(true), t + 400);
    at(() => { setCalculating(false); setShowScore(true); }, t + 1800);
    at(() => setLoop(l => l + 1), t + 5200);

    return () => ids.forEach(clearTimeout);
  }, [loop]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll inside the chat box only — never the page
  useEffect(() => {
    const el = msgAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  return (
    <div
      className="animate-up float-card"
      style={{
        background: 'rgba(255,255,255,0.62)',
        border: '1px solid rgba(255,255,255,0.72)',
        borderRadius: 30,
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        boxShadow: '0 24px 70px rgba(30,58,95,0.16)',
        padding: 24,
        width: 320,
        flexShrink: 0,
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A5F, #2D7D46)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white',
          }}>M</div>
          <div style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 10, height: 10, borderRadius: '50%',
            background: '#22c55e', border: '2px solid white',
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Mitra AI Counsellor</div>
          <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
            Active · WhatsApp
          </div>
        </div>
        {/* Language badge — fades when language changes */}
        <div style={{
          fontSize: 10, fontWeight: 600,
          padding: '3px 9px', borderRadius: 99,
          background: `${chat.userColor}14`,
          color: chat.userColor,
          border: `1px solid ${chat.userColor}28`,
          whiteSpace: 'nowrap',
          opacity: langVisible ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}>
          {chat.lang}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={msgAreaRef}
        className="mitra-msg-area"
        style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          overflowY: 'scroll', height: 240, marginBottom: 14,
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className="mitra-msg-in"
            style={{ alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end', maxWidth: '84%' }}
          >
            <div style={{
              padding: '9px 13px',
              borderRadius: msg.role === 'ai' ? '16px 16px 16px 5px' : '16px 16px 5px 16px',
              background: msg.role === 'ai' ? 'rgba(241,245,249,0.9)' : chat.userColor,
              fontSize: 12, color: msg.role === 'ai' ? '#0f172a' : 'white',
              lineHeight: 1.55,
              boxShadow: msg.role === 'user' ? `0 2px 8px ${chat.userColor}33` : 'none',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Calculating score indicator */}
        {calculating && (
          <div className="mitra-msg-in" style={{ alignSelf: 'center', marginTop: 4 }}>
            <div style={{
              padding: '6px 14px', borderRadius: 99,
              background: 'rgba(30,58,95,0.07)',
              border: '1px solid rgba(30,58,95,0.12)',
              fontSize: 11, color: '#64748b',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span className="mitra-typing-dot" style={{ background: '#3b76b5' }} />
              <span className="mitra-typing-dot" style={{ background: '#3b76b5' }} />
              <span className="mitra-typing-dot" style={{ background: '#3b76b5' }} />
              <span>Calculating score…</span>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="mitra-msg-in" style={{ alignSelf: 'flex-start' }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: '16px 16px 16px 5px',
              background: 'rgba(241,245,249,0.9)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span className="mitra-typing-dot" />
              <span className="mitra-typing-dot" />
              <span className="mitra-typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Score card */}
      {showScore && (
        <div
          className="mitra-score-in"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'rgba(240,250,244,0.84)', borderRadius: 20,
            border: '1px solid #86efac',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#16a34a', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, flexShrink: 0,
          }}>{chat.score}</div>
          <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: 9999, fontSize: 11, fontWeight: 600, padding: '2px 8px', flexShrink: 0 }}>
            Hot Lead
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Scoring complete</span>
        </div>
      )}
    </div>
  );
}

function useScrollAnimation(selector: string) {
  useEffect(() => {
    const setup = () => {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      elements.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
      });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animate(entry.target as HTMLElement, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 480,
                ease: 'out(4)',
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      elements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    };
    const cleanup = setup();
    return cleanup;
  }, [selector]);
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const getStartedArrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll('[data-hero]');
    if (!items.length) return;
    items.forEach((el) => { (el as HTMLElement).style.opacity = '0'; });
    animate('[data-hero]', {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(80),
      duration: 600,
      ease: 'out(4)',
    });
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('.animate-up');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useScrollAnimation('.section-header');

  return (
    <div className="landing-glass-page" style={{ fontFamily: 'var(--font)', color: 'var(--text-primary)', paddingTop: 64 }}>
      <SEOHead
        title="AI Lead Generation for Kerala Colleges"
        description="Connect your college with qualified student leads using Mitra, our Malayalam AI counsellor. Automated WhatsApp + voice counselling, 0–100 lead scoring, and real-time distribution to 50+ Kerala colleges."
        canonical="/"
        structuredData={LANDING_STRUCTURED_DATA}
      />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header
        ref={navRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          background: scrolled ? 'rgba(255,255,255,0.74)' : 'rgba(255,255,255,0.58)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(148,163,184,0.28)' : '1px solid rgba(255,255,255,0.36)',
          boxShadow: scrolled ? '0 16px 36px rgba(30,58,95,0.08)' : 'none',
          transition: 'all 250ms ease',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <EduLeadsLogo size={34} />
          </Link>

          <nav style={{ gap: 32, alignItems: 'center' }} className="hidden md:flex">
            {[
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Contact', href: '#contact' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="nav-underline"
                style={{ fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none', transition: 'color 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1E3A5F'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <Link
              to="/login"
              style={{
                background: 'transparent', color: '#475569', border: 'none',
                fontSize: 14, fontWeight: 500, padding: '8px 16px',
                borderRadius: 14, cursor: 'pointer', textDecoration: 'none',
                transition: 'background 150ms ease, color 150ms ease',
              }}
              className="hidden sm:inline-block"
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="get-started-btn"
              style={{
                background: 'linear-gradient(135deg, #1E3A5F, #254d7a)',
                color: 'white',
                fontSize: 14, fontWeight: 600, padding: '0 20px',
                height: 38,
                borderRadius: 16, textDecoration: 'none',
                transition: 'all 200ms ease',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(30,58,95,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,58,95,0.35)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                if (getStartedArrowRef.current) getStartedArrowRef.current.style.transform = 'translateX(3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,58,95,0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
                if (getStartedArrowRef.current) getStartedArrowRef.current.style.transform = 'translateX(0)';
              }}
            >
              Get Started
              <span ref={getStartedArrowRef} style={{ display: 'inline-flex', transition: 'transform 150ms ease' }}>
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        style={{
          paddingTop: 100,
          paddingBottom: 0,
          background: 'linear-gradient(135deg, rgba(237,244,251,0.92) 0%, #ffffff 46%, rgba(236,253,245,0.82) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: 60, left: -100, width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,58,95,0.05) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: 40, right: -120, width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,125,70,0.04) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

            {/* Left column — 55% */}
            <div className="w-full md:w-[55%] text-center md:text-left" style={{ paddingBottom: 72 }}>

              {/* Overline pill */}
              <div data-hero style={{ display: 'flex', justifyContent: 'center' }} className="md:justify-start">
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 16px',
                  background: 'linear-gradient(135deg, #edf4fb, #f0f5fc)',
                  border: '1px solid #b5d4f4',
                  borderRadius: 18,
                  fontSize: 13, fontWeight: 500, color: '#1E3A5F',
                  marginBottom: 24,
                  boxShadow: '0 1px 4px rgba(30,58,95,0.08)',
                }}>
                  <Zap size={13} style={{ color: '#2e6096' }} />
                  AI-powered in Malayalam
                </div>
              </div>

              {/* Headline */}
              <h1
                data-hero
                style={{
                  fontSize: 'clamp(38px, 5.5vw, 62px)',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.08,
                  letterSpacing: '-0.04em',
                  marginBottom: 20,
                }}
              >
                Find{' '}
                <span className="hero-highlight">Qualified</span>{' '}
                Students<br />for Your College
              </h1>

              {/* Subheadline */}
              <p
                data-hero
                style={{
                  fontSize: 19, fontWeight: 400, color: '#475569',
                  lineHeight: 1.65, maxWidth: 520, marginBottom: 36,
                }}
                className="mx-auto md:mx-0"
              >
                Kerala's AI counsellor Mitra speaks Malayalam, qualifies students via WhatsApp, and sends you only the hottest leads.
              </p>

              {/* CTA row */}
              <div data-hero style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }} className="justify-center md:justify-start">
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    height: 52, padding: '0 32px',
                    background: 'linear-gradient(135deg, #1E3A5F 0%, #254d7a 100%)',
                    color: 'white',
                    fontSize: 15, fontWeight: 600,
                    borderRadius: 18, textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(30,58,95,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,58,95,0.35), inset 0 1px 0 rgba(255,255,255,0.1)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #254d7a 0%, #2e6096 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,58,95,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1E3A5F 0%, #254d7a 100%)';
                  }}
                >
                  <Zap size={16} /> Get Started Free
                </Link>
                <a
                  href="#how-it-works"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    height: 52, padding: '0 28px',
                    background: 'white', color: '#1E3A5F',
                    fontSize: 15, fontWeight: 500,
                    borderRadius: 18, border: '1.5px solid rgba(168,200,232,0.72)',
                    textDecoration: 'none', transition: 'all 200ms ease',
                    boxShadow: '0 1px 4px rgba(30,58,95,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#85b7eb';
                    e.currentTarget.style.background = '#f0f5fc';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,58,95,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d4e4f4';
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(30,58,95,0.06)';
                  }}
                >
                  See how it works →
                </a>
              </div>

              {/* Trust row — overlapping avatars + social proof */}
              <div
                data-hero
                style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 28 }}
                className="justify-center md:justify-start"
              >
                <div style={{ display: 'flex' }}>
                  {(['RK', 'SN', 'AP', 'MV'] as const).map((initials, i) => (
                    <div key={i} style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: (['#1E3A5F', '#254d7a', '#2D7D46', '#2e6096'] as const)[i],
                      color: 'white', fontSize: 11, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid white',
                      marginLeft: i === 0 ? 0 : -10,
                      zIndex: 4 - i, position: 'relative',
                    }}>{initials}</div>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#475569' }}>
                  <strong style={{ color: '#0f172a' }}>50+ colleges</strong> trust EduLeads
                </span>
                <span style={{ display: 'flex', gap: 2, color: '#f59e0b', fontSize: 12, letterSpacing: 1 }}>
                  ★★★★★
                </span>
              </div>

            </div>

            {/* Right column — animated Mitra demo card */}
            <div className="hidden md:flex w-full md:w-[45%] justify-center items-center" style={{ paddingBottom: 40 }}>
              <MitraChat />
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div
        data-hero
        style={{
          background: 'rgba(255,255,255,0.72)',
          borderTop: '1px solid rgba(226,232,240,0.72)',
          borderBottom: '1px solid rgba(226,232,240,0.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          padding: '32px 24px',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {stats.map(({ value, label }, i) => (
            <div key={label} style={{ flex: 1, textAlign: 'center', padding: '0 40px', position: 'relative' }}>
              {i > 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 1, height: 36, background: '#e2e8f0',
                }} />
              )}
              <span style={{ fontSize: 34, fontWeight: 800, color: '#1E3A5F', letterSpacing: '-0.03em', lineHeight: 1, display: 'block' }}>{value}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', marginTop: 6, display: 'block', fontWeight: 400 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="dot-grid-section"
        style={{ padding: '100px 24px 80px', background: '#f8fafc', position: 'relative' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div data-animate="fade-up" style={{ marginBottom: 56 }}>
            <SectionHeader
              overline="How it works"
              heading="Three simple steps to qualified leads"
              subheading="Mitra does the heavy lifting — you focus on enrolment."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
            {steps.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div
                  data-animate="fade-up"
                  data-delay={String(i + 1) as '1' | '2' | '3'}
                  style={{ flex: 1 }}
                >
                  <div
                    className={`step-card-colored step-card-${i + 1} glass-card squircle-card`}
                    style={{
                      padding: '32px 28px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'default',
                      height: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 24px 54px rgba(30,58,95,0.14)';
                      e.currentTarget.style.borderColor = '#b5d4f4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {/* Watermark number */}
                    <div style={{
                      position: 'absolute', top: 10, right: 16,
                      fontSize: 80, fontWeight: 900,
                      color: '#f1f5f9',
                      lineHeight: 1, userSelect: 'none', pointerEvents: 'none', zIndex: 0,
                      letterSpacing: '-0.05em',
                    }}>
                      {num}
                    </div>
                    {/* Icon */}
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: iconBgByStep[i],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 20, position: 'relative', zIndex: 1,
                    }}>
                      <Icon size={24} style={{ color: iconColorByStep[i] }} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 10, position: 'relative', zIndex: 1 }}>
                      {title}
                    </h3>
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, position: 'relative', zIndex: 1, margin: 0 }}>
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Circular connector arrow */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:flex"
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#94a3b8', fontSize: 13,
                      flexShrink: 0, margin: '0 4px',
                      userSelect: 'none',
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section
        className="dot-grid-section"
        style={{ padding: '100px 24px', background: 'linear-gradient(180deg, rgba(248,250,252,0.78), rgba(237,244,251,0.66))', position: 'relative' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div data-animate="fade-up" style={{ marginBottom: 56 }}>
            <SectionHeader
              overline="Testimonials"
              heading="Trusted by Kerala's top colleges"
              subheading="Real results from admissions teams across the state."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ quote, name, role, initials, avatarBg }, i) => (
              <div
                key={i}
                className="testimonial-card"
                data-animate="fade-up"
                data-delay={String(i + 1) as '1' | '2' | '3'}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, color: '#f59e0b', fontSize: 14, marginBottom: 14, position: 'relative', zIndex: 1 }}>
                  {'★★★★★'}
                </div>
                {/* Quote */}
                <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.75, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                  "{quote}"
                </p>
                {/* Author */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginTop: 20, paddingTop: 16,
                  borderTop: '1px solid #f1f5f9',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: avatarBg, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>{initials}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{ padding: '100px 24px', background: 'linear-gradient(180deg, #ffffff 0%, rgba(237,244,251,0.76) 100%)', position: 'relative', overflow: 'visible' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-animate="fade-up" style={{ marginBottom: 56 }}>
            <SectionHeader
              overline="Pricing"
              heading="Simple, transparent pricing"
              subheading="No hidden fees. Pay monthly. Cancel anytime."
            />
          </div>

          <div
            className="pricing-grid"
            style={{ overflow: 'visible' }}
          >
            {plans.map((plan, i) => {
              const isPro = !!plan.popular;
              const isPremium = plan.key === 'premium';
              const isBasic = plan.key === 'basic';

              return (
                <div
                  key={plan.key}
                  data-animate="fade-up"
                  data-delay={String(i + 1) as '1' | '2' | '3'}
                  className={`pricing-card glass-card squircle-card${isPro ? ' pricing-card-pro' : ''}${isPremium ? ' pricing-card-premium pricing-card-premium-shimmer' : ''}${isBasic ? ' pricing-card-basic' : ''}`}
                  style={{
                    position: 'relative',
                    zIndex: isPro ? 2 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    if (!isPro) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPro) {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {isPro && (
                    <div className="pricing-popular-badge">
                      Most Popular
                    </div>
                  )}

                  {/* Plan name */}
                  <div style={{ marginBottom: 8 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 600,
                      color: isPro ? 'rgba(255,255,255,0.6)' : isPremium ? '#d4a017' : '#475569',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      {plan.name}
                      {isPremium && (
                        <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999 }}>
                          Premium
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Price */}
                  <p style={{
                    fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 20,
                    color: isPro ? 'white' : '#0f172a',
                  }}>
                    {plan.price}
                    <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4, color: isPro ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>/mo</span>
                  </p>

                  <div style={{ height: 1, background: isPro ? 'rgba(255,255,255,0.1)' : '#e2e8f0', margin: '0 0 20px' }} />

                  {/* Features */}
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, listStyle: 'none', flexGrow: 1, marginBottom: 24 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 1,
                          background: isPro ? 'rgba(255,255,255,0.1)' : isPremium ? '#fef3c7' : '#edf4fb',
                          color: isPro ? '#86efac' : isPremium ? '#d4a017' : '#1E3A5F',
                        }}>
                          <CheckCircle2 size={12} />
                        </div>
                        <span style={{
                          fontSize: 14, lineHeight: 1.5,
                          color: isPro ? 'rgba(255,255,255,0.8)' : '#475569',
                        }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to="/register"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '100%', height: 46,
                      fontSize: 15, fontWeight: isPro ? 700 : 600,
                      borderRadius: 12,
                      background: isPro
                        ? 'white'
                        : isPremium
                          ? 'linear-gradient(135deg, #1E3A5F, #254d7a)'
                          : 'white',
                      color: isPro
                        ? '#1E3A5F'
                        : isPremium
                          ? 'white'
                          : '#1E3A5F',
                      border: isPro || isPremium ? 'none' : '1.5px solid #d4e4f4',
                      cursor: 'pointer', transition: 'all 200ms ease',
                      textDecoration: 'none', boxSizing: 'border-box',
                      boxShadow: isPro
                        ? '0 4px 16px rgba(255,255,255,0.15)'
                        : isPremium
                          ? '0 4px 16px rgba(30,58,95,0.25)'
                          : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (isPro) {
                        e.currentTarget.style.background = '#f0f5fc';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      } else if (isPremium) {
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,58,95,0.35)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      } else {
                        e.currentTarget.style.background = '#edf4fb';
                        e.currentTarget.style.borderColor = '#85b7eb';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,58,95,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isPro) {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      } else if (isPremium) {
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,58,95,0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      } else {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#d4e4f4';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    Get Started
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Privacy & Trust ─────────────────────────────────── */}
      <section
        style={{
          padding: '100px 24px',
          background: 'linear-gradient(180deg, #0f2137 0%, #1E3A5F 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,118,181,0.06)', top: -100, right: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(56,160,87,0.05)', bottom: -80, left: -60, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div data-animate="fade-up" style={{ marginBottom: 56 }}>
            <SectionHeader
              overline="Privacy & Trust"
              heading="Built for trust"
              subheading="Student data is protected by default. Colleges receive only what students consent to share."
              dark
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {trust.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="trust-card-glass"
                data-animate="fade-up"
                data-delay={String(i + 1) as '1' | '2' | '3' | '4'}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Icon size={24} style={{ color: 'rgba(255,255,255,0.65)' }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
