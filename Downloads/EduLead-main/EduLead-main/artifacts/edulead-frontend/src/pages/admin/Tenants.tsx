import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Building2, ChevronRight } from 'lucide-react';

export default function AdminTenants() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => api.get('/admin/tenants/').then((r) => r.data),
  });

  const planBadge: Record<string, string> = {
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
    premium: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Tenants</h1>
        <p className="text-muted-foreground text-sm mt-1">Colleges and agencies on the platform</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border sticky top-0">
            <tr>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">Name</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">Type</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">Plan</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">Leads Used</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              : data?.results?.map((t: any) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/admin/tenants/${t.id}`)}
                    className="border-b border-border hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize text-muted-foreground">{t.tenant_type}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${planBadge[t.plan] || 'bg-gray-100 text-gray-700'}`}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{t.leads_used ?? 0} / {t.leads_quota ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && (!data?.results || data.results.length === 0) && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No tenants found</p>
          </div>
        )}
      </div>
    </div>
  );
}
