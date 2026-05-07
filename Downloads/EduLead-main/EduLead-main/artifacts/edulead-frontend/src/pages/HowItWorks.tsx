import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EduLeadsLogo } from '../components/EduLeadsLogo';
import SEOHead from '@/components/SEOHead';
import {
  MessageCircle, TrendingUp, Users, CheckCircle2, ChevronRight,
  Phone, Eye, Shield, Zap, Clock,
  ArrowRight, Play, Bot, GraduationCap, BarChart3,
} from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';

/* ── Mitra conversation simulation ─────────────────────── */
const mitraConvo = [
  { from: 'student', text: 'Hai, college admission details venam', delay: 0 },
  { from: 'mitra',   text: 'Namasthe! 😊 Ente peru Mitra. Ningalude course preference enthaanu?', delay: 1200 },
  { from: 'student', text: 'B.Tech Computer Science venam', delay: 2600 },
  { from: 'mitra',   text: 'Kollam! Budget range enthaanu expect cheyyunnathu? (Fees per year)', delay: 3800 },
  { from: 'student', text: '1-2 lakh per year okay aanu', delay: 5200 },
  { from: 'mitra',   text: 'Admission 2025-26 aano? Location preference onnum undoo?', delay: 6600 },
  { from: 'student', text: 'Yes 2025. Thrissur or Ernakulam', delay: 8000 },
  { from: 'mitra',   text: '✅ Score: 82/100 — Hot lead! Ningalkku best colleges match cheytu aanu 😊', delay: 9400 },
];

/* ── Score dimensions ───────────────────────────────────── */
const dimensions = [
  { label: 'Intent',     score: 90, color: '#22c55e' },
  { label: 'Budget',     score: 78, color: '#3b82f6' },
  { label: 'Timeline',   score: 85, color: '#8b5cf6' },
  { label: 'Location',   score: 75, color: '#f59e0b' },
];

/* ── Mock leads for dashboard demo ─────────────────────── */
const mockLeads = [
  { name: 'Arjun M.', course: 'B.Tech CSE', score: 82, category: 'hot',  location: 'Thrissur', budget: '₹1-2L/yr', time: '2 mins ago' },
  { name: 'Priya K.', course: 'BCA',        score: 71, category: 'warm', location: 'Ernakulam', budget: '₹80K/yr',  time: '15 mins ago' },
  { name: 'Rajan S.', course: 'B.Tech ECE', score: 65, category: 'warm', location: 'Kozhikode', budget: '₹1.5L/yr', time: '1 hr ago' },
];

const steps = [
  {
    num: '01',
    icon: MessageCircle,
    title: 'Student messages on WhatsApp',
    color: '#25D366',
    bg: '#dcfce7',
    detail: 'A Kerala student sees the college\'s WhatsApp number or an ad. They send a simple message in Malayalam. No app download. No form filling.',
  },
  {
    num: '02',
    icon: Bot,
    title: 'Mitra qualifies in Malayalam',
    color: '#3b82f6',
    bg: '#dbeafe',
    detail: 'Our AI counsellor Mitra responds instantly in natural Malayalam. She asks about course preference, budget, timeline, and location — like a real counsellor would.',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Lead scored 0–100',
    color: '#8b5cf6',
    bg: '#ede9fe',
    detail: 'Every answer is analysed. Intent level, budget match, urgency, and location preference combine into a single score. Hot (70+), Warm (40–69), or Cold (<40).',
  },
  {
    num: '04',
    icon: Users,
    title: 'Matched to best-fit colleges',
    color: '#f59e0b',
    bg: '#fef3c7',
    detail: 'Hot leads are instantly routed to colleges that match by course and location. Premium colleges get exclusive leads; Pro colleges share with up to 3 others.',
  },
  {
    num: '05',
    icon: GraduationCap,
    title: 'College connects with student',
    color: '#1e3a5f',
    bg: '#dbeafe',
    detail: 'The admissions team sees the lead in their dashboard, starts an in-app chat, or initiates a masked call — all without revealing the student\'s real phone number.',
  },
];

const planFeatures = [
  { plan: 'Basic',   icon: '🟦', color: '#3b82f6', leads: 10,  masked: false, phone: false, exclusive: false },
  { plan: 'Pro',     icon: '⭐', color: '#8b5cf6', leads: 30,  masked: true,  phone: false, exclusive: false },
  { plan: 'Premium', icon: '💎', color: '#1e3a5f', leads: 100, masked: true,  phone: true,  exclusive: true },
];

