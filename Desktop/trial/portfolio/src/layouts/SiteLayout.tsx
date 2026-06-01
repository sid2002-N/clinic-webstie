import { Code2, Command, Github, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../components/ui/Button";
import { profile } from "../data/profile";

const navItems = [
  { label: "github", href: "/#github" },
  { label: "workspace", href: "/#workspace" },
  { label: "projects", href: "/#projects" },
  { label: "learn", href: "/learn" },
  { label: "worlds", href: "/worlds" },
  { label: "lab", href: "/#lab" },
  { label: "pypi", href: "/#pypi" },
  { label: "contact", href: "/#contact" },
];

interface SiteLayoutProps {
  children: ReactNode;
  booted: boolean;
  onOpenCommandPalette: () => void;
}

export function SiteLayout({ children, booted, onOpenCommandPalette }: SiteLayoutProps) {
  return (
    <div className={`min-h-screen transition duration-700 ${booted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
      <div className="fixed inset-0 z-0 grid-bg" aria-hidden="true" />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/10 bg-canvas/82 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
          <a href="/" className="flex items-center gap-2 font-mono text-sm text-ink">
            <span className="text-lime">❯</span>
            <span>{profile.name.split(" ")[0].toLowerCase()}.dev</span>
            <span className="h-4 w-2 animate-blink bg-blue" aria-hidden="true" />
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="font-mono text-xs text-muted transition hover:text-ink">
                {item.label}
              </a>
            ))}
          </div>
          <Button variant="ghost" onClick={onOpenCommandPalette} icon={<Command className="h-3.5 w-3.5" />}>
            <span className="hidden sm:inline">Command</span>
            <kbd className="rounded border border-line/15 bg-canvas px-1.5 py-0.5 text-[0.65rem] text-dim">Ctrl K</kbd>
          </Button>
        </nav>
      </header>
      <main className="site-main relative z-10 pt-14">{children}</main>
      <footer className="relative z-10 border-t border-line/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 font-mono text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 · Built with React, Vite, TypeScript, and TailwindCSS.</span>
          <div className="flex items-center gap-3">
            <a className="transition hover:text-ink" href={profile.links[0]?.href} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a className="transition hover:text-ink" href={`mailto:${profile.email}`} aria-label="Email">
              <Mail className="h-4 w-4" />
            </a>
            <Code2 className="h-4 w-4 text-blue" aria-hidden="true" />
          </div>
        </div>
      </footer>
    </div>
  );
}
