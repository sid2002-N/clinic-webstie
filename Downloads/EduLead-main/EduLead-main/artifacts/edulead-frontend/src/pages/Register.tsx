import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore, Plan, Role } from '../store/authStore';
import { Loader2, Building2, Users, CheckCircle2, Zap, Shield } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { EduLeadsLogo } from '../components/EduLeadsLogo';

interface JWTPayload {
  user_id: string;
  tenant_id: string;
  tenant_name: string;
  plan: Plan;
  role: Role;
}

function Field({
  label, name, type = 'text', value, placeholder, error, onChange,
}: {
  label: string; name: string; type?: string;
  value: string; placeholder: string; error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11.5, fontWeight: 600,
        color: 'rgba(255,255,255,0.5)', marginBottom: 6,
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <input
        name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '11px 14px',
          background: focused
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(255,255,255,0.05)',
          border: `1px solid ${
            error
              ? 'rgba(248,113,113,0.7)'
              : focused
              ? 'rgba(96,165,250,0.6)'
              : 'rgba(255,255,255,0.1)'
          }`,
          borderRadius: 6,
          outline: 'none',
          fontSize: 13.5, color: 'white',
          boxShadow: focused
            ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(59,118,181,0.18)'}`
            : 'none',
          transition: 'all 180ms ease',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      {error && (
        <p style={{ fontSize: 11.5, color: '#fca5a5', marginTop: 5, paddingLeft: 2 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    college_name: '',
    tenant_type: 'college',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.college_name.trim()) e.college_name = 'Name is required';
    if (!form.full_name.trim()) e.full_name = 'Your name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/auth/register/', {
        college_name: form.college_name,
        tenant_type: form.tenant_type,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      const { access, refresh } = res.data;
      const decoded = jwtDecode<JWTPayload>(access);
      setAuth({
        accessToken: access,
        refreshToken: refresh,
        userId: decoded.user_id,
        tenantId: decoded.tenant_id,
        tenantName: decoded.tenant_name,
        plan: decoded.plan ?? 'basic',
        role: decoded.role,
      });
      navigate('/onboarding');
    } catch (err: any) {
      setServerError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(148deg, #060d18 0%, #0f2137 38%, #0a1f0e 72%, #060d18 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Same aurora blobs as landing hero */}
      <div style={{ position: 'absolute', top: -180, left: -160, width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,118,181,0.17) 0%, transparent 68%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -140, right: -140, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,125,70,0.13) 0%, transparent 68%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '15%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,149,196,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />

      {/* ── Card ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 860,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
      }}>
        {/* Top highlight line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.15) 60%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />

        {/* ══ LEFT — form ══ */}
        <div style={{ padding: '40px 36px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
            marginBottom: 28, transition: 'color 160ms',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            ← Back to home
          </Link>

          <h1 style={{
            fontSize: 28, fontWeight: 800, color: 'white',
            letterSpacing: '-0.035em', marginBottom: 6,
          }}>
            Sign Up
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
            >
              Log in
            </Link>
          </p>

          {/* Server error */}
          {serverError && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 6, padding: '10px 14px',
              fontSize: 13, color: '#fca5a5', marginBottom: 18,
            }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field
              label="College / Agency Name"
              name="college_name" value={form.college_name}
              placeholder="Kerala Engineering College"
              error={errors.college_name} onChange={handleChange}
            />

            {/* Type toggle — square */}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Type
              </label>
              <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
                {[
                  { value: 'college', label: 'College', Icon: Building2 },
                  { value: 'agency', label: 'Agency', Icon: Users },
                ].map(({ value, label, Icon }, i) => {
                  const active = form.tenant_type === value;
                  return (
                    <label key={value} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      padding: '10px 16px', cursor: 'pointer',
                      background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      borderRight: i === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      color: active ? 'white' : 'rgba(255,255,255,0.4)',
                      transition: 'all 180ms ease',
                    }}>
                      <input type="radio" name="tenant_type" value={value}
                        checked={active} onChange={handleChange}
                        style={{ display: 'none' }} />
                      <Icon size={13} />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>

            <Field
              label="Your Full Name"
              name="full_name" value={form.full_name}
              placeholder="Arun Kumar"
              error={errors.full_name} onChange={handleChange}
            />

            <Field
              label="Work Email"
              name="email" type="email" value={form.email}
              placeholder="admin@college.edu"
              error={errors.email} onChange={handleChange}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field
                label="Password"
                name="password" type="password" value={form.password}
                placeholder="Min 8 chars"
                error={errors.password} onChange={handleChange}
              />
              <Field
                label="Confirm"
                name="confirm_password" type="password" value={form.confirm_password}
                placeholder="Repeat"
                error={errors.confirm_password} onChange={handleChange}
              />
            </div>
          </form>
        </div>

        {/* ══ RIGHT — CTA + trust ══ */}
        <div style={{
          padding: '40px 36px',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ marginBottom: 32 }}>
            <EduLeadsLogo size={32} onDark />
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.025em', marginBottom: 8 }}>
            Start getting qualified leads today
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 28 }}>
            50+ Kerala colleges already use Mitra to fill seats with real, scored student leads.
          </p>

          {/* Trust points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {[
              { icon: Zap,          text: 'AI counsellor qualifies leads in Malayalam' },
              { icon: CheckCircle2, text: 'Every lead scored 0–100 before delivery' },
              { icon: Shield,       text: 'DPDP compliant — student data encrypted' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 4, flexShrink: 0,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} style={{ color: 'rgba(255,255,255,0.55)' }} />
                </div>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            style={{
              width: '100%', height: 48,
              background: loading
                ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(135deg, #3b76b5 0%, #2D7D46 100%)',
              color: 'white', border: 'none',
              borderRadius: 6, fontSize: 14.5, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(59,118,181,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'all 200ms ease',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,118,181,0.45)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,118,181,0.3)'; }}
          >
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
            By signing up you agree to our{' '}
            <Link to="/terms-of-use" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >Terms</Link>
            {' & '}
            <Link to="/privacy-policy" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >Privacy Policy</Link>
          </p>

          {/* Testimonial */}
          <div style={{
            marginTop: 'auto', paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 12 }}>
              "We filled 38 seats in one season. Mitra speaks Malayalam — students respond like it's a real counsellor."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 4, background: 'rgba(30,58,95,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>RK</div>
              <div>
                <p style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Rajesh Kumar</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Principal, MES College, Ernakulam</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#f59e0b' }}>★★★★★</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
