import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { Users, Plus, X, Loader2 } from 'lucide-react';

export default function Team() {
  const { role } = useAuthStore();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ email: '', full_name: '', role: 'college_staff' });

  const { data, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => api.get('/team/').then((r) => r.data),
  });

  const inviteMutation = useMutation({
    mutationFn: () => api.post('/team/invite/', invite),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] });
      setShowInvite(false);
      setInvite({ email: '', full_name: '', role: 'college_staff' });
    },
  });

  const roleBadge: Record<string, string> = {
    college_admin: 'bg-blue-100 text-blue-700',
    college_staff: 'bg-gray-100 text-gray-700',
  };

  const isAdmin = role === 'college_admin' || role === 'superadmin';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your team members</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#162d4a]">
            <Plus className="w-4 h-4" /> Invite Member
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              {['Name', 'Email', 'Role', 'Joined'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-muted-foreground font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(4)].map((_, j) => <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-24" /></td>)}
                  </tr>
                ))
              : (data?.results || data || []).map((member: any) => (
                  <tr key={member.id} className="border-b border-border hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{member.full_name || member.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{member.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[member.role] || 'bg-gray-100 text-gray-700'}`}>
                        {member.role?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {member.date_joined ? new Date(member.date_joined).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && (!data || (data.results || data).length === 0) && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No team members yet</p>
          </div>
        )}
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={invite.full_name} onChange={(e) => setInvite((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Full name" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
              <input value={invite.email} onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email address" type="email" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]" />
              <select value={invite.role} onChange={(e) => setInvite((f) => ({ ...f, role: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]">
                <option value="college_staff">College Staff</option>
                <option value="college_admin">College Admin</option>
              </select>
            </div>
            {inviteMutation.isError && <p className="text-red-500 text-xs mt-2">Failed to invite. Try again.</p>}
            <button onClick={() => inviteMutation.mutate()} disabled={inviteMutation.isPending}
              className="w-full mt-4 bg-[#1E3A5F] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#162d4a] disabled:opacity-60 flex items-center justify-center gap-2">
              {inviteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Invitation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
