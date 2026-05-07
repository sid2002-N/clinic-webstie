import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenant', id],
    queryFn: () => api.get(`/admin/tenants/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

  return (
    <div className="p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tenants
      </button>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-[#1E3A5F]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{data.name}</h1>
                <p className="text-muted-foreground text-sm capitalize">{data.tenant_type} · {data.plan} plan</p>
              </div>
              <span className={`ml-auto text-xs px-3 py-1 rounded-full ${data.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {data.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ['Email', data.billing_email],
                ['Plan', data.plan],
                ['Leads Used', `${data.leads_used ?? 0} / ${data.leads_quota ?? '—'}`],
                ['Joined', data.created_at ? new Date(data.created_at).toLocaleDateString('en-IN') : '—'],
                ['Razorpay Sub ID', data.razorpay_subscription_id || 'Not linked'],
              ].map(([label, val]) => (
                <div key={label}>
                  <dt className="text-muted-foreground mb-0.5">{label}</dt>
                  <dd className="font-medium text-foreground">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">Tenant not found</div>
      )}
    </div>
  );
}
