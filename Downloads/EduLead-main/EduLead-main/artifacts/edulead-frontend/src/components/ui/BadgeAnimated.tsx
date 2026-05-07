import React, { useEffect, useRef } from 'react';
import { popIn } from '../../utils/animations';

const config: Record<string, { fill: string; text: string; border: string; dot: string }> = {
  hot:     { fill: 'var(--hot-fill)',    text: 'var(--hot-text)',    border: 'var(--hot-border)',  dot: 'var(--hot-dot)' },
  warm:    { fill: 'var(--warm-fill)',   text: 'var(--warm-text)',   border: 'var(--warm-border)', dot: 'var(--warm-dot)' },
  cold:    { fill: 'var(--cold-fill)',   text: 'var(--cold-text)',   border: 'var(--cold-border)', dot: 'var(--cold-dot)' },
  premium: { fill: '#fef3c7',            text: '#92400e',            border: '#fde68a',            dot: '#d97706' },
  pro:     { fill: 'var(--brand-50)',    text: 'var(--brand-700)',   border: 'var(--brand-100)',   dot: 'var(--brand-500)' },
  basic:   { fill: 'var(--surface-muted)', text: 'var(--text-secondary)', border: 'var(--border-default)', dot: 'var(--text-tertiary)' },
  success: { fill: '#dcfce7', text: '#15803d', border: '#86efac', dot: '#16a34a' },
  warning: { fill: '#fef9c3', text: '#92400e', border: '#fde047', dot: '#d97706' },
  danger:  { fill: '#fee2e2', text: '#991b1b', border: '#fecaca', dot: '#dc2626' },
  info:    { fill: 'var(--brand-50)', text: 'var(--brand-700)', border: 'var(--brand-100)', dot: 'var(--brand-500)' },
  neutral: { fill: 'var(--surface-muted)', text: 'var(--text-secondary)', border: 'var(--border-default)', dot: '#9ca3af' },
};

interface BadgeAnimatedProps {
  variant?: keyof typeof config;
  size?: 'sm' | 'md';
  showDot?: boolean;
  children?: React.ReactNode;
  animate?: boolean;
}

export default function BadgeAnimated({ variant = 'neutral', size = 'sm', showDot = false, children, animate = false }: BadgeAnimatedProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const c = config[variant] || config.neutral;
  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)';

  useEffect(() => { if (animate && ref.current) popIn(ref.current); }, [animate]);

  return (
    <span ref={ref} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding, borderRadius: 'var(--r-full)', fontSize, fontWeight: 500,
      background: c.fill, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {showDot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}
