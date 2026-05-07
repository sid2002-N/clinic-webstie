import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { getCategoryLabel, getScoreColor } from '../../lib/scoring';
import { ArrowLeft } from 'lucide-react';

export default function AdminLeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-lead', id],
    queryFn: () => api.get(`/admin/leads/${id}/`).then((r) => r.data),
    enabled: !!id,
  });

  const cat = data ? getCategoryLabel(data.score) : null;

  return (
    <div className="p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </button>

      {isLoading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : data ? (
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 max-w-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">{data.student_name}</h1>
              <p className="text-muted-foreground text-sm">{data.course_interest} · {data.location}</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-black ${getScoreColor(data.score)}`}>{data.score}</div>
              {cat && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.className}`}>{cat.label}</span>}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['WhatsApp', data.whatsapp_number],
              ['Budget', data.budget_range],
              ['Timeline', data.timeline],
              ['Intent', data.intent_level],
              ['Status', data.status],
              ['Created', data.created_at ? new Date(data.created_at).toLocaleDateString('en-IN') : '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <dt className="text-muted-foreground mb-0.5">{label}</dt>
                <dd className="font-medium text-foreground capitalize">{val || '—'}</dd>
              </div>
            ))}
          </dl>
          {data.notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{data.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">Lead not found</div>
      )}
    </div>
  );
}
