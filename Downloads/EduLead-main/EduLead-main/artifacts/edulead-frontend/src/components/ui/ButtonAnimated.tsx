import React, { useRef } from 'react';
import { animate } from 'animejs';

const variantStyles: Record<string, React.CSSProperties> = {
  primary:   { background: 'var(--brand-800)',  color: 'var(--text-inverse)',   border: '1px solid var(--brand-800)' },
  secondary: { background: 'transparent',        color: 'var(--brand-700)',      border: '1px solid var(--border-default)' },
  ghost:     { background: 'transparent',        color: 'var(--text-secondary)', border: '1px solid transparent' },
  danger:    { background: '#fee2e2',            color: '#991b1b',               border: '1px solid #fecaca' },
  success:   { background: 'var(--green-100)',   color: 'var(--green-800)',      border: '1px solid var(--green-100)' },
  outline:   { background: 'transparent',        color: 'var(--brand-700)',      border: '1px solid var(--brand-600)' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px',  fontSize: 'var(--text-sm)',   height: '32px', gap: '6px' },
  md: { padding: '9px 18px',  fontSize: 'var(--text-sm)',   height: '38px', gap: '7px' },
  lg: { padding: '12px 24px', fontSize: 'var(--text-base)', height: '46px', gap: '8px' },
};

interface ButtonAnimatedProps {
  children?: React.ReactNode;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ElementType;
  iconRight?: React.ElementType;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

export default function ButtonAnimated({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon: Icon, iconRight: IconRight,
  onClick, style = {}, type = 'button', ...props
}: ButtonAnimatedProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (ref.current) {
      animate(ref.current, { scale: [1, 0.96, 1], duration: 200, ease: 'out(2)' });
    }
    if (!disabled && !loading && onClick) onClick(e);
  };

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font)', fontWeight: 500, whiteSpace: 'nowrap',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    borderRadius: 'var(--r-md)',
    transition: 'background var(--dur-base) var(--ease), border-color var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)',
    userSelect: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button ref={ref} style={base} onClick={handleClick} disabled={disabled || loading} type={type} {...props}>
      {loading ? (
        <span style={{
          width: 14, height: 14, borderRadius: '50%',
          border: '2px solid currentColor', borderTopColor: 'transparent',
          animation: 'spin 0.6s linear infinite', display: 'inline-block',
          marginRight: children ? 7 : 0,
        }} />
      ) : Icon ? <Icon size={15} /> : null}
      {children}
      {!loading && IconRight ? <IconRight size={14} style={{ marginLeft: 4 }} /> : null}
    </button>
  );
}
