import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { animate } from 'animejs';
import { modalIn } from '../../utils/animations';

const widths: Record<string, number> = { sm: 420, md: 560, lg: 720, xl: 900 };

interface ModalAnimatedProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ModalAnimated({ open, onClose, title, size = 'md', children, footer }: ModalAnimatedProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      modalIn(panelRef.current);
      if (overlayRef.current) {
        animate(overlayRef.current, { opacity: [0, 1], duration: 180, ease: 'out(2)' });
      }
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={overlayRef} onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'var(--surface-overlay)',
      backdropFilter: 'blur(4px)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div ref={panelRef} onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface-base)', borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-xl)',
        width: widths[size], maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-secondary)', borderRadius: 'var(--r-sm)' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 24, flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ padding: '16px 24px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
