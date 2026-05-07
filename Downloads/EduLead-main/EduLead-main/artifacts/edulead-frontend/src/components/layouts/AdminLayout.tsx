import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Users, Building2, BookOpen,
  BarChart2, CreditCard, LogOut, Menu, X,
} from 'lucide-react';
import { EduLeadsLogoMark } from '../EduLeadsLogo';

const navItems = [
  { to: '/admin/overview',  label: 'Overview',  icon: LayoutDashboard },
  { to: '/admin/tenants',   label: 'Tenants',   icon: Building2 },
  { to: '/admin/leads',     label: 'Leads',     icon: BookOpen },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin/users',     label: 'Users',     icon: Users },
  { to: '/admin/payments',  label: 'Payments',  icon: CreditCard },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/overview':  'Overview',
  '/admin/tenants':   'Tenants',
  '/admin/leads':     'Leads',
  '/admin/analytics': 'Analytics',
  '/admin/users':     'Users',
  '/admin/payments':  'Payments',
};

export default function AdminLayout() {
  const { clearAuth, tenantName } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const pageTitle = (() => {
    for (const key of Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length)) {
      if (location.pathname.startsWith(key)) return PAGE_TITLES[key];
    }
    return 'Admin';
  })();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 h-14 shrink-0 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <EduLeadsLogoMark size={32} />
        <div>
          <p className="font-bold text-sm leading-tight" style={{ color: 'var(--brand-900)' }}>EduLeads</p>
          <p className="text-xs" style={{ color: '#dc2626', fontWeight: 600 }}>Super Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <span className="section-label">Navigation</span>
        {navItems.map(({ to, label, icon: Icon }) => (
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
      </nav>

      {/* User card */}
      <div className="border-t p-3 shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
            style={{ background: '#fef2f2', color: '#b91c1c' }}
          >
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              Super Admin
            </p>
            <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca', fontSize: 'var(--text-xs)' }}>
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title="Sign out"
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface-subtle)' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0 fixed left-0 top-0 h-screen z-40"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--surface-base)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'var(--surface-overlay)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className="fixed left-0 top-0 h-screen z-50 md:hidden flex flex-col"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--surface-base)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 250ms var(--ease)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="font-bold text-sm" style={{ color: 'var(--brand-900)' }}>Admin Panel</span>
          <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-tertiary)' }}>
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={17} style={{ flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={handleLogout} className="nav-item w-full" style={{ color: 'var(--text-danger)' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">
        {/* Fixed header */}
        <header
          className="fixed top-0 right-0 left-0 md:left-[240px] z-30 flex items-center justify-between px-5"
          style={{
            height: 'var(--header-height)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold" style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                {pageTitle}
              </h1>
              <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca', fontSize: 'var(--text-xs)' }}>
                Admin
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-14 overflow-auto">
          <div className="page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
