import {
  useEffect, useRef, useState, useCallback,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Wifi, WifiOff, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export type Msg = {
  id: string;
  role: 'student' | 'ai' | 'human_agent';
  content: string;
  created_at: string;
  channel?: string;
};

interface Props {
  leadId: string;
  plan: string | null;
  accessToken: string | null;
  showWsIndicator?: boolean;
}

function buildWsUrl(leadId: string, token: string): string {
  const envBase = import.meta.env.VITE_WS_URL as string | undefined;
  if (envBase) return `${envBase.replace(/\/$/, '')}/ws/leads/${leadId}/?token=${token}`;
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws/leads/${leadId}/?token=${token}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDateKey(iso: string) {
  return new Date(iso).toDateString();
}

export default function RealTimeChat({
  leadId, plan, accessToken, showWsIndicator = true,
}: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [draft, setDraft] = useState('');
  const [wsMessages, setWsMessages] = useState<Msg[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  const { data: historyData } = useQuery({
    queryKey: ['lead-messages', leadId],
    queryFn: () => api.get(`/leads/${leadId}/messages/`).then((r) => r.data),
    enabled: !!leadId,
    refetchInterval: wsConnected ? false : 10_000,
  });

  const connectWs = useCallback(() => {
    if (!leadId || !accessToken) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const url = buildWsUrl(leadId, accessToken);
    const ws = new WebSocket(url);
    ws.onopen = () => setWsConnected(true);
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'message' || data.type === 'student_message') {
          const incoming = data.message as Msg;
          setWsMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      } catch (_) {}
    };
    ws.onclose = () => {
      setWsConnected(false);
      reconnectRef.current = setTimeout(connectWs, 3000);
    };
    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, [leadId, accessToken]);

  useEffect(() => {
    connectWs();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connectWs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wsMessages, historyData]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/leads/${leadId}/messages/`, { content }),
    onSuccess: (res) => {
      const saved: Msg = res.data;
      setWsMessages((prev) => {
        if (prev.some((m) => m.id === saved.id)) return prev;
        return [...prev, saved];
      });
      qc.invalidateQueries({ queryKey: ['lead-messages', leadId] });
    },
  });

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: trimmed }));
      setDraft('');
    } else {
      sendMutation.mutate(trimmed);
      setDraft('');
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const historic: Msg[] = Array.isArray(historyData)
    ? historyData
    : historyData?.results ?? [];

  const allMessages = [
    ...historic,
    ...wsMessages.filter((m) => !historic.some((h) => h.id === m.id)),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Group by date for separators
  const messageGroups: { dateKey: string; label: string; messages: Msg[] }[] = [];
  allMessages.forEach((msg) => {
    const key = getDateKey(msg.created_at);
    const last = messageGroups[messageGroups.length - 1];
    if (last && last.dateKey === key) {
      last.messages.push(msg);
    } else {
      messageGroups.push({ dateKey: key, label: formatDateLabel(msg.created_at), messages: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Conversation
        </p>
        <div className="flex items-center gap-3">
          <span
            className="badge badge-info"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            via WhatsApp
          </span>
          {showWsIndicator && (
            wsConnected ? (
              <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--green-700)' }}>
                <Wifi size={12} /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1 animate-pulse" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                <WifiOff size={12} /> Reconnecting
              </span>
            )
          )}
        </div>
      </div>

      {/* Basic plan banner */}
      {plan === 'basic' && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 border-b shrink-0"
          style={{
            background: '#fffbeb',
            borderColor: '#fde68a',
            borderBottom: '1px solid #fde68a',
          }}
        >
          <Zap size={14} style={{ color: '#d97706', marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 'var(--text-xs)', color: '#92400e', lineHeight: 1.5 }}>
            Messages are forwarded to the student via WhatsApp.{' '}
            <button
              onClick={() => navigate('/dashboard/billing')}
              className="underline font-semibold"
              style={{ color: '#92400e' }}
            >
              Upgrade to Pro
            </button>{' '}
            to enable voice calls.
          </p>
        </div>
      )}

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-1 min-h-0"
        style={{ background: 'var(--surface-subtle)' }}
      >
        {allMessages.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-full text-center py-12"
            style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--surface-muted)' }}
            >
              <Send size={18} style={{ color: 'var(--text-disabled)' }} />
            </div>
            No messages yet — conversation will appear here in real time
          </div>
        )}

        {messageGroups.map((group) => (
          <div key={group.dateKey}>
            {/* Date separator */}
            <div className="flex items-center gap-3 py-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                {group.label}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
            </div>

            {group.messages.map((msg, idx) => {
              const isCollege = msg.role === 'human_agent';
              const isAI = msg.role === 'ai';
              return (
                <div
                  key={msg.id || idx}
                  className="flex msg-in mb-2"
                  style={{ justifyContent: isCollege ? 'flex-end' : 'flex-start' }}
                >
                  {isAI && (
                    <span
                      className="self-end mr-1.5 mb-1 shrink-0"
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}
                    >
                      Mitra
                    </span>
                  )}
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '10px 14px',
                      borderRadius: isCollege
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      fontSize: 'var(--text-sm)',
                      background: isCollege
                        ? 'var(--brand-800)'
                        : isAI
                        ? 'rgba(45,125,70,0.08)'
                        : 'var(--surface-base)',
                      color: isCollege ? 'white' : 'var(--text-primary)',
                      border: isCollege ? 'none' : isAI ? '1px solid rgba(45,125,70,0.2)' : '1px solid var(--border-default)',
                      boxShadow: isCollege ? 'none' : 'var(--shadow-xs)',
                    }}
                  >
                    <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>
                      {msg.content}
                    </p>
                    <p
                      className="mt-1 text-right"
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: isCollege ? 'rgba(255,255,255,0.55)' : 'var(--text-tertiary)',
                      }}
                    >
                      {formatTime(msg.created_at)}
                      {isAI && ' · AI'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="shrink-0 flex items-end gap-2.5 px-4 py-3 border-t"
        style={{ background: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}
      >
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Message the student via WhatsApp…"
          rows={1}
          style={{
            flex: 1,
            minHeight: 42,
            maxHeight: 120,
            padding: '10px 14px',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-xl)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-primary)',
            background: 'var(--surface-base)',
            resize: 'none',
            outline: 'none',
            fontFamily: 'var(--font)',
            lineHeight: 1.5,
            transition: 'border var(--dur-fast), box-shadow var(--dur-fast)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--border-focus)';
            e.target.style.boxShadow = 'var(--shadow-focus)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-default)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={sendMutation.isPending || !draft.trim()}
          style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: draft.trim() ? 'var(--brand-800)' : 'var(--surface-muted)',
            color: draft.trim() ? 'white' : 'var(--text-disabled)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all var(--dur-fast)',
            cursor: draft.trim() ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => { if (draft.trim()) (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-700)'; }}
          onMouseLeave={(e) => { if (draft.trim()) (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-800)'; }}
        >
          {sendMutation.isPending
            ? <Loader2 size={16} className="animate-spin" />
            : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
