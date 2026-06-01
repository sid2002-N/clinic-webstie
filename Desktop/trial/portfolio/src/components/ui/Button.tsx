import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary: "border-blue/80 bg-blue text-white shadow-glow hover:bg-blue/90",
  outline: "border-line/15 bg-transparent text-muted hover:border-line/30 hover:bg-white/[0.04] hover:text-ink",
  ghost: "border-line/10 bg-panel/50 text-dim hover:border-line/20 hover:text-muted",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 font-mono text-xs font-medium tracking-wide transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue/60";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  icon?: ReactNode;
}

export function Button({ className = "", variant = "primary", icon, children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({ className = "", variant = "primary", icon, children, ...props }: ButtonLinkProps) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </a>
  );
}
