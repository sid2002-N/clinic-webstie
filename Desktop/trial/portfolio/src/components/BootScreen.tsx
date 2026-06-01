import anime from "animejs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";

const bootSteps = [
  "Initializing Portfolio...",
  "Loading Engineering Dashboard...",
  "Syncing GitHub Activity...",
  "Connecting Hugging Face...",
  "Loading Open Source Projects...",
  "Preparing Workspace...",
  "Ready.",
];

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const completed = useRef(false);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    anime({
      targets: rootRef.current,
      opacity: [1, 0],
      translateY: [0, -18],
      scale: [1, 0.985],
      duration: 520,
      easing: "easeInOutQuad",
      complete: () => {
        setMounted(false);
        onComplete();
      },
    });
  }, [onComplete]);

  useEffect(() => {
    anime({
      targets: ".boot-card",
      opacity: [0, 1],
      translateY: [18, 0],
      scale: [0.98, 1],
      duration: 680,
      easing: "easeOutExpo",
    });

    const timers = bootSteps.map((_, index) =>
      window.setTimeout(() => {
        setActiveStep(index);
        anime({
          targets: `.boot-step-${index}`,
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 260,
          easing: "easeOutQuad",
        });
      }, 180 + index * 310),
    );

    const finishTimer = window.setTimeout(finish, 2450);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finishTimer);
    };
  }, [finish]);

  const progress = Math.min(100, ((activeStep + 1) / bootSteps.length) * 100);

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[9000] flex items-center justify-center overflow-hidden bg-canvas px-5">
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/10 blur-3xl" />
      <div className="boot-card relative w-full max-w-2xl opacity-0">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-blue">Engineer Workstation</p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              Siddharth Portfolio
            </h1>
          </div>
          <Button variant="ghost" onClick={finish} aria-label="Skip loading screen">
            Skip
          </Button>
        </div>

        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-line/10 px-5 py-4">
            <div className="terminal-dots" aria-hidden="true">
              <span className="terminal-dot bg-[#ff5f57]" />
              <span className="terminal-dot bg-[#ffbd2e]" />
              <span className="terminal-dot bg-[#28ca41]" />
            </div>
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-dim">startup.sequence</span>
          </div>
          <div className="space-y-3 px-5 py-5">
            {bootSteps.map((step, index) => {
              const complete = index < activeStep || activeStep === bootSteps.length - 1;
              const current = index === activeStep;
              return (
                <div
                  key={step}
                  className={`boot-step-${index} flex items-center justify-between opacity-0 font-mono text-sm ${
                    current ? "text-ink" : complete ? "text-lime" : "text-dim"
                  }`}
                >
                  <span>{step}</span>
                  <span className={current && !complete ? "h-2 w-2 rounded-full bg-blue animate-pulse" : ""}>
                    {complete ? "done" : current ? "" : "queued"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-1 bg-elevated">
            <div className="h-full bg-gradient-to-r from-blue via-cyan to-lime transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
