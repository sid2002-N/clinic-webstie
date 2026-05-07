import { Link } from 'react-router-dom';
import { EduLeadsLogo } from '../components/EduLeadsLogo';
import SiteFooter from '../components/SiteFooter';
import { Target, TrendingUp, Users, GraduationCap, MapPin, Lightbulb, Globe, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const STATS = [
  { value: '2M+', label: 'Students appear for Kerala entrance exams each year' },
  { value: '900+', label: 'Engineering & arts colleges across Kerala' },
  { value: '₹4,000 Cr', label: 'Estimated Kerala higher-education market size' },
  { value: '<5%', label: 'Colleges with modern digital admission workflows' },
];

const VALUES = [
  {
    icon: Target,
    title: 'Student-first',
    desc: 'Every feature is designed around what genuinely helps a Kerala student find the right college — in their own language, on their own phone.',
  },
  {
    icon: GraduationCap,
    title: 'Education as access',
    desc: 'A student in a rural district deserves the same quality of guidance as one in Thiruvananthapuram or Kochi. We are closing that gap with AI.',
  },
  {
    icon: Lightbulb,
    title: 'Transparent AI',
    desc: 'Mitra never pressures, never sells — she informs. We publish our qualification criteria so colleges and students always know how scores are calculated.',
  },
  {
    icon: Globe,
    title: 'Kerala roots, national ambition',
    desc: 'We are building deep in Kerala first, earning the trust of local institutions, before expanding to Tamil Nadu, Karnataka, and beyond.',
  },
];

const GROWTH = [
  {
    year: '2025',
    milestone: 'Pilot launch',
    desc: 'On-board 10 Kerala engineering colleges. Deploy Mitra on WhatsApp. Qualify first 1,000 student leads.',
  },
  {
    year: '2026',
    milestone: 'Scale',
    desc: 'Reach 100 colleges across Kerala. Launch Pro & Premium tiers. Introduce real-time admission analytics dashboard.',
  },
  {
    year: '2027',
    milestone: 'Expand',
    desc: 'Enter Tamil Nadu & Karnataka markets. Add Malayalam + Tamil + Kannada counselling. Launch agency reseller network.',
  },
  {
    year: '2028+',
    milestone: 'Platform',
    desc: 'Full admissions OS — from first enquiry to fee payment. Serve 500+ institutions across South India.',
  },
];

export default function AboutUs() {
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: '#0f172a', background: '#fff' }}>
      <SEOHead
        title="About Us — Closing Kerala's College Admission Gap with AI"
        description="EduLeads Kerala was built to give every student in Kerala — rural or urban — the same quality of guidance. Learn about our mission, team, and why we built Mitra."
        canonical="/about"
      />

      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '0 32px', height: 64,
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

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f2137 0%, #1e3a5f 60%, #254d7a 100%)', color: 'white', padding: '80px 24px 72px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 99, marginBottom: 24 }}>
            About EduLeads Kerala
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 24 }}>
            We're building the admission<br />infrastructure Kerala deserves
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, maxWidth: 620, margin: '0 auto' }}>
            EduLeads Kerala is an AI-powered lead generation platform that connects Kerala's colleges with qualified students — using a Malayalam-speaking AI counsellor called Mitra who meets students where they already are: WhatsApp.
          </p>
        </div>
      </section>

      {/* Market stats */}
      <section style={{ background: '#f8fafc', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 40 }}>
            The opportunity we're addressing
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {STATS.map(({ value, label }) => (
              <div key={value} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: '#1e3a5f', lineHeight: 1.1, marginBottom: 10 }}>{value}</p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: '#0f2137', marginBottom: 24 }}>Our mission</h2>
          <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>
            Millions of Kerala students navigate the college admission process with very little personalised guidance. Families rely on word-of-mouth, coaching centres rely on cold calls, and colleges spend enormous budgets chasing the wrong students.
          </p>
          <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.8 }}>
            Our mission is to fix this with AI — an AI counsellor that speaks Malayalam, understands the Kerala curriculum, and can hold a patient, knowledgeable conversation with any student at any hour of the day. Colleges get qualified leads. Students get real guidance. Everyone wins.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: '#f8fafc', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0f2137', textAlign: 'center', marginBottom: 48 }}>What we stand for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#edf4fb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={20} color="#1e3a5f" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0f2137', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0f2137', textAlign: 'center', marginBottom: 12 }}>
            Growth roadmap
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 52 }}>
            We are playing a long game — building trust, then building scale.
          </p>
          <div style={{ position: 'relative' }}>
            {/* vertical line */}
            <div style={{ position: 'absolute', left: 56, top: 0, bottom: 0, width: 2, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {GROWTH.map(({ year, milestone, desc }, i) => (
                <div key={year} style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                  <div style={{ width: 112, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: i === 0 ? '#1e3a5f' : '#e2e8f0',
                      color: i === 0 ? 'white' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13, zIndex: 1,
                    }}>
                      {year.slice(2)}
                    </div>
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <p style={{ fontWeight: 800, fontSize: 16, color: '#0f2137', marginBottom: 4 }}>{year} — {milestone}</p>
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0f2137 0%, #1e3a5f 100%)', padding: '72px 24px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, marginBottom: 16 }}>
          Want to be part of this?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
          We're looking for builders, colleges, and collaborators who believe in this mission.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/careers" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2D7D46', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Join the team <ArrowRight size={16} />
          </Link>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
            Register your college
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
