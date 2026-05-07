import { Link } from 'react-router-dom';
import { EduLeadsLogo } from '../components/EduLeadsLogo';
import SiteFooter from '../components/SiteFooter';
import { Calendar, Clock, ArrowRight, MapPin, Cpu, GraduationCap } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const FOUNDER_ARTICLE = {
  date: 'May 2025',
  readTime: '6 min read',
  tag: 'Founder Story',
  title: 'Why a Kerala engineer decided to fix college admissions with AI',
  subtitle: 'The frustration, the research, and the late nights that became EduLeads Kerala.',
};

export default function Blog() {
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: '#0f172a', background: '#fff' }}>
      <SEOHead
        title="Blog — EdTech Insights & Kerala College Admissions"
        description="Read the EduLeads Kerala blog for insights on AI in education, Kerala college admission trends, and founder stories behind building Mitra."
        canonical="/blog"
        ogType="article"
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

      {/* Page header */}
      <section style={{ background: '#f8fafc', padding: '56px 24px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0f2137', marginBottom: 14 }}>
          Blog
        </h1>
        <p style={{ fontSize: 17, color: '#64748b', maxWidth: 520, margin: '0 auto' }}>
          Stories, ideas, and lessons from building EduLeads Kerala from the ground up.
        </p>
      </section>

      {/* Featured article card */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '52px 24px' }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Article hero banner */}
          <div style={{ background: 'linear-gradient(135deg, #0f2137 0%, #1e3a5f 50%, #2D7D46 100%)', padding: '52px 48px', color: 'white' }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 99, marginBottom: 20 }}>
              {FOUNDER_ARTICLE.tag}
            </span>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 16, maxWidth: 560 }}>
              {FOUNDER_ARTICLE.title}
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: 520 }}>
              {FOUNDER_ARTICLE.subtitle}
            </p>
            <div style={{ display: 'flex', gap: 20, marginTop: 28, fontSize: 13, color: 'rgba(255,255,255,0.55)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} />{FOUNDER_ARTICLE.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} />{FOUNDER_ARTICLE.readTime}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} />Pathanamthitta, Kerala</span>
            </div>
          </div>

          {/* Article body */}
          <div style={{ padding: '48px 48px 52px', lineHeight: 1.85, fontSize: 16, color: '#374151' }}>

            <p style={{ marginBottom: 22 }}>
              I am <strong style={{ color: '#0f2137' }}>Siddharth P Santhosh</strong>, a backend engineer from Pathanamthitta, Kerala. I graduated from APJ Abdul Kalam Technological University, built ML systems, published a research paper on decentralised audio storage, interned at a generative-AI startup, and did contract data work for UST Global. By the end of 2024, I had a fairly respectable CV for someone fresh out of engineering college.
            </p>

            <p style={{ marginBottom: 22 }}>
              What I also had — after watching a younger cousin spend three stressful months calling up college admission offices, getting conflicting information from agents, and ultimately enrolling somewhere that wasn't quite right for him — was a very specific frustration.
            </p>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f2137', margin: '36px 0 14px' }}>
              The problem nobody had solved
            </h3>
            <p style={{ marginBottom: 22 }}>
              Kerala produces hundreds of thousands of engineering and arts graduates each year. The colleges that want to recruit them use a patchwork of cold calls, newspaper ads, education fairs, and agents. The students who want to find the right programme rely on Instagram reels, seniors' opinions, and luck.
            </p>
            <p style={{ marginBottom: 22 }}>
              Nobody was having a real conversation. Nobody was asking a student: <em>"What are you actually interested in? What is your family's location constraint? What KEAM rank did you get?"</em> and then matching that to the right institution — honestly, without a commission motive.
            </p>

            <div style={{ background: '#f0f9ff', borderLeft: '4px solid #1e3a5f', borderRadius: '0 12px 12px 0', padding: '20px 24px', margin: '32px 0', color: '#1e3a5f', fontStyle: 'italic', fontWeight: 500 }}>
              "What if the first call a student got wasn't from a pushy admission agent, but from an AI counsellor who actually knew Kerala's college landscape — and spoke Malayalam?"
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f2137', margin: '36px 0 14px' }}>
              Why I was the right person to build it
            </h3>
            <p style={{ marginBottom: 22 }}>
              I had spent years building backends — Go, Node.js, Python, FastAPI — and working with ML pipelines, PostgreSQL, and real-time data systems. I had shipped a decentralised IPFS-backed platform, an anti-money-laundering fraud detector, and a smart-city computer-vision system using YOLO. I understood how to take a complex AI system and make it reliable in production.
            </p>
            <p style={{ marginBottom: 22 }}>
              More importantly, I understood the Kerala higher-education landscape from the inside. I knew the acronyms (KEAM, KMAT, KLEE), the pressure on families, the role of coaching centres, and the gap between what colleges promise and what students experience.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '32px 0' }}>
              {[
                { icon: Cpu, label: 'AI-powered WhatsApp counsellor' },
                { icon: GraduationCap, label: 'Malayalam-first, Kerala-first' },
                { icon: ArrowRight, label: 'Qualified leads, not cold contacts' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>
                  <Icon size={15} color="#2D7D46" />
                  {label}
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f2137', margin: '36px 0 14px' }}>
              The vision: Mitra
            </h3>
            <p style={{ marginBottom: 22 }}>
              I named the AI counsellor <strong style={{ color: '#0f2137' }}>Mitra</strong> — Malayalam for "friend." She lives on WhatsApp. A student sends a message; Mitra responds in natural Malayalam, asks the right qualification questions, scores the lead, and forwards only the serious, well-matched enquiries to the relevant college's dashboard.
            </p>
            <p style={{ marginBottom: 22 }}>
              Colleges never waste time on unqualified leads again. Students never feel sold to. And the whole interaction happens in minutes, not days.
            </p>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f2137', margin: '36px 0 14px' }}>
              Where we are now
            </h3>
            <p style={{ marginBottom: 22 }}>
              EduLeads Kerala is live in development. The backend handles multi-tenant college accounts, three subscription tiers, round-robin lead allocation, a full audit trail, and a real-time dashboard. The frontend is polished and responsive. Mitra is being trained on the Kerala curriculum.
            </p>
            <p style={{ marginBottom: 0 }}>
              We are preparing to onboard our first 10 pilot colleges. If you are an admissions director, an education agent, a student, or just someone who believes in this idea — I would love to hear from you at <a href="mailto:siddharthpsanthosh07@gmail.com" style={{ color: '#1e3a5f', fontWeight: 600 }}>siddharthpsanthosh07@gmail.com</a>.
            </p>
          </div>

          {/* Author footer */}
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '24px 48px', display: 'flex', alignItems: 'center', gap: 16, background: '#f8fafc' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f, #2e6096)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
              S
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#0f2137', marginBottom: 2 }}>Siddharth P Santhosh</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>Founder & Engineer, EduLeads Kerala · Pathanamthitta, Kerala</p>
            </div>
          </div>
        </div>

        {/* Coming soon */}
        <div style={{ marginTop: 52, textAlign: 'center', padding: '36px 24px', background: '#f8fafc', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
          <p style={{ fontSize: 15, color: '#64748b', marginBottom: 4 }}>More articles on the way</p>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Building Mitra · The Kerala college market · AI in vernacular education</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
