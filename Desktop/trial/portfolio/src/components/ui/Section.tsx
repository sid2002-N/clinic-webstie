import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  label: string;
  title: string;
  copy?: string;
  children: ReactNode;
}

export function Section({ id, label, title, copy, children }: SectionProps) {
  return (
    <section id={id} className="section-shell scroll-mt-20">
      <div className="section-kicker">{label}</div>
      <h2 className="section-title">{title}</h2>
      {copy ? <p className="section-copy">{copy}</p> : null}
      <div className="mt-10">{children}</div>
    </section>
  );
}
