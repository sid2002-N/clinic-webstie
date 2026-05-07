import { Phone, PhoneCall, Loader2 } from 'lucide-react';

export type CallState = 'idle' | 'confirming' | 'calling' | 'connected' | 'failed';

interface Props {
  callState: CallState;
  callSid: string | null;
  onInitiate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  compact?: boolean;
}

export default function MaskedCallButton({
  callState, callSid, onInitiate, onConfirm, onCancel, compact = false,
}: Props) {
  if (callState === 'idle') {
    return (
      <button onClick={onInitiate} className="btn-call" style={compact ? { padding: '7px 14px', fontSize: 'var(--text-xs)' } : {}}>
        <Phone size={compact ? 13 : 15} />
        {compact ? 'Masked Call' : 'Call via Platform'}
      </button>
    );
  }

  if (callState === 'confirming') {
    return (
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ border: '1px solid var(--border-default)', background: 'var(--surface-base)' }}
      >
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Masked Call
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your number stays private. The student sees only the platform number.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary btn-sm flex-1"
          >
            Call Now
          </button>
        </div>
      </div>
    );
  }

  if (callState === 'calling') {
    return (
      <div className="call-status calling">
        <div className="pulse-ring" />
        <span>Connecting call…</span>
      </div>
    );
  }

  if (callState === 'connected') {
    return (
      <div className="call-status connected">
        <div className="pulse-ring green" />
        <PhoneCall size={15} />
        <span>Call connected</span>
        {callSid && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
            #{callSid.slice(-6)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="call-status failed">
      <span>Call failed — try again</span>
      <button
        onClick={onInitiate}
        className="btn btn-sm ml-auto"
        style={{ border: 'none', background: 'transparent', color: '#b91c1c', padding: '2px 6px', textDecoration: 'underline' }}
      >
        Retry
      </button>
    </div>
  );
}
