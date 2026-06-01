import anime from "animejs";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface WorldTransitionProps {
  active: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const statusLines = ["unfurling ribbon", "mapping interests", "connecting code, science, and sky", "ready"];

export function WorldTransition({ active, onComplete, onSkip }: WorldTransitionProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !shellRef.current) {
      return undefined;
    }

    const root = shellRef.current;
    const timeline = anime.timeline({
      easing: "easeOutCubic",
      complete: onComplete,
    });

    timeline
      .add({
        targets: root,
        opacity: [0, 1],
        duration: 220,
      })
      .add(
        {
          targets: root.querySelectorAll(".world-ribbon-line"),
          strokeDashoffset: [anime.setDashoffset, 0],
          delay: anime.stagger(110),
          duration: 1050,
        },
        80,
      )
      .add(
        {
          targets: root.querySelectorAll(".world-node"),
          opacity: [0, 1],
          scale: [0.72, 1],
          delay: anime.stagger(95),
          duration: 520,
        },
        380,
      )
      .add(
        {
          targets: root.querySelector(".world-progress"),
          width: ["0%", "100%"],
          duration: 1500,
        },
        160,
      )
      .add(
        {
          targets: root.querySelectorAll(".world-status"),
          opacity: [0, 1, 0],
          translateY: [8, 0, -8],
          delay: anime.stagger(260),
          duration: 760,
        },
        210,
      )
      .add({
        targets: root,
        opacity: [1, 0],
        translateY: [0, -14],
        duration: 360,
      });

    return () => {
      timeline.pause();
    };
  }, [active, onComplete]);

  if (!active) {
    return null;
  }

  return (
    <div
      ref={shellRef}
      className="fixed inset-0 z-[100000] flex items-center justify-center overflow-hidden bg-white/96 opacity-0 backdrop-blur-2xl"
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 world-space-bg opacity-90" aria-hidden="true" />
      <button
        type="button"
        onClick={onSkip}
        className="absolute right-5 top-5 z-10 rounded-full border border-slate-200 bg-white/70 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-slate-500 shadow-sm transition hover:border-emerald-300 hover:text-slate-950"
      >
        skip
      </button>
      <div className="relative w-full max-w-4xl px-5">
        <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_20px_rgb(16_185_129/0.55)]" />
          expanding worlds
        </div>
        <svg className="h-56 w-full overflow-visible" viewBox="0 0 900 260" fill="none" aria-hidden="true">
          <path className="world-ribbon-line" d="M0 130 C120 130 150 130 250 130 C360 130 390 62 500 62 C610 62 660 36 780 24" stroke="rgb(var(--color-lime))" strokeWidth="3" strokeLinecap="round" />
          <path className="world-ribbon-line" d="M250 130 C380 130 414 130 528 130 C650 130 700 132 900 132" stroke="rgb(var(--color-cyan))" strokeWidth="3" strokeLinecap="round" />
          <path className="world-ribbon-line" d="M250 130 C360 130 402 198 518 198 C626 198 690 228 832 242" stroke="rgb(var(--color-violet))" strokeWidth="3" strokeLinecap="round" />
          <path className="world-ribbon-line" d="M504 62 C530 96 570 108 628 130" stroke="rgb(var(--color-blue))" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path className="world-ribbon-line" d="M518 198 C548 166 580 148 628 130" stroke="rgb(var(--color-amber))" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          {[250, 500, 628, 780, 832].map((cx, index) => (
            <circle
              key={cx}
              className="world-node opacity-0"
              cx={cx}
              cy={[130, 62, 130, 24, 242][index]}
              r={index === 0 ? 8 : 6}
              fill="rgb(15 23 42)"
            />
          ))}
        </svg>
        <div className="grid gap-8 md:grid-cols-[1fr_18rem] md:items-end">
          <div>
            <h2 className="font-sans text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">Opening the wider map.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Code stays at the center, but the branches reach into astrophotography, science notes, talks, and experiments.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white/72 p-4 shadow-[0_20px_60px_rgb(15_23_42/0.12)]">
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-slate-200">
              <div className="world-progress h-full w-0 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500" />
            </div>
            <div className="relative h-7 overflow-hidden font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
              {statusLines.map((line) => (
                <span key={line} className="world-status absolute inset-x-0 top-1 opacity-0">
                  <ChevronRight className="mr-1 inline h-3 w-3 text-emerald-600" />
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
