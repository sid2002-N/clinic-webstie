import { Link } from 'react-router-dom';
import { EduLeadsLogo } from '../components/EduLeadsLogo';
import SiteFooter from '../components/SiteFooter';
import { Code2, BarChart3, Megaphone, MessageCircle, Handshake, Mail, ArrowRight, Sparkles } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const ROLES = [
  {
    icon: Code2,
    title: 'Full-Stack Intern',
    tag: 'Engineering',
    desc: 'Help build the React frontend and Django/FastAPI backend. Work on real features used by actual colleges and students. Ideal for 2nd/3rd year B.Tech CSE/IT students.',
    skills: ['React', 'TypeScript', 'Python / Django', 'REST APIs'],
  },
  {
    icon: Sparkles,
    title: 'AI / ML Collaborator',
    tag: 'AI Engineering',
    desc: 'Help train and improve Mitra — our Malayalam-speaking AI counsellor. Work on NLP pipelines, lead scoring models, and conversation quality evaluation.',
    skills: ['Python', 'LLMs / Prompt engineering', 'NLP', 'TensorFlow / Scikit-learn'],
  },
  {
    icon: BarChart3,
    title: 'Data & Analytics Intern',
    tag: 'Analytics',
    desc: 'Build the analytics layer — dashboards, funnel reports, admission trend visualisations. Turn raw lead data into insights colleges can act on.',
    skills: ['SQL / PostgreSQL', 'Python / Pandas', 'Power BI or Tableau', 'Data storytelling'],
  },
  {
    icon: Megaphone,
    title: 'Growth & Marketing Intern',
    tag: 'Growth',
    desc: 'Help reach Kerala colleges and students — social content, outreach campaigns, WhatsApp strategies, and education-sector partnerships.',
    skills: ['Content creation', 'Social media', 'Education sector interest', 'Malayalam speaking preferred'],
  },
  {
    icon: MessageCircle,
    title: 'Content & Community',
    tag: 'Content',
    desc: 'Write blog posts, help document the product, and build community around EduLeads Kerala — for both students and admissions teams.',
    skills: ['Writing (English + Malayalam)', 'Research', 'SEO basics'],
  },
  {
    icon: Handshake,
    title: 'College Partnership Intern',
    tag: 'Business',
    desc: 'Reach out to and onboard Kerala colleges as pilot partners. No cold-calling scripts — just genuine relationship-building with admissions directors.',
    skills: ['Communication', 'Malayalam speaking', 'Kerala college network a bonus'],
  },
];

const PERKS = [
  { emoji: '🎓', title: 'Learn by shipping', desc: 'Work on a real, live product — not a practice project.' },
  { emoji: '🌱', title: 'Equity conversation', desc: 'Early collaborators will be considered for equity or revenue share as we grow.' },
  { emoji: '📜', title: 'Experience certificate', desc: 'Official internship letter for your CV or further studies.' },
  { emoji: '🤝', title: 'Flexible & remote', desc: 'Work from anywhere in Kerala (or beyond). Hours are flexible around your college schedule.' },
  { emoji: '🚀', title: 'Grow with us', desc: 'We are building from 0 → 1 right now. Your work will visibly shape the product.' },
  { emoji: '💬', title: 'Direct access', desc: 'Work directly with the founder — no bureaucracy, no middle layers.' },
];

export default function Careers() {
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: '#0f172a', background: '#fff' }}>
      <SEOHead
        title="Careers — Join the EduLeads Kerala Team"
        description="Join EduLeads Kerala and help reshape how students discover colleges in Kerala. Open roles in engineering, AI/ML, analytics, marketing, and partnerships — remote-friendly, equity on the table."
        canonical="/careers"
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
      <section style={{ background: 'linear-gradient(135deg, #0f2d1c 0%, #1a4d2e 60%, #2D7D46 100%)', color: 'white', padding: '80px 24px 72px', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 99, marginBottom: 24 }}>
          We're hiring
        </span>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 22 }}>
          Build something real.<br />Grow something meaningful.
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 36px' }}>
          EduLeads Kerala is a one-person startup right now — and that's exactly why this is exciting. I'm looking for interns, co-builders, and collaborators who want to shape a product that could change how an entire state does college admissions.
        </p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)' }}>
          — Siddharth P Santhosh, Founder
        </p>
      </section>

      {/* Open roles */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#0f2137', textAlign: 'center', marginBottom: 12 }}>
            Open roles
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 52, maxWidth: 520, margin: '0 auto 52px' }}>
            All roles are unpaid internships or equity-based collaborations for now. If the product takes off, so do you.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {ROLES.map(({ icon: Icon, title, tag, desc, skills }) => (
              <div key={title} style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px 24px', background: 'white', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color="#1e3a5f" />
                  </div>
                  <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.05em' }}>
                    {tag}
                  </span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 17, color: '#0f2137', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, marginBottom: 18 }}>{desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skills.map(s => (
                    <span key={s} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 6 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section style={{ background: '#f8fafc', padding: '72px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#0f2137', textAlign: 'center', marginBottom: 48 }}>
            What you get
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {PERKS.map(({ emoji, title, desc }) => (
              <div key={title} style={{ background: 'white', borderRadius: 14, padding: '22px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 26, marginBottom: 10 }}>{emoji}</p>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#0f2137', marginBottom: 6 }}>{title}</p>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to apply */}
      <section style={{ padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#0f2137', marginBottom: 18 }}>
            How to reach out
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.75, marginBottom: 36 }}>
            No formal application form — just send me an email. Tell me who you are, which role interests you, and what you've built or done that you're proud of. A GitHub link, a portfolio, or even a voice note works.
          </p>
          <a
            href="mailto:siddharthpsanthosh07@gmail.com?subject=EduLeads Kerala — Collaboration Interest"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#1e3a5f', color: 'white',
              padding: '14px 32px', borderRadius: 12,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
            }}
          >
            <Mail size={18} />
            siddharthpsanthosh07@gmail.com
          </a>
          <p style={{ marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
            Or connect on{' '}
            <a href="https://wa.me/916282762713" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
              WhatsApp (+91 6282762713)
            </a>
          </p>

          <div style={{ marginTop: 52, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>
              Learn about us <ArrowRight size={14} />
            </Link>
            <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>
              Read our story <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
