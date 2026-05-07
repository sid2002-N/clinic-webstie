import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputAnimatedProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ElementType;
  iconRight?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  type?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export default function InputAnimated({
  label, error, hint, icon: Icon, iconRight,
  size = 'md', type = 'text', style = {}, ...props
}: InputAnimatedProps) {
  const [focused, setFocused] = useState(false);
  const padMap: Record<string, string> = { sm: '8px 12px', md: '10px 14px', lg: '12px 16px' };
  const fontMap: Record<string, string> = { sm: 'var(--text-sm)', md: 'var(--text-sm)', lg: 'var(--text-base)' };
  const padLeftMap: Record<string, number> = { sm: 36, md: 40, lg: 44 };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: padMap[size],
    paddingLeft: Icon ? padLeftMap[size] : undefined,
    border: `1px solid ${error ? '#ef4444' : focused ? 'var(--border-focus)' : 'var(--border-default)'}`,
    borderRadius: 'var(--r-md)',
    fontSize: fontMap[size],
    color: 'var(--text-primary)',
    background: 'var(--surface-base)',
    outline: 'none',
    boxShadow: error ? 'var(--shadow-focus-danger)' : focused ? 'var(--shadow-focus)' : 'none',
    transition: 'border var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)',
    fontFamily: 'var(--font)',
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)', display: 'block' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <Icon size={15} style={{
            position: 'absolute', left: 12,
            color: focused ? 'var(--brand-500)' : 'var(--text-tertiary)',
            transition: 'color var(--dur-fast)',
            pointerEvents: 'none',
          }} />
        )}
        <input
          type={type}
          style={inputStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {iconRight && <div style={{ position: 'absolute', right: 12 }}>{iconRight}</div>}
      </div>
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-danger)', marginTop: 'var(--sp-1)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} /> {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--sp-1)' }}>{hint}</span>
      )}
    </div>
  );
}
