import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle2, MessageCircle, Zap, X } from 'lucide-react';
import { useState } from 'react';

const plans = [
  {
    key: 'basic', name: 'Basic', price: '₹2,999',
    features: ['10 leads/month', 'AI WhatsApp counsellor', 'Basic analytics', 'Email support'],
  },
  {
    key: 'pro', name: 'Pro', price: '₹6,999', popular: true,
    features: ['30 leads/month', 'Masked calling', 'Advanced analytics', 'Priority support', 'Chat with students'],
  },
  {
    key: 'premium', name: 'Premium', price: '₹14,999',
    features: ['100 leads/month', 'Exclusive leads', 'Phone number reveal', 'CSV export', 'Dedicated manager'],
  },
];

export default function Billing() {
  const { plan: currentPlan } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const linkMutation = useMutation({
    mutationFn: (plan: string) => api.post('/subscriptions/create-payment-link/', { plan }),
    onSuccess: (res) => {
      if (res.data?.payment_link) window.open(res.data.payment_link, '_blank');
    },
  });

  const handleUpgrade = (planKey: string) => {
    setSelectedPlan(planKey);
    setShowModal(true);
  };

  return (
    <div className="p-5 md:p-8" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="mb-6">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Manage your subscription</p>
      </div>

      {/* Current plan banner */}
      <div
        className="flex flex-wrap items-center gap-4 p-4 mb-8 glass-card squircle-card"
        style={{ background: 'rgba(237,244,251,0.72)', border: '1px solid rgba(168,200,232,0.54)' }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0 font-bold uppercase"
          style={{ background: 'var(--brand-800)', color: 'white', fontSize: 'var(--text-sm)', borderRadius: 16 }}
        >
          {(currentPlan || 'B')[0]}
        </div>
        <div>
          <p className="font-semibold capitalize" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
            Current Plan: {currentPlan}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Your subscription renews monthly
          </p>
        </div>
        {currentPlan !== 'premium' && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5"
            style={{ background: 'var(--warm-fill)', border: '1px solid var(--warm-border)', color: 'var(--warm-text)', fontSize: 'var(--text-xs)', fontWeight: 600, borderRadius: 14 }}>
            <Zap size={12} /> Upgrade available
          </div>
        )}
      </div>

      {/* Plans grid */}
      <div className="billing-plan-grid">
        {plans.map((p) => {
          const isCurrent = p.key === currentPlan;
          return (
            <div
              key={p.key}
              className={`billing-plan-card glass-card squircle-card${p.popular ? ' billing-plan-card-popular' : ''}${isCurrent ? ' billing-plan-card-current' : ''}`}
              style={{
                border: isCurrent
                  ? '2px solid rgba(45,125,70,0.74)'
                  : p.popular
                  ? '2px solid rgba(30,58,95,0.72)'
                  : '1px solid rgba(226,232,240,0.82)',
              }}
            >
              {isCurrent && (
                <div className="billing-plan-badge"
                  style={{ background: 'var(--green-700)', color: 'white' }}>
                  Current Plan
                </div>
              )}
              {!isCurrent && p.popular && (
                <div className="billing-plan-badge"
                  style={{ background: 'var(--brand-800)', color: 'white' }}>
                  Most Popular
                </div>
              )}

              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-bold" style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{p.name}</h3>
                <span className={`badge badge-${p.key}`}>{p.name}</span>
              </div>
              <p className="font-black my-4" style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-primary)', lineHeight: 1 }}>
                {p.price}
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>
              </p>

              <div className="my-5 h-px" style={{ background: 'var(--border-subtle)' }} />

              <ul className="space-y-3 mb-7" style={{ flex: 1 }}>
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} style={{ color: 'var(--green-600)', flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--surface-muted)', color: 'var(--text-tertiary)', border: '1px solid var(--border-default)', cursor: 'default' }}
                >
                  Active Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(p.key)}
                  className="btn btn-primary w-full"
                  style={{ justifyContent: 'center' }}
                >
                  Upgrade to {p.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'var(--surface-overlay)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'var(--surface-base)', boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                Upgrade to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-tertiary)' }}>
                <X size={18} />
              </button>
            </div>
            <div
              className="rounded-xl p-4 flex items-start gap-3 mb-5"
              style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)' }}
            >
              <MessageCircle size={20} style={{ color: 'var(--green-700)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                Contact us on WhatsApp at <strong>+91-XXXXXXXXXX</strong>. We'll activate your plan within 2 hours of payment.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1" style={{ justifyContent: 'center' }}>
                Cancel
              </button>
              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: '#25D366', color: 'white', textDecoration: 'none' }}
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
