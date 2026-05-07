import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { getCategoryLabel } from '../../lib/scoring';
import {
  Flame, TrendingUp, Snowflake, ArrowRight,
  Target, AlertTriangle,
} from 'lucide-react';
import { staggerIn, countUp } from '../../utils/animations';

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function getDateStr() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function MetricCard({
  label, value, icon: Icon, iconBg, iconColor, accentColor, isLoading,
}: {
  label: string; value: number | string; icon: React.ElementType;
  iconBg: string; iconColor: string; accentColor: string; isLoading: boolean;
}) {
  const [displayVal, setDisplayVal] = useState<number | string>(0);

  useEffect(() => {
    if (!isLoading) {
      if (typeof value === 'number') {
        countUp(0, value, setDisplayVal, 900);
      } else {
        setDisplayVal(value);
      }
    }
  }, [value, isLoading]);

  return (
    <div
      className="metric-card card-lift relative overflow-hidden rounded-xl"
      style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', padding: 20 }}
    >
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 'var(--r-lg)' }} />
          <div className="skeleton" style={{ height: 32, width: 64, borderRadius: 'var(--r-md)' }} />
          <div className="skeleton" style={{ height: 12, width: 80, borderRadius: 'var(--r-sm)' }} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{label}</p>
            <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: iconBg }}>
              <Icon size={17} style={{ color: iconColor }} />
            </div>
          </div>
          <p className="count-up" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {displayVal}
          </p>
          {/* Decorative blob */}
          <div style={{
            position: 'absolute', width: 80, height: 80, borderRadius: '50%',
            bottom: -20, right: -20, opacity: 0.06, background: accentColor,
            pointerEvents: 'none',
          }} />
        </>
      )}
    </div>
  );
}

