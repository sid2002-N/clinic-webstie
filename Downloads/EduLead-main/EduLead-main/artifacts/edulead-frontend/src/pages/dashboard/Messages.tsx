import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { getCategoryLabel } from '../../lib/scoring';
import { MessageSquare, Search, Flame, Thermometer, Snowflake } from 'lucide-react';
import { useState } from 'react';

const categoryIcon: Record<string, React.ReactNode> = {
  hot:  <Flame className="w-3.5 h-3.5 text-red-500" />,
  warm: <Thermometer className="w-3.5 h-3.5 text-orange-400" />,
  cold: <Snowflake className="w-3.5 h-3.5 text-blue-400" />,
};

function timeAgo(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Messages() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-leads-messages'],
    queryFn: () =>
      api.get('/leads/', { params: { page_size: 50, ordering: '-last_activity_at' } })
         .then((r) => r.data),
    refetchInterval: 15000,
  });

  const leads: any[] = data?.results ?? data ?? [];

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.student_name || l.full_name || '').toLowerCase().includes(q) ||
      (l.course_interest || '').toLowerCase().includes(q) ||
      (l.location || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 md:p-8 pb-4 border-b border-border bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Chat with students via WhatsApp — messages appear here in real time
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, course or location…"
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F]/8 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#1E3A5F]/40" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              {search ? 'No results found' : 'No leads yet'}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {search
                ? 'Try a different search term'
                : 'Leads with active WhatsApp conversations will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((lead) => {
              const cat = getCategoryLabel(lead.score);
              const name = lead.student_name || lead.full_name || 'Student';
              const initial = name.charAt(0).toUpperCase();
              const lastMsg = lead.last_message || lead.last_activity_at;

              return (
                <button
                  key={lead.id}
                  onClick={() => navigate(`/dashboard/leads/${lead.id}`)}
                  className="w-full flex items-center gap-4 px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white
                    ${lead.category === 'hot' ? 'bg-red-500' : lead.category === 'warm' ? 'bg-orange-400' : 'bg-[#1E3A5F]'}`}>
                    {initial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-foreground text-sm truncate">{name}</span>
                      {categoryIcon[lead.category]}
                      {cat && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${cat.className}`}>
                          {cat.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {lead.course_interest || 'Course unknown'}
                      {lead.location ? ` · ${lead.location}` : ''}
                    </p>
                    {lead.last_message_preview && (
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5 italic">
                        "{lead.last_message_preview}"
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {lastMsg && (
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(lastMsg)}
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${lead.score >= 70 ? 'bg-red-100 text-red-600'
                        : lead.score >= 40 ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-500'}`}>
                      {lead.score ?? 0}
                    </span>
                    {lead.status === 'new' && (
                      <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
