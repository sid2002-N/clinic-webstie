import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { CreditCard } from 'lucide-react';

export default function AdminPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => api.get('/admin/payments/').then((r) => r.data),
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payment Ledger</h1>
        <p className="text-muted-foreground text-sm mt-1">All Razorpay transactions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border sticky top-0">
            <tr>
              {['Tenant', 'Plan', 'Amount', 'Status', 'Date', 'Razorpay ID'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-20" /></td>)}
                  </tr>
                ))
              : data?.results?.map((p: any) => (
                  <tr key={p.id} className="border-b border-border hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{p.tenant_name}</td>
                    <td className="px-5 py-3 capitalize text-muted-foreground">{p.plan}</td>
                    <td className="px-5 py-3 font-medium">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'captured' ? 'bg-green-100 text-green-700'
                        : p.status === 'failed' ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{p.razorpay_payment_id || '—'}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && (!data?.results || data.results.length === 0) && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No payments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
