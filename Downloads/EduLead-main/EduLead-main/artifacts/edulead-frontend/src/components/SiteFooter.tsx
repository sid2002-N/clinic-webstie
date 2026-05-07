import { Link } from 'react-router-dom';
import { EduLeadsLogoMark } from './EduLeadsLogo';
import { MessageCircle, Mail, Phone, MapPin, Instagram, Twitter, Linkedin, ArrowRight } from 'lucide-react';

const PRODUCT_LINKS = [
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'For Colleges', to: '/register' },
  { label: 'For Agencies', to: '/register' },
  { label: 'Dashboard', to: '/login' },
];

const COMPANY_LINKS = [
  { label: 'About us', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Careers', to: '/careers' },
  { label: 'Privacy policy', to: '/privacy-policy' },
  { label: 'Terms of use', to: '/terms-of-use' },
];

const SUPPORT_LINKS = [
  { label: 'Contact support', href: '#' },
  { label: 'WhatsApp us', href: 'https://wa.me/91XXXXXXXXXX', external: true },
  { label: 'FAQ', to: '/how-it-works#faq' },
  { label: 'System status', href: '#' },
];

function FooterLink({ label, to, href, external }: { label: string; to?: string; href?: string; external?: boolean }) {
  const style: React.CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    transition: 'color 0.15s',
    display: 'block',
    marginBottom: 10,
  };
  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; },
    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; },
  };
  if (to) return <Link to={to} style={style} {...handlers}>{label}</Link>;
  return (
    <a href={href} style={style} {...handlers} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {label}
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer style={{ background: '#0f2137', color: 'white' }}>

      {/* ── Newsletter bar ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '36px 48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 55%', minWidth: 200 }}>
            <p style={{ fontWeight: 600, fontSize: 18, color: 'white', marginBottom: 4 }}>
              Stay updated on Kerala admissions trends
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              Monthly insights on student intent data, quota usage, and platform updates.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="your@college.edu"
              style={{
                width: 260, height: 42,
                padding: '0 16px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                color: 'white', fontSize: 14,
                outline: 'none',
                fontFamily: 'var(--font)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            />
            <button
              style={{
                height: 42, padding: '0 20px',
                background: 'white', color: '#1E3A5F',
                fontSize: 14, fontWeight: 600,
                border: 'none', borderRadius: 10,
                cursor: 'pointer', transition: 'all 200ms ease',
                display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap', fontFamily: 'var(--font)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#edf4fb'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main columns ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '48px 48px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        gap: 32,
      }}
        className="footer-main-grid"
      >
        {/* Brand column */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <EduLeadsLogoMark size={40} />
            <div style={{ marginTop: 10 }}>
              <p style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2, color: 'white', margin: 0 }}>EduLeads Kerala</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.2, marginTop: 2 }}>AI-powered admissions</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 20 }}>
            Kerala's first AI counsellor that speaks Malayalam, qualifies students on WhatsApp, and delivers hot leads directly to your admissions team.
          </p>
          {/* WhatsApp ghost button */}
          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10,
              background: 'rgba(37,211,102,0.12)',
              border: '1px solid rgba(37,211,102,0.25)',
              color: '#4ade80',
              fontSize: 13, fontWeight: 500,
              textDecoration: 'none', marginTop: 4,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(37,211,102,0.20)';
              e.currentTarget.style.borderColor = 'rgba(37,211,102,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(37,211,102,0.12)';
              e.currentTarget.style.borderColor = 'rgba(37,211,102,0.25)';
            }}
          >
            <MessageCircle size={14} /> Chat on WhatsApp
          </a>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {[
              { icon: Instagram, href: '#', label: 'Instagram' },
              { icon: Twitter,   href: '#', label: 'Twitter / X' },
              { icon: Linkedin,  href: '#', label: 'LinkedIn' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none', transition: 'all 150ms ease',
                  color: 'rgba(255,255,255,0.5)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Product
          </p>
          {PRODUCT_LINKS.map((l) => <FooterLink key={l.label} {...l} />)}
        </div>

        {/* Company */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Company
          </p>
          {COMPANY_LINKS.map((l) => <FooterLink key={l.label} {...l} />)}
        </div>

        {/* Support */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Support
          </p>
          {SUPPORT_LINKS.map((l) => <FooterLink key={l.label} {...l} />)}
        </div>

        {/* Contact */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Contact
          </p>
          {[
            { icon: Mail,   text: 'hello@eduleads.in', href: 'mailto:hello@eduleads.in' },
            { icon: Phone,  text: '+91 98765 43210',   href: 'tel:+919876543210' },
            { icon: MapPin, text: 'Kochi, Kerala',      href: '#' },
          ].map(({ icon: Icon, text, href }) => (
            <a key={text} href={href}
              style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', opacity: 0.75, transition: 'opacity 150ms', marginBottom: 12 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.75'; }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{text}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '20px 48px' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
          fontSize: 13, color: 'rgba(255,255,255,0.3)',
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} EduLeads Kerala Pvt. Ltd. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Privacy', to: '/privacy-policy' },
              { label: 'Terms', to: '/terms-of-use' },
              { label: 'Cookie policy', to: '/privacy-policy#cookies' },
            ].map(({ label, to }) => (
              <Link key={label} to={to}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
              >
                {label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
