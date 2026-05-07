import React, { useEffect, useRef, useState } from 'react';
import { countUp, scoreRingPulse } from '../../utils/animations';

const sizes: Record<string, number> = { sm: 36, md: 56, lg: 72 };
const fonts: Record<string, string> = { sm: '13px', md: '18px', lg: '24px' };

function getCategory(score: number) {
  if (score >= 70) return { border: '#16a34a', fill: '#dcfce7', text: '#15803d' };
  if (score >= 40) return { border: '#d97706', fill: '#fef9c3', text: '#92400e' };
  return { border: '#9ca3af', fill: '#f3f4f6', text: '#4b5563' };
}

interface ScoreRingAnimatedProps {
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function ScoreRingAnimated({ score = 0, size = 'md', animated = true }: ScoreRingAnimatedProps) {
  const [display, setDisplay] = useState(animated ? 0 : score);
  const ref = useRef<HTMLDivElement>(null);
  const cat = getCategory(display);
  const px = sizes[size];

  useEffect(() => {
    if (animated) {
      countUp(0, score, setDisplay, 900);
      scoreRingPulse(ref.current);
    }
  }, [score, animated]);

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: px, height: px, borderRadius: '50%',
        border: `2.5px solid ${cat.border}`,
        background: cat.fill,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 400ms, border-color 400ms',
      }}>
        <span style={{ fontSize: fonts[size], fontWeight: 700, color: cat.text, lineHeight: 1 }}>
          {display}
        </span>
      </div>
      {size !== 'sm' && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>score</span>
      )}
    </div>
  );
}
