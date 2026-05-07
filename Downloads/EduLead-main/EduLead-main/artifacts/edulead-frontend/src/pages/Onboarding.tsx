import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, GraduationCap, MessageCircle, X } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '₹2,999',
    features: ['10 leads/month', 'Up to 5 colleges', 'AI WhatsApp counsellor', 'Basic analytics'],
    color: 'border-blue-200',
    badge: 'bg-blue-50 text-blue-700',
  },
  {
    name: 'Pro',
    price: '₹6,999',
    features: ['30 leads/month', 'Up to 3 colleges', 'Masked calling', 'Priority support', 'Advanced analytics'],
    color: 'border-[#1E3A5F]',
    badge: 'bg-[#1E3A5F] text-white',
    popular: true,
  },
  {
    name: 'Premium',
    price: '₹14,999',
    features: ['100 leads/month', 'Exclusive leads', 'Phone number reveal', 'CSV export', 'Dedicated manager'],
    color: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-700',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#2D7D46] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="w-8 h-8 text-[#1E3A5F]" />
          <h1 className="text-xl font-bold text-[#1E3A5F]">EduLeads Kerala</h1>
          <div className="ml-auto flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-8 h-2 rounded-full transition-colors ${s <= step ? 'bg-[#1E3A5F]' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to EduLeads Kerala!</h2>
            <p className="text-muted-foreground mb-8">Kerala's first AI-powered student lead platform</p>
            <div className="space-y-4 text-left mb-8">
              {[
                'Get qualified student leads matched to your courses using our AI Malayalam counsellor',
                'Leads are scored in real-time so you know exactly who is ready to enroll',
                'Chat with students directly through WhatsApp — all managed in one dashboard',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-[#2D7D46] shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{point}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)}
              className="bg-[#1E3A5F] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#162d4a] transition-colors">
              Choose Your Plan →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1 text-center">Choose a Plan</h2>
            <p className="text-muted-foreground text-center text-sm mb-6">Start free, upgrade as you grow</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  onClick={() => { setSelectedPlan(plan.name); setShowModal(true); }}
                  className={`relative border-2 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow ${plan.color}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E3A5F] text-white text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${plan.badge}`}>{plan.name}</span>
                  <p className="text-2xl font-bold text-foreground mt-3 mb-1">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-2 mt-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D7D46] shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-4 border border-[#1E3A5F] text-[#1E3A5F] py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button onClick={() => setStep(3)} className="text-sm text-muted-foreground hover:text-foreground underline">
                Skip for now, decide later
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Account is Ready!</h2>
            <p className="text-muted-foreground mb-8">Start exploring the dashboard and receiving leads</p>
            <button onClick={() => navigate('/dashboard/overview')}
              className="bg-[#2D7D46] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#236338] transition-colors">
              Go to Dashboard →
            </button>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Activate {selectedPlan} Plan</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
                <MessageCircle className="w-6 h-6 text-[#2D7D46] shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  To activate the <strong>{selectedPlan}</strong> plan, contact us on WhatsApp:{' '}
                  <strong>+91-XXXXXXXXXX</strong>. We will activate your plan within 2 hours of payment confirmation.
                </p>
              </div>
              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-medium hover:bg-[#20c05c] transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
              </a>
              <button onClick={() => { setShowModal(false); setStep(3); }}
                className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground py-2">
                I'll pay later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
