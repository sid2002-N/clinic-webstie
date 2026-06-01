import { motion } from "framer-motion";
import { ArrowRight, GitBranch } from "lucide-react";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { buildSuperellipsePath } from "../../lib/superellipse";
import { WorldTransition } from "./WorldTransition";

function goToWorlds() {
  window.history.pushState({}, "", "/worlds");
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

export function WorldRibbon() {
  const [transitioning, setTransitioning] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [light, setLight] = useState({ x: 72, y: 32 });
  const clipId = `world-ribbon-${useId().replace(/:/g, "")}`;
  const shapePath = useMemo(() => buildSuperellipsePath(4.8), []);

  const openWorlds = useCallback(() => {
    setTransitioning(true);
  }, []);

  const finish = useCallback(() => {
    setTransitioning(false);
    goToWorlds();
  }, []);

  const updateLight = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setLight({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  useEffect(() => {
    document.body.classList.toggle("side-quest-peek", hovered);
    return () => document.body.classList.remove("side-quest-peek");
  }, [hovered]);

  return (
    <>
      <section className="side-quest-section relative min-h-[23rem] overflow-hidden border-t border-line/10 py-10">
        <motion.div
          className="absolute inset-0 grid-bg opacity-45"
          animate={{ x: hovered ? -10 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 24, mass: 0.9 }}
          aria-hidden="true"
        />
        <div className="relative mx-auto h-[18rem] max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.button
            type="button"
            onClick={openWorlds}
            onPointerMove={updateLight}
            onPointerLeave={() => setLight({ x: 72, y: 32 })}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            animate={{ x: hovered ? "-5rem" : 0 }}
            whileHover={{ y: -3, scale: 1.008 }}
            transition={{ type: "spring", stiffness: 180, damping: 20, mass: 0.7 }}
            className="group absolute bottom-14 right-[-4.75rem] h-[8.25rem] w-[25rem] text-left outline-none focus-visible:ring-2 focus-visible:ring-lime/60 sm:right-[-5rem] sm:h-[8.75rem] sm:w-[30rem]"
            aria-label="Click to know more about me"
          >
            <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
              <defs>
                <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                  <path d={shapePath} />
                </clipPath>
              </defs>
            </svg>
            <svg className="pointer-events-none absolute inset-0 overflow-hidden" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
              <path d={shapePath} fill="rgb(9 12 9)" fillOpacity="0.9" stroke="rgb(var(--color-lime))" strokeOpacity="0.34" strokeWidth="0.004" />
            </svg>
            <span
              className="relative block h-full overflow-hidden bg-[linear-gradient(145deg,rgb(13_17_13/0.94),rgb(5_8_6/0.96))] px-6 py-5 sm:px-7"
              style={{ clipPath: `url(#${clipId})` }}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at ${light.x}% ${light.y}%, rgb(var(--color-lime) / 0.14), transparent 36%)`,
                }}
                aria-hidden="true"
              />
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
                <path d={shapePath} fill="none" stroke="rgb(var(--color-lime))" strokeOpacity="0.2" strokeWidth="0.0025" />
                <path d={shapePath} fill="url(#world-ribbon-shine)" opacity="0.58" />
                <defs>
                  <linearGradient id="world-ribbon-shine" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="36%" stopColor="white" stopOpacity="0" />
                    <stop offset="62%" stopColor="white" stopOpacity="0.035" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="relative z-10 grid h-full grid-cols-[auto_1fr_auto] items-center gap-4 pr-2 sm:gap-5 sm:pr-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-lime/25 bg-lime/10 text-lime sm:h-11 sm:w-11">
                  <GitBranch className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[0.66rem] uppercase tracking-[0.22em] text-lime">side quest</span>
                  <span className="mt-3 block whitespace-nowrap font-sans text-xl font-semibold leading-tight text-ink sm:mt-4 sm:text-2xl">Open Side Quest</span>
                  <span className="mt-2 block max-w-[17rem] text-xs leading-5 text-muted sm:mt-3 sm:max-w-[18rem] sm:text-sm sm:leading-6">Field notes, sky work, science trails, and unfinished systems.</span>
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime/20 bg-canvas/55 text-lime transition group-hover:border-lime/40 group-hover:bg-lime/10 sm:h-12 sm:w-12">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </span>
            </span>
          </motion.button>
        </div>
      </section>
      <WorldTransition active={transitioning} onComplete={finish} onSkip={finish} />
    </>
  );
}
