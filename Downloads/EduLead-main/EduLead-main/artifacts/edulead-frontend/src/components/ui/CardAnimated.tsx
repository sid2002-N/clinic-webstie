import React from 'react';
import { animate } from 'animejs';

const variantBase: Record<string, React.CSSProperties> = {
  default:     { background: 'var(--surface-base)',   border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' },
  elevated:    { background: 'var(--surface-base)',   border: '1px solid transparent',           boxShadow: 'var(--shadow-md)' },
  flat:        { background: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)',   boxShadow: 'none' },
  interactive: { background: 'var(--surface-base)',   border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' },
};

const padMap: Record<string, number> = { sm: 16, md: 24, lg: 32 };

interface CardAnimatedProps {
  variant?: keyof typeof variantBase;
  padding?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  [key: string]: any;
}

export default function CardAnimated({ variant = 'default', padding = 'md', noPadding = false, children, onClick, style = {}, ...props }: CardAnimatedProps) {
  const isInteractive = variant === 'interactive' || !!onClick;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    animate(e.currentTarget, { translateY: -2, duration: 180, ease: 'out(2)' });
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    animate(e.currentTarget, { translateY: 0, duration: 180, ease: 'out(2)' });
  };

  return (
    <div
      style={{
        borderRadius: 'var(--r-lg)',
        padding: noPadding ? 0 : padMap[padding],
        transition: 'border-color var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)',
        ...variantBase[variant],
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
