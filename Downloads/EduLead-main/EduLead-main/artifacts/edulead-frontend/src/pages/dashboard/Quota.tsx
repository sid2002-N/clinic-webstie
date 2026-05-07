import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle2 } from 'lucide-react';

const planFeatures: Record<string, string[]> = {
  basic: ['10 leads/month', 'AI WhatsApp counsellor', 'Basic analytics', 'Up to 5 colleges'],
  pro: ['30 leads/month', 'Masked calling', 'Advanced analytics', 'Priority support'],
  premium: ['100 leads/month', 'Exclusive leads', 'Phone number reveal', 'CSV export', 'Dedicated manager'],
};

export default function Quota() {
  const { plan } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-quota'],
    queryFn: () => api.get('/dashboard/quota/').then((r) => r.data),
  });

  const used = data?.quota_used ?? 0;
  const total = data?.quota_total ?? 1;
  const pct = Math.min(Math.round((used / total) * 100), 100);
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#2D7D46]';

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quota & Usage</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your monthly lead allocation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Current Month Usage</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
              plan === 'premium' ? 'bg-amber-100 text-amber-800' : plan === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>{plan} Plan</span>
          </div>
          {isLoading ? <div className="skeleton h-20 rounded-lg" /> : (
            <>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <span className="text-4xl font-black text-foreground">{used}</span>
                  <span className="text-muted-foreground text-lg"> / {total}</span>
                </div>
                <p className="text-sm text-muted-foreground">{pct}% used</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              {data?.rollover_balance > 0 && (
                <p className="text-sm text-[#2D7D46] mt-3">
                  + {data.rollover_balance} rollover leads available
                </p>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-foreground mb-3">Plan Features</h2>
          <ul className="space-y-2">
            {(planFeatures[plan ?? 'basic'] || []).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-[#2D7D46] shrink-0" /> {f}
              </li>
            ))}
          </ul>
          {plan !== 'premium' && (
            <button onClick={() => navigate('/dashboard/billing')}
              className="mt-4 w-full bg-[#2D7D46] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#236338]">
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Monthly History</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              {['Month', 'Leads Received', 'Converted', 'Conversion Rate'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(4)].map((_, j) => <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-20" /></td>)}
                  </tr>
                ))
              : (data?.monthly_history || []).map((row: any) => (
                  <tr key={row.month} className="border-b border-border hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{row.month}</td>
                    <td className="px-5 py-3 text-muted-foreground">{row.leads_received}</td>
                    <td className="px-5 py-3 text-muted-foreground">{row.converted}</td>
                    <td className="px-5 py-3">
                      <span className="text-[#2D7D46] font-medium">{row.conversion_rate}%</span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && (!data?.monthly_history || data.monthly_history.length === 0) && (
          <div className="text-center py-10 text-muted-foreground text-sm">No history yet</div>
        )}
      </div>
    </div>
  );
}
