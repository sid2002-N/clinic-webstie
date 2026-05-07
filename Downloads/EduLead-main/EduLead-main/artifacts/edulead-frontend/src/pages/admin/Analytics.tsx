import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics-full'],
    queryFn: () => api.get('/admin/analytics/').then((r) => r.data),
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Comprehensive platform performance data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Leads Over Time</h2>
          {isLoading ? <div className="skeleton h-52 rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={data?.leads_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1E3A5F" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Lead Quality Distribution</h2>
          {isLoading ? <div className="skeleton h-52 rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={[
                { name: 'Hot', value: data?.category_counts?.hot ?? 0, fill: '#16a34a' },
                { name: 'Warm', value: data?.category_counts?.warm ?? 0, fill: '#d97706' },
                { name: 'Cold', value: data?.category_counts?.cold ?? 0, fill: '#6b7280' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Subscriptions by Plan</h2>
          {isLoading ? <div className="skeleton h-52 rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={[
                { plan: 'Basic', count: data?.plan_counts?.basic ?? 0 },
                { plan: 'Pro', count: data?.plan_counts?.pro ?? 0 },
                { plan: 'Premium', count: data?.plan_counts?.premium ?? 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="plan" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2D7D46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Revenue Over Time</h2>
          {isLoading ? <div className="skeleton h-52 rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={data?.revenue_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="amount" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
