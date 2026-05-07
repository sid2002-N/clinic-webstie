import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { computeScore, getCategoryLabel } from '../../lib/scoring';
import { Loader2, ChevronLeft, Zap, Target, IndianRupee, Calendar, BookOpen, MapPin, User, Phone, FileText, CheckCircle2 } from 'lucide-react';

const KERALA_DISTRICTS = ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'];
const COURSES = ['B.Tech Computer Science','BCA','B.Com','MBA','BAMS','B.Pharm','B.Ed','LLB','B.Sc Nursing','B.Arch'];
const BUDGET_OPTIONS = ['Below ₹1 Lakh','₹1–3 Lakh','₹3–5 Lakh','Above ₹5 Lakh'];
const TIMELINE_OPTIONS = ['This academic year','Next academic year','Just exploring'];
const INTENT_OPTIONS = ['Ready to enroll','Exploring options','Just curious'];

const INIT = {
  student_name: '', whatsapp_number: '', course_interest: '',
  location: '', budget_range: '', timeline: '', intent_level: '', notes: '',
};

const SCORE_DIMENSIONS = [
  { key: 'intent_level', label: 'Intent', icon: Target,        max: 35, score: (v: string) => v === 'Ready to enroll' ? 35 : v === 'Exploring options' ? 20 : v === 'Just curious' ? 5 : 0 },
  { key: 'timeline',     label: 'Timeline', icon: Calendar,    max: 25, score: (v: string) => v === 'This academic year' ? 25 : v === 'Next academic year' ? 15 : v === 'Just exploring' ? 5 : 0 },
  { key: 'budget_range', label: 'Budget', icon: IndianRupee,   max: 20, score: (v: string) => v === 'Above ₹5 Lakh' ? 20 : v === '₹3–5 Lakh' ? 15 : v === '₹1–3 Lakh' ? 10 : v === 'Below ₹1 Lakh' ? 5 : 0 },
  { key: 'course_interest', label: 'Course', icon: BookOpen,   max: 10, score: (v: string) => v ? 10 : 0 },
  { key: 'student_name', label: 'Complete', icon: CheckCircle2, max: 10, score: (v: string) => v ? 10 : 0 },
];