export default function DashboardOverview() {
  const { plan, tenantName } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => api.get('/dashboard/overview/').then((r) => r.data),
  });

  // Stagger metric cards on load
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => staggerIn('.metric-card', 50), 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading]);

  const used  = data?.quota_used  ?? 0;
  const total = data?.quota_total ?? 1;
  const pct   = Math.round((used / total) * 100);
  const hot   = data?.hot_leads  ?? 0;
  const warm  = data?.warm_leads ?? 0;
  const cold  = data?.cold_leads ?? 0;

  const barColor = pct >= 90 ? '#dc2626' : pct >= 70 ? '#d97706' : 'var(--green-700)';

  const metrics = [
    { label: 'Hot Leads', value: hot, icon: Flame, iconBg: 'var(--hot-fill)', iconColor: 'var(--hot-dot)', accentColor: 'var(--hot-dot)' },
    { label: 'Warm Leads', value: warm, icon: TrendingUp, iconBg: 'var(--warm-fill)', iconColor: 'var(--warm-dot)', accentColor: 'var(--warm-dot)' },
    { label: 'Cold Leads', value: cold, icon: Snowflake, iconBg: 'var(--cold-fill)', iconColor: 'var(--cold-dot)', accentColor: 'var(--cold-dot)' },
    { label: 'Quota Used', value: `${pct}%`, icon: Target, iconBg: 'var(--brand-50)', iconColor: 'var(--brand-600)', accentColor: 'var(--brand-500)' },
  ];

  const firstName = (tenantName || '').split(' ')[0] || 'there';

  return (
    <div style={{ padding: '20px 32px', maxWidth: 1280, margin: '0 auto' }} className="px-5 md:px-8">

      {/* ── Greeting ─────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {getGreeting()}, {firstName} 👋
        </h2>
        <p style={{ marginTop: 4, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          {getDateStr()}
        </p>
      </div>

      {/* ── Quota warning banner ──────────────────────────── */}
      {!isLoading && pct >= 80 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 24,
          background: 'linear-gradient(90deg, #fffbeb, #fef9c3)',
          border: '1px solid #fde68a', borderLeft: '4px solid #d97706',
        }}>
          <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
          <p style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
            You've used <strong>{pct}%</strong> of your monthly quota.
          </p>
          <button
            onClick={() => navigate('/dashboard/billing')}
            style={{
              background: '#d97706', color: 'white', border: 'none',
              borderRadius: 'var(--r-md)', padding: '6px 12px',
              fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Upgrade
          </button>
        </div>
      )}

      {/* ── Hot leads banner ──────────────────────────────── */}
      {!isLoading && hot > 0 && (
        <div
          onClick={() => navigate('/dashboard/leads')}
          style={{
            cursor: 'pointer', marginBottom: 24, borderRadius: 'var(--r-2xl)', padding: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--brand-800) 0%, var(--green-700) 100%)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'opacity var(--dur-base) var(--ease)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-lg)', background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Flame style={{ color: 'white' }} size={22} />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                🔥 {hot} hot lead{hot !== 1 ? 's' : ''} need your attention
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
                Act fast — hot leads convert 3× better
              </p>
            </div>
          </div>
          <ArrowRight style={{ color: 'rgba(255,255,255,0.6)' }} size={20} className="hidden sm:block" />
        </div>
      )}

      {/* ── Metric cards ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }} className="lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} isLoading={isLoading} />
        ))}
      </div>

      {/* ── Quota bar ────────────────────────────────────── */}
      <div style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              Monthly Quota
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
              Resets on the 1st of each month
            </p>
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: barColor }}>
            {isLoading ? '—' : `${used} / ${total}`}
          </span>
        </div>
        <div style={{ borderRadius: 'var(--r-full)', overflow: 'hidden', height: 8, background: 'var(--surface-muted)' }}>
          <div
            style={{ width: isLoading ? '0%' : `${Math.min(pct, 100)}%`, height: '100%', borderRadius: 'var(--r-full)', background: barColor, transition: 'width 700ms var(--ease-out)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{pct}% used</p>
          {pct >= 80 && (
            <button
              onClick={() => navigate('/dashboard/billing')}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-brand)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Upgrade quota →
            </button>
          )}
        </div>
      </div>

      {/* ── Recent Leads ─────────────────────────────────── */}
      <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Recent leads</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Latest prospects assigned to you</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/leads')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--text-brand)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--r-lg)', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton" style={{ height: 14, width: 128, borderRadius: 'var(--r-sm)' }} />
                  <div className="skeleton" style={{ height: 11, width: 192, borderRadius: 'var(--r-sm)' }} />
                </div>
                <div className="skeleton" style={{ height: 22, width: 48, borderRadius: 'var(--r-full)' }} />
              </div>
            ))}
          </div>
        ) : data?.recent_leads?.length ? (
          <div>
            {data.recent_leads.map((lead: any, i: number) => {
              const cat = getCategoryLabel(lead.score);
              const isLast = i === data.recent_leads.length - 1;
              return (
                <div
                  key={lead.id}
                  onClick={() => navigate(`/dashboard/leads/${lead.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                    cursor: 'pointer', borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                    transition: 'background var(--dur-fast) var(--ease)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-50)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', flexShrink: 0,
                    background: lead.score >= 70 ? 'var(--hot-fill)' : lead.score >= 40 ? 'var(--warm-fill)' : 'var(--cold-fill)',
                    color: lead.score >= 70 ? 'var(--hot-text)' : lead.score >= 40 ? 'var(--warm-text)' : 'var(--cold-text)',
                  }}>
                    {(lead.student_name || lead.full_name || '?')[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lead.student_name || lead.full_name}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {lead.course_interest} · {lead.location}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: lead.score >= 70 ? 'var(--hot-text)' : lead.score >= 40 ? 'var(--warm-text)' : 'var(--cold-text)' }}>
                      {lead.score}
                    </span>
                    <span className={`badge badge-${lead.score >= 70 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold'}`}>
                      {cat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--r-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, background: 'var(--surface-muted)' }}>
              <TrendingUp size={24} style={{ color: 'var(--text-disabled)' }} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>No leads received yet</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: 4, maxWidth: 280 }}>
              Your leads will appear here once the AI counsellor qualifies students
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
