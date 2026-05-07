import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Users as UsersIcon } from 'lucide-react';

export default function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users/').then((r) => r.data),
  });

  const roleBadge: Record<string, string> = {
    superadmin: 'bg-red-100 text-red-700',
    college_admin: 'bg-blue-100 text-blue-700',
    college_staff: 'bg-gray-100 text-gray-700',
    agency_admin: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Users</h1>
        <p className="text-muted-foreground text-sm mt-1">{data?.count ?? 0} users on the platform</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border sticky top-0">
            <tr>
              {['Name', 'Email', 'Role', 'Tenant', 'Joined'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-24" /></td>)}
                  </tr>
                ))
              : data?.results?.map((u: any) => (
                  <tr key={u.id} className="border-b border-border hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{u.full_name || u.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[u.role] || 'bg-gray-100 text-gray-700'}`}>
                        {u.role?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.tenant_name || '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.date_joined ? new Date(u.date_joined).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && (!data?.results || data.results.length === 0) && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <UsersIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
