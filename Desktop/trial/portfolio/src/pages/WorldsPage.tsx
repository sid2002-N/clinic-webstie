import { ArrowUpRight, Orbit, Sparkles } from "lucide-react";
import { worldLinks } from "../data/worlds";

const accentClasses = {
  lime: "border-emerald-200 text-emerald-700 shadow-[0_18px_45px_rgb(16_185_129/0.12)]",
  blue: "border-sky-200 text-sky-700 shadow-[0_18px_45px_rgb(14_165_233/0.12)]",
  cyan: "border-cyan-200 text-cyan-700 shadow-[0_18px_45px_rgb(6_182_212/0.12)]",
  violet: "border-violet-200 text-violet-700 shadow-[0_18px_45px_rgb(139_92_246/0.12)]",
  amber: "border-amber-200 text-amber-700 shadow-[0_18px_45px_rgb(245_158_11/0.12)]",
} as const;

const formulas = ["E = mc²", "F = ma", "∇ · B = 0", "λ = h / p", "a² + b² = c²", "ψ(x, t)", "PV = nRT", "Δv = ve ln(m0 / mf)"];

export function WorldsPage() {
  const scrollingItems = [...worldLinks, ...worldLinks];

  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden world-space-bg">
      <div className="absolute left-[48%] top-20 h-36 w-36 rounded-full border border-cyan-200 bg-cyan-100/40 shadow-[0_0_80px_rgb(6_182_212/0.18)]" aria-hidden="true" />
      <div className="absolute right-12 top-32 h-52 w-52 rounded-full border border-violet-200 bg-violet-100/40 shadow-[0_0_110px_rgb(139_92_246/0.16)]" aria-hidden="true" />
      <div className="absolute bottom-10 right-[18%] h-24 w-24 rounded-full border border-amber-200 bg-amber-100/50 shadow-[0_0_80px_rgb(245_158_11/0.12)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {formulas.map((formula, index) => (
          <span
            key={formula}
            className="world-formula absolute font-serif text-2xl italic text-slate-400/35 sm:text-3xl"
            style={{
              left: `${8 + ((index * 17) % 82)}%`,
              top: `${10 + ((index * 23) % 74)}%`,
              animationDelay: `${index * -2.7}s`,
            }}
          >
            {formula}
          </span>
        ))}
      </div>

      <div className="relative z-10 grid min-h-[calc(100vh-3.5rem)] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[22rem_1fr] lg:px-8">
        <aside className="relative overflow-hidden rounded-lg border border-slate-200 bg-white/78 p-3 text-slate-950 shadow-[0_24px_80px_rgb(15_23_42/0.12)] backdrop-blur-xl lg:h-[calc(100vh-8.5rem)]">
          <div className="mb-4 flex items-center justify-between px-2 pt-1">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-emerald-700">world index</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Things I am building</h2>
            </div>
            <Orbit className="h-5 w-5 text-cyan-700" />
          </div>
          <div className="world-scroll h-[32rem] overflow-hidden lg:h-[calc(100%-4rem)]">
            <div className="world-scroll-track space-y-3">
              {scrollingItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={`${item.title}-${index}`}
                    href={item.href}
                    className={`block rounded-lg border bg-white/82 p-4 transition hover:-translate-y-0.5 hover:bg-white ${accentClasses[item.accent]}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-md border border-current/20 bg-current/10 p-2">
                        <Icon className="h-4 w-4" />
                      </span>
                      <ArrowUpRight className="h-4 w-4 opacity-55" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{item.description}</p>
                    <span className="mt-4 inline-flex rounded-full border border-current/20 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em]">
                      {item.status.replace("-", " ")}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex min-h-[34rem] items-center">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              empty page shell
            </div>
            <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-[0.96] text-slate-950 sm:text-7xl">
              A wider map for the nerdy parts.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              This page is intentionally open for now. It will become the place where developer work, astrophotography,
              science talks, visual experiments, and product ideas can live beside each other without fighting for space.
            </p>
            <div className="mt-10 grid gap-3 font-mono text-xs uppercase tracking-[0.16em] text-slate-500 sm:grid-cols-3">
              <span className="rounded-lg border border-slate-200 bg-white/65 p-4 shadow-sm">planets</span>
              <span className="rounded-lg border border-slate-200 bg-white/65 p-4 shadow-sm">formulae</span>
              <span className="rounded-lg border border-slate-200 bg-white/65 p-4 shadow-sm">branches</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
