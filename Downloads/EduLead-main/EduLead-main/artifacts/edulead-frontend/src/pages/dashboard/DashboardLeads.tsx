import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { getCategoryLabel } from '../../lib/scoring';
import { BookOpen, Search, MapPin, Eye, X } from 'lucide-react';
import { staggerIn } from '../../utils/animations';

const KERALA_DISTRICTS = [
  'Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam',
  'Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode',
  'Wayanad','Kannur','Kasaragod',
];

const STATUS_COLORS: Record<string, string> = {
  new:          'badge-info',
  contacted:    'badge-neutral',
  interested:   'badge-warm',
  converted:    'badge-success',
  not_interested: 'badge-cold',
  enrolled:     'badge-success',
  rejected:     'badge-cold',
};

function timeAgo(iso: string) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

type Filters = { category: string; status: string; location: string; search: string };

export default function DashboardLeads() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ category: '', status: '', location: '', search: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-leads', page, filters],
    queryFn: () => api.get('/leads/', { params: { page, page_size: 20, ...filters } }).then((r) => r.data),
  });

  const set = (k: keyof Filters, v: string) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
  const hasFilters = Object.values(filters).some(Boolean);
  const clearFilters = () => { setFilters({ category: '', status: '', location: '', search: '' }); setPage(1); };

  const leads: any[] = data?.results ?? [];

  useEffect(() => {
    if (!isLoading && leads.length > 0) {
      const t = setTimeout(() => staggerIn('.lead-row'), 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isLoading, leads.length]);

  const categories = [
    { key: '', label: 'All' },
    { key: 'hot',  label: 'Hot' },
    { key: 'warm', label: 'Warm' },
    { key: 'cold', label: 'Cold' },
  ];

  const categoryPillStyle = (key: string) => {
    const active = filters.category === key;
    if (!active) return {
      padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)',
      fontWeight: 500, cursor: 'pointer', transition: 'all var(--dur-base)',
      border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)',
    } as React.CSSProperties;
    if (key === '')   return { padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--brand-800)', background: 'var(--brand-800)', color: 'white' } as React.CSSProperties;
    if (key === 'hot')  return { padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--hot-border)', background: 'var(--hot-fill)', color: 'var(--hot-text)' } as React.CSSProperties;
    if (key === 'warm') return { padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--warm-border)', background: 'var(--warm-fill)', color: 'var(--warm-text)' } as React.CSSProperties;
    return { padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--cold-border)', background: 'var(--cold-fill)', color: 'var(--cold-text)' } as React.CSSProperties;
  };

  return (
    <div className="p-5 md:p-8" style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-6">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          {data?.count ?? 0} leads assigned to you
        </p>
      </div>

      {/* ── Filter bar ───────────────────────────────────── */}
      <div
        className="rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center"
        style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search name or course…"
            className="field-input pl-8"
            style={{ width: 240, padding: '7px 12px 7px 32px' }}
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5">
          {categories.map(({ key, label }) => (
            <button key={key} onClick={() => set('category', key)} style={categoryPillStyle(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => set('status', e.target.value)}
          className="field-input"
          style={{ width: 160, padding: '7px 12px' }}
        >
          <option value="">All Statuses</option>
          {['new','contacted','interested','converted','not_interested'].map((s) => (
            <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
          ))}
        </select>

        {/* Location */}
        <select
          value={filters.location}
          onChange={(e) => set('location', e.target.value)}
          className="field-input"
          style={{ width: 180, padding: '7px 12px' }}
        >
          <option value="">All Districts</option>
          {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 font-medium transition-colors"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--text-brand)' }}
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Desktop Table ─────────────────────────────────── */}
      <div className="hidden md:block rounded-xl overflow-hidden"
        style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-default)' }}>
              {['Student', 'Location', 'Score', 'Category', 'Status', 'Received', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap"
                  style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="skeleton h-4 rounded" style={{ width: j === 0 ? 140 : j === 6 ? 32 : 80 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : leads.map((lead, i) => {
                  const cat = getCategoryLabel(lead.score);
                  const isLast = i === leads.length - 1;
                  const name = lead.student_name || lead.full_name || '—';
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/dashboard/leads/${lead.id}`)}
                      className="lead-row cursor-pointer transition-colors"
                      style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      {/* Student */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                            style={{ background: 'var(--brand-100)', color: 'var(--brand-800)' }}
                          >
                            {name[0]}
                          </div>
                          <div>
                            <p className="font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{name}</p>
                            <p className="truncate max-w-[140px]" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                              {lead.course_interest || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          <MapPin size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                          {lead.location || '—'}
                        </span>
                      </td>
                      {/* Score */}
                      <td className="px-4 py-3.5">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            border: `2px solid ${lead.score >= 70 ? 'var(--hot-dot)' : lead.score >= 40 ? 'var(--warm-dot)' : 'var(--cold-dot)'}`,
                            background: lead.score >= 70 ? 'var(--hot-fill)' : lead.score >= 40 ? 'var(--warm-fill)' : 'var(--cold-fill)',
                            color: lead.score >= 70 ? 'var(--hot-text)' : lead.score >= 40 ? 'var(--warm-text)' : 'var(--cold-text)',
                          }}
                        >
                          {lead.score}
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className={`badge badge-${lead.score >= 70 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold'}`}>
                          {cat.label}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`badge ${STATUS_COLORS[lead.status] || 'badge-neutral'}`}>
                          {(lead.status || 'new').replace('_', ' ')}
                        </span>
                      </td>
                      {/* Received */}
                      <td className="px-4 py-3.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {lead.created_at ? timeAgo(lead.created_at) : '—'}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/leads/${lead.id}`); }}
                          className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          style={{ color: 'var(--text-tertiary)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-700)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
        {!isLoading && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--surface-muted)' }}>
              <BookOpen size={24} style={{ color: 'var(--text-disabled)' }} />
            </div>
            <p className="font-medium" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>No leads found</p>
            <p className="mt-1" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              {hasFilters ? 'Try adjusting your filters' : 'Leads will appear once the AI counsellor qualifies students'}
            </p>
          </div>
        )}
      </div>

      {/* ── Mobile Cards ──────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
          : leads.map((lead) => {
              const cat = getCategoryLabel(lead.score);
              const name = lead.student_name || lead.full_name || '—';
              return (
                <div
                  key={lead.id}
                  onClick={() => navigate(`/dashboard/leads/${lead.id}`)}
                  className="cursor-pointer rounded-xl p-4 transition-all card-lift"
                  style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: 'var(--brand-100)', color: 'var(--brand-800)' }}
                    >
                      {name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{name}</p>
                      <p className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {lead.course_interest} · {lead.location}
                      </p>
                    </div>
                    <span className={`badge badge-${lead.score >= 70 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold'}`}>{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        border: '2px solid',
                        borderColor: lead.score >= 70 ? 'var(--hot-dot)' : lead.score >= 40 ? 'var(--warm-dot)' : 'var(--cold-dot)',
                        color: lead.score >= 70 ? 'var(--hot-text)' : lead.score >= 40 ? 'var(--warm-text)' : 'var(--cold-text)',
                      }}
                    >
                      {lead.score}
                    </div>
                    <span className={`badge ${STATUS_COLORS[lead.status] || 'badge-neutral'}`}>
                      {(lead.status || 'new').replace('_', ' ')}
                    </span>
                    <span className="ml-auto" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {timeAgo(lead.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
        {!isLoading && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={32} style={{ color: 'var(--text-disabled)', marginBottom: 12 }} />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>No leads found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.count > 20 && (
        <div className="flex items-center justify-between mt-5">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            Page {page} of {Math.ceil(data.count / 20)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(data.count / 20)}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
