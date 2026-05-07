import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Building2, BookOpen, TrendingUp, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics/').then((r) => r.data),
  });

  const metrics = [
    { label: 'Total Tenants', value: data?.total_tenants ?? '—', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Leads', value: data?.total_leads ?? '—', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Leads This Month', value: data?.leads_this_month ?? '—', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Subscriptions', value: data?.active_subscriptions ?? '—', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const chartData = [
    { plan: 'Basic', count: data?.plan_counts?.basic ?? 0 },
    { plan: 'Pro', count: data?.plan_counts?.pro ?? 0 },
    { plan: 'Premium', count: data?.plan_counts?.premium ?? 0 },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time platform metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-border p-5">
            {isLoading ? (
              <div className="skeleton h-16 rounded-lg" />
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Subscriptions by Plan</h2>
          {isLoading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="plan" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Recent Signups</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
            </div>
          ) : data?.recent_signups?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium text-xs uppercase">Name</th>
                  <th className="text-left py-2 text-muted-foreground font-medium text-xs uppercase">Type</th>
                  <th className="text-left py-2 text-muted-foreground font-medium text-xs uppercase">Plan</th>
                  <th className="text-left py-2 text-muted-foreground font-medium text-xs uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_signups.map((t: any) => (
                  <tr key={t.id} className="border-b border-border hover:bg-gray-50">
                    <td className="py-2 font-medium">{t.name}</td>
                    <td className="py-2 capitalize text-muted-foreground">{t.type}</td>
                    <td className="py-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">{t.plan}</span>
                    </td>
                    <td className="py-2 text-muted-foreground">{new Date(t.joined).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No signups yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
