import { Cpu, GitBranch, RadioTower, Sparkles, TerminalSquare, Zap } from "lucide-react";
import { experience } from "../../data/experience";
import { Section } from "../ui/Section";

const nodeIcons = [Cpu, GitBranch, Sparkles];
const nodeOffsets = ["lg:mt-0", "lg:mt-28", "lg:mt-8"];

const statusTone = {
  cleared: "border-lime/60 bg-lime/15 text-lime shadow-[0_0_34px_rgba(190,222,74,0.18)]",
  active: "border-[#ff4fc3]/60 bg-[#ff4fc3]/15 text-[#ff8bd6] shadow-[0_0_34px_rgba(255,79,195,0.18)]",
  next: "border-line/20 bg-white/[0.04] text-muted",
};

function ExperienceCode() {
  return (
    <pre className="max-h-[24rem] overflow-auto p-4 font-mono text-xs leading-6 text-[#cad6aa] sm:text-sm">
{`local experience_map = {
  mode = "NORMAL",
  theme = "pcb_timeline",
  nodes = {
${experience
  .map((item) => `    { year = "${item.date}", zone = "${item.zone}", status = "${item.status}" },`)
  .join("\n")}
  }
}`}
    </pre>
  );
}

export function Workspace() {
  return (
    <Section
      id="workspace"
      label="neovim experience map"
      title="Experience Circuit"
      copy="The editor is now focused on one thing: experience. Each milestone is a circuit node in a small game-like progression map."
    >
      <div className="reveal overflow-hidden rounded-xl border border-line/10 bg-[#080b08] font-mono shadow-soft">
        <div className="flex items-center gap-3 bg-[#151a12] px-4 py-2 text-xs text-muted">
          <span className="rounded bg-lime px-2 py-0.5 font-semibold text-canvas">NORMAL</span>
          <span>experience.lua</span>
          <span className="ml-auto hidden text-dim sm:inline">PCB MAP · {experience.length} nodes</span>
        </div>

        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="border-b border-line/10 bg-black/30 lg:border-b-0 lg:border-r">
            <div className="border-b border-line/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-dim">buffer</div>
            <ExperienceCode />
          </div>

          <div className="relative min-h-[34rem] overflow-hidden bg-[#050805] p-4 pb-28 pt-20 sm:p-6 sm:pb-28 sm:pt-20">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(190,222,74,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(190,222,74,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 520" preserveAspectRatio="none" aria-hidden="true">
              <path d="M100 170 H245 C335 170 320 330 430 330 H500" stroke="#71805e" strokeWidth="3" fill="none" />
              <path d="M500 330 H565 C660 330 650 205 790 205" stroke="#ff4fc3" strokeWidth="4" fill="none" />
              <path d="M120 415 H360 C475 415 485 380 600 380 H820" stroke="#bede4a" strokeWidth="3" fill="none" opacity="0.5" />
              <path d="M205 100 V170" stroke="#71805e" strokeWidth="2" />
              <path d="M790 205 V120" stroke="#ff4fc3" strokeWidth="2" />
              <circle cx="100" cy="170" r="7" fill="#bede4a" />
              <circle cx="500" cy="330" r="7" fill="#bede4a" />
              <circle cx="790" cy="205" r="8" fill="#ff4fc3" />
            </svg>

            <div className="absolute right-4 top-4 z-10 flex items-center gap-2 border border-line/10 bg-black/50 px-3 py-2 text-[0.68rem] uppercase tracking-[0.16em] text-dim">
              <RadioTower className="h-4 w-4 text-lime" />
              career signal online
            </div>

            <div className="relative z-10 grid gap-5 lg:grid-cols-3 lg:items-start">
              {experience.map((item, index) => {
                const Icon = nodeIcons[index] || Zap;
                return (
                  <article
                    key={item.title}
                    className={`rounded-xl border p-4 backdrop-blur-md transition hover:-translate-y-1 ${nodeOffsets[index] || ""} ${statusTone[item.status]}`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center border border-current bg-black/35">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em]">{item.status}</span>
                    </div>
                    <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-current/70">
                      {item.date} · {item.zone}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-muted">{item.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.unlocks.map((unlock) => (
                        <span key={unlock} className="border border-line/10 bg-black/35 px-2 py-1 text-[0.62rem] text-muted">
                          {unlock}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 border border-line/10 bg-black/60 px-4 py-3 text-xs text-muted">
              <span className="flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-lime" />
                :ExperienceMap --mode=career
              </span>
              <span className="text-dim">cleared nodes glow lime · active node routes magenta</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
