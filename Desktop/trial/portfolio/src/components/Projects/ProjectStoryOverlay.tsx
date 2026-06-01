import { Code2, Database, FileText, Image, Network, Play, Server, Video, Workflow, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { Project, ProjectAsset, ProjectAssetType } from "../../data/projects";
import { Button } from "../ui/Button";

interface ProjectStoryOverlayProps {
  project: Project;
  onClose: () => void;
}

const assetIcons: Record<ProjectAssetType, typeof Video> = {
  video: Video,
  image: Image,
  diagram: Workflow,
  code: Code2,
  doc: FileText,
};

const nodeIcons = [Server, Database, Code2, Network, Workflow, FileText];

function AssetMockup({ asset }: { asset: ProjectAsset }) {
  if (asset.type === "video") {
    return (
      <div className="mb-5 overflow-hidden rounded-md border border-line/10 bg-[#060806]">
        <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,79,195,0.22),transparent_42%),linear-gradient(135deg,rgba(190,222,74,0.14),rgba(0,0,0,0.4))]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ff8bd6]/70 bg-black/45 text-[#ff8bd6]">
            <Play className="ml-1 h-6 w-6" />
          </div>
        </div>
        <div className="space-y-1 p-3 font-mono text-[0.68rem] text-muted">
          {asset.mockup.map((line) => (
            <div key={line} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (asset.type === "diagram") {
    return (
      <div className="relative mb-5 min-h-40 overflow-hidden rounded-md border border-line/10 bg-[#050805] p-3">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 160" preserveAspectRatio="none" aria-hidden="true">
          <path d="M42 42 H142 C172 42 150 118 188 118 H278" stroke="#ff4fc3" strokeWidth="3" fill="none" />
          <path d="M42 118 H128 C158 118 158 42 192 42 H278" stroke="#bede4a" strokeWidth="3" fill="none" />
        </svg>
        <div className="relative grid h-full grid-cols-3 gap-3">
          {asset.mockup.slice(0, 6).map((line, index) => (
            <div
              key={line}
              className={`flex min-h-12 items-center justify-center border px-2 text-center font-mono text-[0.62rem] uppercase tracking-[0.08em] ${
                index % 2 ? "border-[#ff4fc3]/40 bg-[#3d0028]/50 text-[#ffb2e4]" : "border-[#bede4a]/40 bg-[#223600]/60 text-[#ddff81]"
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (asset.type === "code") {
    return (
      <pre className="mb-5 overflow-hidden rounded-md border border-line/10 bg-black/70 p-3 font-mono text-[0.68rem] leading-5 text-[#cad6aa]">
        {asset.mockup.join("\n")}
      </pre>
    );
  }

  if (asset.type === "image") {
    return (
      <div className="mb-5 rounded-md border border-line/10 bg-[#070907] p-3">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28ca41]" />
        </div>
        <div className="space-y-2">
          {asset.mockup.map((line, index) => (
            <div key={line} className="flex items-center gap-3 rounded border border-line/10 bg-white/[0.03] px-3 py-2">
              <span className="font-mono text-[0.65rem] text-[#ff8bd6]">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-mono text-xs text-muted">{line}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-md border border-line/10 bg-black/40 p-4">
      <div className="space-y-2">
        {asset.mockup.map((line) => (
          <div key={line} className="flex items-start gap-2 text-sm text-muted">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff8bd6]" />
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectStoryOverlay({ project, onClose }: ProjectStoryOverlayProps) {
  const leftNodes = project.graphNodes.slice(0, 3);
  const rightNodes = project.graphNodes.slice(3, 6);

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-canvas/92 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={`${project.name} project story`}>
      <div className="relative z-10 min-h-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-line/10 bg-[#070907] shadow-soft">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#39402d] bg-black/55 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-[#ff4fc3]/60 text-[#ff4fc3]">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff4fc3]">project.graph</div>
                <h3 className="text-lg font-semibold text-ink">{project.name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="border border-[#ff4fc3]/50 px-3 py-1 font-mono text-xs uppercase tracking-[0.16em] text-[#ff8bd6]">{project.status}</span>
              <Button variant="ghost" onClick={onClose} aria-label="Close project story" icon={<X className="h-4 w-4" />}>
                Close
              </Button>
            </div>
          </header>

          <section className="relative min-h-[34rem] overflow-hidden border-b border-[#39402d] bg-[#050805] px-4 py-10 sm:px-8">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(179,211,116,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(179,211,116,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 520" preserveAspectRatio="none" aria-hidden="true">
              <path d="M120 120 H470" stroke="#71805e" strokeWidth="2" fill="none" />
              <path d="M120 240 H470" stroke="#71805e" strokeWidth="2" fill="none" />
              <path d="M120 360 H470" stroke="#71805e" strokeWidth="2" fill="none" />
              <path d="M730 120 H1080" stroke="#71805e" strokeWidth="2" fill="none" />
              <path d="M730 240 H1080" stroke="#ff4fc3" strokeWidth="4" fill="none" />
              <path d="M730 360 H1080" stroke="#bede4a" strokeWidth="4" fill="none" />
              <path d="M470 240 C540 240 545 180 600 180 C655 180 660 240 730 240" stroke="#ff4fc3" strokeWidth="3" fill="none" />
              <path d="M470 360 C560 360 548 420 620 420 C690 420 665 360 730 360" stroke="#bede4a" strokeWidth="3" fill="none" />
            </svg>

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1.2fr_1fr]">
              <div className="space-y-5">
                {leftNodes.map((node, index) => {
                  const Icon = nodeIcons[index] || Server;
                  return (
                    <div key={node} className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center bg-[#71795b] text-white shadow-[0_0_30px_rgba(190,222,74,0.08)]">
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="border border-[#39402d] bg-black/50 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-[#b8c4a2]">{node}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-[#39402d] bg-black/78 shadow-[0_0_80px_rgba(255,79,195,0.08)]">
                <div className="border-b border-[#39402d] px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#bede4a]">project.query</div>
                <pre className="overflow-x-auto p-5 font-mono text-xs leading-6 text-[#cad6aa] sm:text-sm">
{`query ProjectStory {
  project(name: "${project.name}") {
    problem
    build
    architecture
    assets {
      vlog
      diagrams
      code
    }
  }
}`}
                </pre>
                <div className="border-t border-[#39402d] bg-[#0b0e09] p-5">
                  <p className="text-sm leading-7 text-muted">{project.description}</p>
                </div>
              </div>

              <div className="space-y-5 lg:justify-self-end">
                {rightNodes.map((node, index) => {
                  const Icon = nodeIcons[index + 3] || Workflow;
                  const highlighted = index > 0;
                  return (
                    <div key={node} className="flex items-center justify-end gap-4">
                      <span className={`border px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] ${highlighted ? "border-[#bede4a]/50 bg-[#406900] text-[#e1ff88]" : "border-[#39402d] bg-black/50 text-[#b8c4a2]"}`}>
                        {node}
                      </span>
                      <div className={`flex h-16 w-16 items-center justify-center text-white ${highlighted ? "bg-[#4c7a00]" : "bg-[#71795b]"}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-6 p-5 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
            <div className="space-y-4">
              {[
                ["Problem", project.story.problem],
                ["What I Built", project.story.build],
                ["Architecture", project.story.architecture],
                ["Challenges", project.story.challenges],
                ["Learnings", project.story.learnings],
              ].map(([title, body]) => (
                <article key={title} className="rounded-lg border border-line/10 bg-panel/70 p-5">
                  <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-[#ff8bd6]">{title}</h4>
                  <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
                </article>
              ))}
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-line/10 bg-panel/70 p-5">
                <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-lime">project vlog</h4>
                <div className="mt-5 space-y-3">
                  {project.story.vlog.map((item, index) => (
                    <div key={item} className="flex gap-3 font-mono text-sm text-muted">
                      <span className="text-lime">{String(index + 1).padStart(2, "0")}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {project.assets.map((asset) => {
                  const Icon = assetIcons[asset.type];
                  return (
                    <article key={asset.title} className="min-h-40 rounded-lg border border-line/10 bg-black/30 p-5 transition hover:border-[#ff4fc3]/40">
                      <div className="mb-4 flex items-center justify-between">
                        <Icon className="h-5 w-5 text-[#ff8bd6]" />
                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-dim">{asset.meta}</span>
                      </div>
                      <AssetMockup asset={asset} />
                      <h5 className="font-semibold text-ink">{asset.title}</h5>
                      <p className="mt-2 text-sm leading-6 text-muted">{asset.description}</p>
                      {asset.src ? (
                        <a href={asset.src} target="_blank" rel="noreferrer" className="mt-4 inline-flex font-mono text-xs text-lime hover:text-ink">
                          open asset
                        </a>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
