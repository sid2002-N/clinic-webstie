import type { ReactNode } from "react";

interface TerminalBlockProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function TerminalBlock({ title, children, className = "" }: TerminalBlockProps) {
  return (
    <div className={`glass-panel overflow-hidden rounded-xl ${className}`}>
      <div className="flex items-center gap-3 border-b border-line/10 bg-white/[0.03] px-4 py-3">
        <div className="terminal-dots" aria-hidden="true">
          <span className="terminal-dot bg-[#ff5f57]" />
          <span className="terminal-dot bg-[#ffbd2e]" />
          <span className="terminal-dot bg-[#28ca41]" />
        </div>
        <div className="mx-auto -translate-x-8 font-mono text-xs text-dim">{title}</div>
      </div>
      {children}
    </div>
  );
}
