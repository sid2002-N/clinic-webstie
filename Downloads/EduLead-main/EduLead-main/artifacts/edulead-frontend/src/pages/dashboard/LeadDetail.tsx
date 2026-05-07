import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { getCategoryLabel } from '../../lib/scoring';
import { ChevronLeft, Lock, Eye, Copy, Check, Clock } from 'lucide-react';
import { pageEnter } from '../../utils/animations';

import MaskedCallButton, { type CallState } from '../../components/MaskedCallButton';
import RealTimeChat from '../../components/RealTimeChat';

function timeAgo(iso: string) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_OPTIONS = ['new', 'contacted', 'interested', 'converted', 'not_interested'];

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  new:           { bg: 'var(--brand-50)',   color: 'var(--brand-700)',   border: 'var(--brand-100)' },
  contacted:     { bg: 'var(--surface-muted)', color: 'var(--text-secondary)', border: 'var(--border-default)' },
  interested:    { bg: 'var(--warm-fill)',  color: 'var(--warm-text)',   border: 'var(--warm-border)' },
  converted:     { bg: 'var(--green-50)',   color: 'var(--green-800)',   border: 'var(--green-100)' },
  not_interested:{ bg: 'var(--cold-fill)',  color: 'var(--cold-text)',   border: 'var(--cold-border)' },
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plan, accessToken } = useAuthStore();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) pageEnter(rootRef.current);
  }, []);

  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [callState, setCallState] = useState<CallState>('idle');
  const [callSid, setCallSid] = useState<string | null>(null);
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.get(`/leads/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (lead) {
      setStatus(lead.status || 'new');
      setNotes(lead.college_notes || '');
    }
  }, [lead]);

  const revealPhone = async () => {
    try {
      const res = await api.get(`/leads/${id}/reveal-phone/`);
      setRevealedPhone(res.data.phone || res.data.phone_number);
    } catch (_) {}
  };

  const copyPhone = () => {
    if (revealedPhone) {
      navigator.clipboard.writeText(revealedPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const initiateCall = async () => {
    setCallState('calling');
    try {
      const res = await api.post(`/leads/${id}/call/`);
      setCallSid(res.data.call_sid);
      setCallState('connected');
    } catch (_) {
      setCallState('failed');
      setTimeout(() => setCallState('idle'), 3000);
    }
  };

  const handleStatusChange = async (s: string) => {
    setStatus(s);
    setSavingStatus(true);
    try { await api.patch(`/leads/${id}/`, { status: s }); } catch (_) {}
    setSavingStatus(false);
  };

  const saveNotes = async () => {
    try {
      await api.patch(`/leads/${id}/`, { college_notes: notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (_) {}
  };

  const cat = lead ? getCategoryLabel(lead.score) : null;
  const canCall = plan === 'pro' || plan === 'premium';
  const studentName = lead?.student_name || lead?.full_name || 'Student';

  const scoreColor = (s: number) =>
    s >= 70 ? { color: 'var(--hot-text)', bg: 'var(--hot-fill)', border: 'var(--hot-dot)' } :
    s >= 40 ? { color: 'var(--warm-text)', bg: 'var(--warm-fill)', border: 'var(--warm-dot)' } :
    { color: 'var(--cold-text)', bg: 'var(--cold-fill)', border: 'var(--cold-dot)' };

  const sc = scoreColor(lead?.score ?? 0);

  if (isLoading) {
    return (
      <div className="p-5 md:p-8 max-w-7xl mx-auto">
        <div className="skeleton h-8 w-32 rounded-lg mb-6" />
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 skeleton h-96 rounded-xl" />
          <div className="md:col-span-3 skeleton h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="lead-detail-root p-4 md:p-6" style={{ maxWidth: 1280, margin: '0 auto' }}>

      {/* ── Page header ───────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 mb-4 transition-colors"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ChevronLeft size={16} /> Back to Leads
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bold" style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
              {studentName}
            </h1>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {cat && (
                <span className={`badge badge-${lead.score >= 70 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold'}`}>
                  {cat.label}
                </span>
              )}
              <span className="badge badge-info">via WhatsApp</span>
              <span className={`badge ${
                STATUS_COLORS[status]
                  ? `badge-${status === 'converted' ? 'success' : status === 'new' ? 'info' : status === 'interested' ? 'warm' : 'neutral'}`
                  : 'badge-neutral'
              }`} style={{ textTransform: 'capitalize' }}>
                {status.replace('_', ' ')}
              </span>
              {lead?.last_activity_at && (
                <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  <Clock size={11} />
                  Last active {timeAgo(lead.last_activity_at)}
                </span>
              )}
            </div>
          </div>
          {/* Score ring */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl"
              style={{ border: `3px solid ${sc.border}`, background: sc.bg, color: sc.color }}
            >
              {lead?.score ?? 0}
            </div>
            <p className="mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>score</p>
          </div>
        </div>
      </div>

      {/* ── Two-panel grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {/* ── LEFT: Student info ─────────────────────────── */}
        <div className="md:col-span-2 space-y-4">
          {/* Info card */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p
              className="uppercase tracking-wide pb-3 mb-4"
              style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              Student Information
            </p>
            <dl className="space-y-0">
              {([
                ['Course', lead?.course_interest],
                ['Location', lead?.location],
                ['Budget', lead?.budget_display || lead?.budget_range],
                ['Timeline', lead?.timeline],
                ['Intent', lead?.intent_level],
              ] as [string, string | undefined][]).map(([label, val], i, arr) => (
                <div
                  key={label}
                  className="pb-3.5 mb-3.5"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <dt className="uppercase tracking-wide mb-1"
                    style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                    {label}
                  </dt>
                  <dd style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {val || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Status card */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="uppercase tracking-wide mb-3"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Update Status {savingStatus && <span className="ml-1 text-xs normal-case tracking-normal" style={{ color: 'var(--text-tertiary)' }}>saving…</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => {
                const isActive = s === status;
                const colors = STATUS_COLORS[s];
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
                    style={{
                      background: isActive ? colors.bg : 'transparent',
                      color: isActive ? colors.color : 'var(--text-secondary)',
                      border: isActive ? `1px solid ${colors.border}` : '1px solid var(--border-default)',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {s.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes card */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="flex items-center gap-1.5 uppercase tracking-wide"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <Lock size={11} /> Private Notes
              </p>
              {notesSaved && (
                <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--green-700)' }}>
                  <Check size={11} /> Saved
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={3}
              placeholder="Add your private notes…"
              className="field-input resize-none"
              style={{ minHeight: 80, fontSize: 'var(--text-sm)' }}
            />
          </div>

          {/* Phone card */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="uppercase tracking-wide mb-3"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Phone Number
            </p>
            {plan === 'premium' ? (
              revealedPhone ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold" style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                      {revealedPhone}
                    </span>
                    <button
                      onClick={copyPhone}
                      className="btn btn-ghost btn-sm flex items-center gap-1"
                    >
                      {copied ? <Check size={14} style={{ color: 'var(--green-700)' }} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    This action has been logged
                  </p>
                  {canCall && (
                    <MaskedCallButton
                      callState={callState}
                      callSid={callSid}
                      onInitiate={() => setCallState('confirming')}
                      onConfirm={initiateCall}
                      onCancel={() => setCallState('idle')}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={revealPhone}
                    className="flex items-center gap-2 transition-colors"
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-700)', fontWeight: 500 }}
                  >
                    <Eye size={15} /> Reveal phone number
                  </button>
                  {canCall && (
                    <MaskedCallButton
                      callState={callState}
                      callSid={callSid}
                      onInitiate={() => setCallState('confirming')}
                      onConfirm={initiateCall}
                      onCancel={() => setCallState('idle')}
                    />
                  )}
                </div>
              )
            ) : (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  border: '1px solid #fde68a',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm select-none" style={{ filter: 'blur(5px)', userSelect: 'none' }}>
                    +91 98765 43210
                  </span>
                  <Lock size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: '#92400e' }}>
                  Upgrade to Premium to reveal this number
                </p>
                <button
                  onClick={() => navigate('/dashboard/billing')}
                  className="btn btn-sm"
                  style={{ background: '#d97706', color: 'white', border: 'none', borderRadius: 'var(--r-md)' }}
                >
                  Upgrade to Premium
                </button>
              </div>
            )}

            {/* Call button for pro (no phone reveal) */}
            {canCall && plan !== 'premium' && (
              <div className="mt-3">
                <MaskedCallButton
                  callState={callState}
                  callSid={callSid}
                  onInitiate={() => setCallState('confirming')}
                  onConfirm={initiateCall}
                  onCancel={() => setCallState('idle')}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Chat panel ──────────────────────────── */}
        <div className="md:col-span-3 flex flex-col" style={{ minHeight: 520 }}>
          <div
            className="flex-1 flex flex-col rounded-xl overflow-hidden"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            {id && (
              <RealTimeChat
                leadId={id}
                plan={plan}
                accessToken={accessToken}
                showWsIndicator
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
