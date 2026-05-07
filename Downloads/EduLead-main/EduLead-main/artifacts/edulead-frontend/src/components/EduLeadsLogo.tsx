interface LogoMarkProps {
  size?: number;
  style?: React.CSSProperties;
}

/** Small square mark — used in tight spaces like sidebars */
export function EduLeadsLogoMark({ size = 36, style }: LogoMarkProps) {
  return (
    <img
      src="/logo.png"
      alt="EduLeads Kerala"
      style={{
        height: Math.round(size * 1.6),
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}

interface LogoProps {
  size?: number;
  onDark?: boolean; // kept for API compatibility — no-op now
  style?: React.CSSProperties;
}

/** Full logo with text */
export function EduLeadsLogo({ size = 36, style }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="EduLeads Kerala"
      style={{
        height: Math.round(size * 4),
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}

export default EduLeadsLogo;
