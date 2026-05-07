import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, Plan, Role } from '../store/authStore';
import api from '../lib/axios';
import { Eye, EyeOff, Loader2, CheckCircle2, Mail, Lock, ArrowLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { animate } from 'animejs';
import { heroEnter, shakeEl } from '../utils/animations';
import { EduLeadsLogo } from '../components/EduLeadsLogo';

interface JWTPayload {
  user_id: string;
  tenant_id: string;
  tenant_name: string;
  plan: Plan;
  role: Role;
}

const features = [
  'AI counsellor qualifies students in Malayalam',
  'Phone numbers protected until you upgrade',
  'Verified leads with scored intent data',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const formWrapRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (leftPanelRef.current) {
      heroEnter(leftPanelRef.current);
    }
    if (formRef.current) {
      animate(formRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 480,
        ease: 'out(4)',
        delay: 100,
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', { email, password });
      const { access, refresh } = res.data;
      const decoded = jwtDecode<JWTPayload>(access);
      setAuth({
        accessToken: access,
        refreshToken: refresh,
        userId: decoded.user_id,
        tenantId: decoded.tenant_id,
        tenantName: decoded.tenant_name,
        plan: decoded.plan,
        role: decoded.role,
      });
      if (decoded.role === 'superadmin') {
        navigate('/admin/overview');
      } else {
        navigate('/dashboard/overview');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
      shakeEl(formWrapRef.current);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font)' }}>

      {/* ── Left panel ─────────────────────────────────────── */}
      <div
        ref={leftPanelRef}
        className="hidden md:flex"
        style={{
          flex: '0 0 55%',
          background: 'linear-gradient(160deg, var(--brand-900) 0%, var(--brand-800) 60%, var(--green-800) 100%)',
          padding: '64px 56px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: -60, right: -80, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(56,160,87,0.12)', bottom: 80, left: -60, pointerEvents: 'none' }} />

        {/* Logo */}
        <div data-hero-item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <EduLeadsLogo size={36} onDark />
          </Link>
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.65)', fontSize: 13, textDecoration: 'none', padding: '6px 10px', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.08)', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
          >
            <ArrowLeft size={13} />
            Home
          </Link>
        </div>

        {/* Hero content */}
        <div data-hero-item>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-100)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Trusted by 50+ Kerala Colleges
            </span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1.25 }}>
            Find the right students<br />for your college
          </h2>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <CheckCircle2 size={20} style={{ color: 'var(--green-100)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div data-hero-item style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <p style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
            "We filled 40 seats in one admission season."
          </p>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginTop: 12 }}>
            — Principal, MES College, Ernakulam
          </p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
      <div style={{
        flex: '0 0 45%',
        background: 'var(--surface-base)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }} className="flex-1">
        <div
          ref={formRef}
          style={{ maxWidth: 400, width: '100%', padding: '48px 40px', opacity: 0 }}
          className="sm:px-10 px-6"
        >
          {/* Mobile logo + back link */}
          <div className="flex items-center justify-between mb-8 md:hidden">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <EduLeadsLogo size={30} />
            </Link>
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none' }}
            >
              <ArrowLeft size={13} />
              Home
            </Link>
          </div>

          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 8 }}>
            Sign in to your EduLeads account
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 'var(--r-md)', padding: '12px 16px', marginTop: 20, fontSize: 'var(--text-sm)' }}>
              {error}
            </div>
          )}

          <form ref={formWrapRef} onSubmit={handleSubmit} style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@college.edu"
                  className="field-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="field-input"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember / forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
                Remember me
              </label>
              <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-brand)' }}>Forgot password?</a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
              onClick={(e) => {
                if (!loading) {
                  animate(e.currentTarget, { scale: [1, 0.97, 1], duration: 200, ease: 'out(2)' });
                }
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" style={{ marginRight: 7 }} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', padding: '0 8px' }}>New to EduLeads?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
          </div>

          <Link
            to="/register"
            className="btn btn-secondary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
