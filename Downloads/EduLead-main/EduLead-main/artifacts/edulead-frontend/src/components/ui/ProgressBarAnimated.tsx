import React, { useEffect, useRef } from 'react';
import { animateBar } from '../../utils/animations';

const trackHeights: Record<string, number> = { sm: 4, md: 8, lg: 12 };

function getFill(value: number) {
  if (value < 70) return 'linear-gradient(90deg, #16a34a, #22c55e)';
  if (value < 90) return 'linear-gradient(90deg, #d97706, #f59e0b)';
  return 'linear-gradient(90deg, #dc2626, #ef4444)';
}

interface ProgressBarAnimatedProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export default function ProgressBarAnimated({ value = 0, size = 'md', showLabel = false, animated = true }: ProgressBarAnimatedProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const h = trackHeights[size];

  useEffect(() => {
    if (animated) animateBar(fillRef.current, value);
    else if (fillRef.current) fillRef.current.style.width = `${value}%`;
  }, [value, animated]);

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{value}%</span>
        </div>
      )}
      <div style={{ background: 'var(--surface-muted)', borderRadius: 'var(--r-full)', height: h, overflow: 'hidden' }}>
        <div ref={fillRef} style={{
          height: '100%', width: 0, background: getFill(value),
          borderRadius: 'var(--r-full)',
        }} />
      </div>
    </div>
  );
}
