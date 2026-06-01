import { BookOpen, Briefcase, Code2, GitBranch, Github, Mail, Search, Sparkles, TerminalSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commands = [
  { label: "GitHub", description: "Open engineering dashboard", href: "/#github", icon: Github },
  { label: "Workspace", description: "Inspect Neovim files", href: "/#workspace", icon: TerminalSquare },
  { label: "Projects", description: "View project cards", href: "/#projects", icon: Briefcase },
  { label: "Learn With Me", description: "Open Python basics course page", href: "/learn", icon: BookOpen },
  { label: "Worlds", description: "Open the wider map", href: "/worlds", icon: GitBranch },
  { label: "Hugging Face", description: "Open AI lab", href: "/#lab", icon: Sparkles },
  { label: "PyPI", description: "Open package dashboard", href: "/#pypi", icon: Code2 },
  { label: "Contact", description: "Deploy a message", href: "/#contact", icon: Mail },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => commands.filter((command) => `${command.label} ${command.description}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(true);
      }
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[8000] flex items-start justify-center px-4 pt-[14vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <button className="absolute inset-0 bg-canvas/80 backdrop-blur-xl" aria-label="Close command palette" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-line/20 bg-panel shadow-soft">
        <div className="flex items-center gap-3 border-b border-line/10 px-4 py-4">
          <Search className="h-4 w-4 text-dim" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands..."
            className="w-full bg-transparent font-mono text-sm text-ink outline-none placeholder:text-dim"
          />
          <kbd className="rounded border border-line/10 bg-canvas px-2 py-1 font-mono text-[0.68rem] text-dim">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          <div className="px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-dim">Commands</div>
          {filtered.map((command) => {
            const Icon = command.icon;
            return (
              <a
                key={command.href}
                href={command.href}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 font-mono text-sm text-muted transition hover:bg-blue/10 hover:text-ink"
              >
                <Icon className="h-4 w-4 text-dim" />
                <span>{command.label}</span>
                <span className="ml-auto text-xs text-dim">{command.description}</span>
              </a>
            );
          })}
          {!filtered.length ? <p className="px-3 py-8 text-center font-mono text-sm text-dim">No commands found.</p> : null}
        </div>
      </div>
    </div>
  );
}
