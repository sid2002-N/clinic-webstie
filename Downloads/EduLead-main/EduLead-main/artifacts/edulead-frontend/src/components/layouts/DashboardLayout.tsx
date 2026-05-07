import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, BookOpen, BarChart2, Users, Settings,
  CreditCard, LogOut, MessageSquare, Menu, X,
  Home, Bell,
} from 'lucide-react';
import { animate } from 'animejs';
import { staggerIn, openSidebar, closeSidebar, pageEnter } from '../../utils/animations';
import { EduLeadsLogo, EduLeadsLogoMark } from '../EduLeadsLogo';

const navSections = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard/overview',  label: 'Home',      icon: Home },
      { to: '/dashboard/leads',     label: 'Leads',     icon: BookOpen },
      { to: '/dashboard/messages',  label: 'Messages',  icon: MessageSquare },
    ],
  },
  {
    label: 'Manage',
    items: [
      { to: '/dashboard/quota',     label: 'Analytics', icon: BarChart2 },
      { to: '/dashboard/team',      label: 'Team',      icon: Users },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/settings',  label: 'Settings',  icon: Settings },
      { to: '/dashboard/billing',   label: 'Billing',   icon: CreditCard },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/overview': 'Overview',
  '/dashboard/leads':    'Leads',
  '/dashboard/messages': 'Messages',
  '/dashboard/quota':    'Analytics',
  '/dashboard/team':     'Team',
  '/dashboard/settings': 'Settings',
  '/dashboard/billing':  'Billing',
};

const planColors: Record<string, string> = {
  premium: 'badge-premium',
  pro:     'badge-pro',
  basic:   'badge-basic',
};

export default function DashboardLayout() {
  const { clearAuth, tenantName, plan } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const desktopSidebarRef = useRef<HTMLElement>(null);

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const initials = (tenantName || 'E')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const pageTitle = (() => {
    for (const key of Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length)) {
      if (location.pathname.startsWith(key)) return PAGE_TITLES[key];
    }
    return 'Dashboard';
  })();

  // Stagger nav items on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      staggerIn('.nav-item', 50);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animate page content on route change
  useEffect(() => {
    if (mainRef.current) {
      pageEnter(mainRef.current);
    }
  }, [location.pathname]);

  const openMobile = () => {
    setMobileOpen(true);
    setTimeout(() => {
      if (sidebarRef.current) openSidebar(sidebarRef.current);
      if (overlayRef.current) {
        overlayRef.current.style.display = 'block';
        animate(overlayRef.current, { opacity: [0, 1], duration: 200, ease: 'out(2)' });
      }
    }, 10);
  };

  const closeMobile = () => {
    if (sidebarRef.current) closeSidebar(sidebarRef.current);
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [1, 0], duration: 180, ease: 'in(2)',
        onComplete: () => { setMobileOpen(false); },
      });
    } else {
      setMobileOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 20px', height: 64, borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <EduLeadsLogo size={32} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 8, paddingBottom: 8, overflowY: 'auto' }}>
        {navSections.map((section) => (
          <div key={section.label}>
            <span className="section-label">{section.label}</span>
            {section.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 16px', flexShrink: 0 }}>
        {plan !== 'premium' && (
          <button
            onClick={() => { navigate('/dashboard/billing'); setMobileOpen(false); }}
            style={{
              width: '100%', marginBottom: 12, fontSize: 'var(--text-xs)', fontWeight: 600,
              borderRadius: 'var(--r-md)', padding: '8px 12px', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              background: 'var(--warm-fill)', color: 'var(--warm-text)',
              border: '1px solid var(--warm-border)', transition: 'all var(--dur-base) var(--ease)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--warm-border)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--warm-fill)'; }}
          >
            ⚡ Upgrade to {plan === 'basic' ? 'Pro' : 'Premium'}
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--brand-100)', color: 'var(--brand-800)',
            fontSize: 'var(--text-sm)', fontWeight: 600,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
              {tenantName || 'My College'}
            </p>
            {plan && (
              <span className={`badge mt-0.5 ${planColors[plan] || 'badge-basic'}`}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{ padding: 6, borderRadius: 'var(--r-sm)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', transition: 'color var(--dur-fast) var(--ease)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-danger)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-subtle)' }}>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside
        ref={desktopSidebarRef}
        className="hidden md:flex flex-col shrink-0"
        style={{
          position: 'fixed', left: 0, top: 0, height: '100vh',
          width: 'var(--sidebar-width)', zIndex: 40,
          background: 'var(--surface-base)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────── */}
      {mobileOpen && (
        <div
          ref={overlayRef}
          onClick={closeMobile}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'var(--surface-overlay)',
            backdropFilter: 'blur(2px)',
          }}
          className="md:hidden"
        />
      )}
      {mobileOpen && (
        <aside
          ref={sidebarRef}
          className="md:hidden flex flex-col"
          style={{
            position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 50,
            width: 'var(--sidebar-width)',
            background: 'var(--surface-base)',
            borderRight: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)',
            transform: 'translateX(-240px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 64, borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <EduLeadsLogoMark size={30} />
              <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--brand-900)' }}>EduLeads Kerala</span>
            </div>
            <button onClick={closeMobile} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <nav style={{ paddingTop: 8, paddingBottom: 8, height: '100%', overflowY: 'auto' }}>
              {navSections.map((section) => (
                <div key={section.label}>
                  <span className="section-label">{section.label}</span>
                  {section.items.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={closeMobile}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={17} style={{ flexShrink: 0 }} />
                      {label}
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
          </div>
          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, flexShrink: 0, background: 'var(--brand-100)', color: 'var(--brand-800)' }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenantName || 'My College'}</p>
              </div>
              <button onClick={handleLogout} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── Mobile Hamburger ─────────────────────────── */}
      <button
        className="md:hidden"
        onClick={openMobile}
        style={{
          position: 'fixed', top: 10, left: 12, zIndex: 50,
          width: 44, height: 44,
          background: 'var(--surface-base)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
        }}
      >
        <Menu size={20} />
      </button>

      {/* ── Main Content ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="md:ml-[240px]">
        {/* Fixed header */}
        <header
          style={{
            position: 'fixed', top: 0, right: 0, left: 0, zIndex: 30,
            height: 'var(--header-height)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
          className="md:left-[240px]"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 64 }} className="md:hidden" />
            <h1 style={{ fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text-primary)', lineHeight: 1 }}>
              {pageTitle}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className="hidden sm:flex"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 'var(--r-md)', background: 'var(--surface-muted)', cursor: 'default' }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--brand-100)', color: 'var(--brand-800)' }}>
                {initials}
              </div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tenantName || 'My College'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, paddingTop: 'var(--header-height)', overflowY: 'auto' }}>
          <div ref={mainRef} className="page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