const faqs = [
  {
    q: 'Is Mitra really fluent in Malayalam?',
    a: 'Yes. Mitra is trained specifically for Kerala students. She understands code-switched Malayalam-English (Manglish), regional idioms, and college admission terminology.',
  },
  {
    q: 'How is the lead score calculated?',
    a: 'The score combines four dimensions: intent level (how keen the student is), budget alignment, admission timeline, and location match with your college. Each is weighted and normalised to 0–100.',
  },
  {
    q: 'Can students tell they\'re talking to an AI?',
    a: 'Mitra is transparent about being an AI assistant. Students know they\'re chatting with an automated counsellor. This actually builds trust because responses are instant — 24/7.',
  },
  {
    q: 'What happens when a student doesn\'t want to be contacted?',
    a: 'Students can type "stop" at any time. They\'re immediately opted out and no lead is generated. We comply with Kerala\'s data guidelines.',
  },
  {
    q: 'How fast are leads delivered?',
    a: 'Under 1.5 seconds from the moment Mitra completes the conversation. Leads appear live in your dashboard with a real-time notification.',
  },
];

/* ── Mini WhatsApp chat component ───────────────────────── */
function MitraChat() {
  const [visible, setVisible] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  function startDemo() {
    setVisible([]);
    setDone(false);
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return;
    mitraConvo.forEach((msg, i) => {
      setTimeout(() => {
        setVisible((v) => [...v, i]);
        if (i === mitraConvo.length - 1) {
          setRunning(false);
          setDone(true);
        }
      }, msg.delay);
    });
  }, [running]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visible]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <SEOHead
        title="How It Works — Mitra AI Counsellor & Lead Scoring"
        description="See exactly how EduLeads Kerala works: Mitra engages students in Malayalam on WhatsApp, scores every lead 0–100 on intent and budget, then distributes hot leads to matched colleges in real time."
        canonical="/how-it-works"
      />
      {/* phone shell */}
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          margin: '0 auto',
          borderRadius: 24,
          overflow: 'hidden',
          border: '6px solid #1a1a2e',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        }}
      >
        {/* status bar */}
        <div style={{ background: '#075e54', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <p style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>Mitra — EduLeads AI</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Online • replies instantly</p>
          </div>
        </div>

        {/* chat body */}
        <div
          style={{
            background: '#ECE5DD',
            minHeight: 340,
            maxHeight: 380,
            overflowY: 'auto',
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {visible.length === 0 && !running && (
            <div style={{ textAlign: 'center', marginTop: 80, color: '#888', fontSize: 13 }}>
              Press Play to see Mitra in action
            </div>
          )}
          {mitraConvo.map((msg, i) => {
            if (!visible.includes(i)) return null;
            const isStudent = msg.from === 'student';
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isStudent ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    background: isStudent ? '#DCF8C6' : 'white',
                    borderRadius: isStudent ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '8px 12px',
                    maxWidth: '80%',
                    fontSize: 13,
                    lineHeight: 1.5,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {running && visible.length < mitraConvo.length && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: 'white', borderRadius: '12px 12px 12px 2px', padding: '10px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map((d) => (
                    <div key={d} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#999',
                      animation: `bounce 1s ease-in-out ${d * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* controls */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        {!running ? (
          <button
            onClick={startDemo}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#25D366', color: 'white', border: 'none',
              borderRadius: 999, padding: '10px 24px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,211,102,0.35)',
            }}
          >
            <Play size={14} fill="white" />
            {done ? 'Replay Demo' : 'Play Demo'}
          </button>
        ) : (
          <p style={{ fontSize: 13, color: '#666' }}>Mitra is chatting…</p>
        )}
      </div>
    </div>
  );
}

/* ── Score bar ──────────────────────────────────────────── */
function ScoreBar({ label, score, color, animate }: { label: string; score: number; color: string; animate: boolean }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setWidth(score), 200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [animate, score]);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99, background: color,
          width: `${width}%`,
          transition: 'width 0.9s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  );
}

/* ── Lead score panel ───────────────────────────────────── */
function LeadScoreDemo() {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimate(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      background: 'white', borderRadius: 16, padding: 28,
      border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: animate ? '#dcfce7' : '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.5s',
          border: `3px solid ${animate ? '#22c55e' : '#e5e7eb'}`,
        }}>
          <span style={{
            fontSize: 22, fontWeight: 900,
            color: animate ? '#16a34a' : '#9ca3af',
            transition: 'color 0.5s',
          }}>
            {animate ? '82' : '--'}
          </span>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Arjun M.</p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>B.Tech CSE · Thrissur</p>
          {animate && (
            <span style={{
              display: 'inline-block', marginTop: 4,
              background: '#dcfce7', color: '#15803d',
              fontSize: 11, fontWeight: 700, padding: '2px 10px',
              borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              🔥 Hot Lead
            </span>
          )}
        </div>
      </div>
      {dimensions.map((d) => (
        <ScoreBar key={d.label} {...d} animate={animate} />
      ))}
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
        Scroll into view to watch score animate live
      </p>
    </div>
  );
}

/* ── Mock dashboard preview ─────────────────────────────── */
function DashboardPreview() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    }}>
      {/* fake browser chrome */}
      <div style={{ background: '#f9fafb', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <div style={{ flex: 1, marginLeft: 8, background: 'white', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#9ca3af', border: '1px solid #e5e7eb' }}>
          app.eduleads.in/dashboard/leads
        </div>
      </div>

      {/* fake dashboard */}
      <div style={{ background: '#f8fafc', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>My Leads</p>
          <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 99 }}>
            3 new today
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mockLeads.map((lead, i) => (
            <div
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{
                background: 'white', borderRadius: 10, padding: '12px 14px',
                border: selected === i ? '1px solid #1e3a5f' : '1px solid #e5e7eb',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: selected === i ? '0 0 0 3px rgba(30,58,95,0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{lead.name}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{lead.course} · {lead.location}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 16, fontWeight: 900,
                    color: lead.score >= 75 ? '#16a34a' : '#d97706',
                  }}>{lead.score}</span>
                  <div style={{ marginTop: 2 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: lead.category === 'hot' ? '#dcfce7' : '#fef3c7',
                      color: lead.category === 'hot' ? '#15803d' : '#92400e',
                      textTransform: 'uppercase',
                    }}>
                      {lead.category === 'hot' ? '🔥 Hot' : '☀️ Warm'}
                    </span>
                  </div>
                </div>
              </div>

              {selected === i && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Budget: {lead.budget} · {lead.time}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{
                      flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #1e3a5f',
                      background: '#1e3a5f', color: 'white', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}>
                      <MessageCircle size={12} /> Chat
                    </button>
                    <button style={{
                      flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #e5e7eb',
                      background: 'white', color: '#374151', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}>
                      <Phone size={12} /> Call
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── FAQ item ───────────────────────────────────────────── */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: 12, border: '1px solid #e5e7eb',
        background: 'white', overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        boxShadow: open ? '0 4px 20px rgba(0,0,0,0.07)' : 'none',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '18px 22px', textAlign: 'left',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#111827', paddingRight: 16 }}>{q}</span>
        <ChevronRight
          size={18}
          style={{
            color: '#6b7280', flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.25s',
          }}
        />
      </button>
      {open && (
        <p style={{ padding: '0 22px 18px', fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────── */
export default function HowItWorks() {
  return (
    <div style={{ fontFamily: 'var(--font, Inter, sans-serif)', color: '#111827', background: '#f9fafb' }}>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .step-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important; transform: translateY(-2px); }
        .step-card { transition: all 0.2s; }
      `}</style>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <EduLeadsLogo size={34} />
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Sign in
          </Link>
          <Link to="/register" style={{ padding: '8px 20px', borderRadius: 8, background: '#1e3a5f', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a9e 100%)',
        padding: '72px 24px 80px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 24, fontSize: 13, color: 'rgba(255,255,255,0.85)',
          }}>
            <Zap size={13} /> Interactive guide + live demo
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: 'white', marginBottom: 18, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            How EduLeads Kerala Works
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            From a WhatsApp message in Malayalam to a qualified lead in your dashboard — see every step of the journey.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              <Play size={15} fill="white" /> Try the demo
            </a>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Get started free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5-step visual guide ──────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>The full journey</p>
            <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
              From message to enrolled student
            </h2>
          </div>

          {/* vertical timeline on mobile, horizontal on desktop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                {/* left: number + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 28 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: step.bg, border: `2px solid ${step.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <step.icon size={22} style={{ color: step.color }} />
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 40, background: '#e5e7eb', margin: '6px 0' }} />
                  )}
                </div>

                {/* right: card */}
                <div
                  className="step-card"
                  style={{
                    flex: 1, marginBottom: i < steps.length - 1 ? 8 : 0,
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    borderRadius: 14, padding: '20px 24px',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: step.color,
                      background: step.bg, padding: '2px 8px', borderRadius: 99,
                    }}>
                      STEP {step.num}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live demo section ────────────────────────────────── */}
      <section id="demo" style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Live demo</p>
            <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
              See it happen in real time
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginTop: 12, maxWidth: 520, margin: '12px auto 0' }}>
              Interact with all three demos below to experience each stage of the platform.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 32,
            alignItems: 'start',
          }}>
            {/* Demo 1: Mitra chat */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={16} style={{ color: '#16a34a' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Step 1–2: Mitra qualifies</h3>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Watch a real Malayalam conversation. Mitra gathers all the signals a college needs — in under 2 minutes.
                </p>
              </div>
              <MitraChat />
            </div>

            {/* Demo 2: Score */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={16} style={{ color: '#7c3aed' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Step 3: Lead scoring</h3>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Four dimensions are scored and combined. Scroll to animate the bars and see how the final score of 82/100 is calculated.
                </p>
              </div>
              <LeadScoreDemo />
            </div>

            {/* Demo 3: Dashboard */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={16} style={{ color: '#1d4ed8' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Step 4–5: College dashboard</h3>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Click any lead to expand it and see the Chat + Call actions. This is what your admissions team sees.
                </p>
              </div>
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Plan comparison ──────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Data access by plan</p>
            <h2 style={{ fontSize: 'clamp(20px,4vw,32px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
              What data does each plan unlock?
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '2px solid #e5e7eb' }}>Feature</th>
                  {planFeatures.map((p) => (
                    <th key={p.plan} style={{ padding: '12px 16px', textAlign: 'center', color: p.color, fontWeight: 700, borderBottom: '2px solid #e5e7eb' }}>
                      {p.icon} {p.plan}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Leads / month', values: planFeatures.map((p) => `${p.leads}`) },
                  { label: 'Student name & course', values: ['✅', '✅', '✅'] },
                  { label: 'Intent score & category', values: ['✅', '✅', '✅'] },
                  { label: 'Location & budget data', values: ['—', '✅', '✅'] },
                  { label: 'In-app chat with student', values: ['✅', '✅', '✅'] },
                  { label: 'Masked calling', values: ['—', '✅', '✅'] },
                  { label: 'Real phone number', values: ['—', '—', '✅'] },
                  { label: 'Exclusive leads', values: ['—', '—', '✅'] },
                  { label: 'CSV export', values: ['—', '—', '✅'] },
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                    <td style={{ padding: '12px 16px', color: '#374151', fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', color: v === '✅' ? '#16a34a' : v === '—' ? '#d1d5db' : '#374151', fontWeight: v === '✅' ? 700 : 400 }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#1e3a5f', color: 'white', padding: '13px 32px',
              borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}>
              🎓 Start free — pick a plan later <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust & privacy ──────────────────────────────────── */}
      <section style={{ padding: '72px 24px', background: '#1e3a5f' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(20px,4vw,30px)', fontWeight: 900, color: 'white' }}>
              Privacy by design
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginTop: 10 }}>
              We built consent and data minimisation into every step.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { icon: Shield,      title: 'Phone numbers masked',    desc: 'Default on all plans. Student\'s real number is never exposed unless they consent (Premium plan).' },
              { icon: CheckCircle2,title: 'Opt-out in one message',  desc: 'Any student can type "stop" and they\'re immediately removed — no lead is created, no data stored.' },
              { icon: Eye,         title: 'Data shared with consent',desc: 'Course interest and budget are shared. Personal contact details follow the plan tier and student preference.' },
              { icon: Clock,       title: 'Data retained for 2 years',desc: 'Lead data is automatically purged after 2 years. Colleges cannot export data beyond their plan limits.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '24px 22px',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color="white" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
              Frequently asked questions
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((faq) => <FAQ key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#111827', marginBottom: 14, letterSpacing: '-0.02em' }}>
            Ready to receive qualified leads?
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 36, lineHeight: 1.7 }}>
            Set up in under 5 minutes. No integration required — we handle the WhatsApp number and AI counsellor.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px',
              background: '#1e3a5f', color: 'white', borderRadius: 12,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
            }}>
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
              background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 12,
              fontWeight: 600, fontSize: 15, textDecoration: 'none',
            }}>
              Back to home
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