function useCountUp(target: number) {
  const [n, setN] = useState(0);
  const raf = useRef<number>(0);
  const prev = useRef(0);
  useEffect(() => {
    if (target === prev.current) return;
    const from = prev.current;
    prev.current = target;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 600, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setN(Math.round(from + e * (target - from)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return n;
}

export default function LeadsNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [success, setSuccess] = useState<{ colleges: string[] } | null>(null);

  const score = computeScore(form);
  const countedScore = useCountUp(score);
  const cat = getCategoryLabel(score);

  const mutation = useMutation({
    mutationFn: () => api.post('/admin/leads/', form),
    onSuccess: (res) => setSuccess({ colleges: res.data?.allocated_to || [] }),
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const scoreColor = score >= 70
    ? { color: 'var(--hot-text)', bg: 'var(--hot-fill)', border: 'var(--hot-dot)' }
    : score >= 40
    ? { color: 'var(--warm-text)', bg: 'var(--warm-fill)', border: 'var(--warm-dot)' }
    : { color: 'var(--cold-text)', bg: 'var(--cold-fill)', border: 'var(--cold-dot)' };

  if (success) {
    return (
      <div className="p-8" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div className="text-6xl mb-4">✅</div>
        <h2 className="font-bold mb-2" style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>Lead Submitted!</h2>
        {success.colleges.length > 0 ? (
          <p className="mb-6" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Distributed to: <strong>{success.colleges.join(', ')}</strong>
          </p>
        ) : (
          <p className="mb-6" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Lead saved successfully.</p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/admin/leads')} className="btn btn-primary">View All Leads</button>
          <button onClick={() => { setForm(INIT); setSuccess(null); }} className="btn btn-secondary">Add Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 mb-6 transition-colors"
        style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}
      >
        <ChevronLeft size={16} /> Back to Leads
      </button>

      <div className="flex gap-6 items-start">
        {/* Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
          className="flex-1 space-y-6"
          style={{ minWidth: 0 }}
        >
          <div className="rounded-xl p-6" style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>

            {/* Section 1 */}
            <p className="uppercase tracking-wide mb-4 pb-3 border-b"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', borderColor: 'var(--border-subtle)' }}>
              Student Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="field-label">Student Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
                  <input required value={form.student_name} onChange={(e) => set('student_name', e.target.value)}
                    placeholder="Arun Krishnan" className="field-input pl-9" />
                </div>
              </div>
              <div>
                <label className="field-label">WhatsApp Number *</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
                  <input required value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)}
                    placeholder="9876543210" pattern="[6-9][0-9]{9}" className="field-input pl-9" />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <p className="uppercase tracking-wide mb-4 pb-3 border-b mt-2"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', borderColor: 'var(--border-subtle)' }}>
              Academic Interest
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="field-label">Course Interest</label>
                <div className="relative">
                  <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
                  <select value={form.course_interest} onChange={(e) => set('course_interest', e.target.value)} className="field-input pl-9">
                    <option value="">Select course</option>
                    {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">District</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
                  <select value={form.location} onChange={(e) => set('location', e.target.value)} className="field-input pl-9">
                    <option value="">Select district</option>
                    {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <p className="uppercase tracking-wide mb-4 pb-3 border-b mt-2"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', borderColor: 'var(--border-subtle)' }}>
              Qualification
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { key: 'budget_range', label: 'Budget', Icon: IndianRupee, opts: BUDGET_OPTIONS },
                { key: 'timeline', label: 'Timeline', Icon: Calendar, opts: TIMELINE_OPTIONS },
                { key: 'intent_level', label: 'Intent Level', Icon: Target, opts: INTENT_OPTIONS },
              ].map(({ key, label, Icon, opts }) => (
                <div key={key}>
                  <label className="field-label">{label}</label>
                  <div className="relative">
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
                    <select value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} className="field-input pl-9">
                      <option value="">Select…</option>
                      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Section 4 */}
            <p className="uppercase tracking-wide mb-4 pb-3 border-b mt-2"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-tertiary)', borderColor: 'var(--border-subtle)' }}>
              Additional Notes
            </p>
            <div>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3.5 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={3}
                  placeholder="Any additional context about this student…"
                  className="field-input pl-9 resize-none"
                />
              </div>
            </div>

            {mutation.isError && (
              <p className="mt-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-danger)' }}>
                Failed to submit. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary btn-lg w-full mt-6"
              style={{ justifyContent: 'center' }}
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {mutation.isPending ? 'Processing…' : 'Score and Distribute Lead'}
            </button>
          </div>
        </form>

        {/* Score preview (sticky) */}
        <div className="w-64 shrink-0 sticky top-20">
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap size={15} style={{ color: '#d97706' }} />
              <p className="font-semibold" style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Live Score Preview</p>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 20 }}>
              Updates as you fill the form
            </p>

            {/* Score ring */}
            <div className="flex flex-col items-center mb-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center font-black"
                style={{
                  border: `3px solid ${scoreColor.border}`,
                  background: scoreColor.bg,
                  color: scoreColor.color,
                  fontSize: 'var(--text-3xl)',
                  transition: 'all 400ms ease',
                }}
              >
                {countedScore}
              </div>
              <p className="mt-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>out of 100</p>
              <span className={`badge mt-2 badge-${score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'}`}>
                {cat.label} Lead
              </span>
            </div>

            {/* Dimension breakdown */}
            <div className="space-y-3">
              {SCORE_DIMENSIONS.map(({ key, label, icon: Icon, max, score: getDimScore }) => {
                const pts = getDimScore((form as any)[key] || '');
                const pct = (pts / max) * 100;
                const color = pts === max ? 'var(--green-700)' : pts > 0 ? '#d97706' : 'var(--cold-dot)';
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        <Icon size={11} style={{ color: 'var(--text-tertiary)' }} />
                        {label}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{pts}/{max}</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'var(--surface-muted)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
