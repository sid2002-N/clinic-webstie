import React, { Suspense, useEffect, useState, useRef } from "react";
import type { Project } from "../../data/projects";
import { projects } from "../../data/projects";
import { ProjectStoryOverlay } from "./ProjectStoryOverlay";

const ProjectEcosystem = React.lazy(() => import("../../features/ecosystem/ProjectEcosystem"));

export function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeProject) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveProject(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeProject]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" } // Preload 250px before entering viewport
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="scroll-mt-20 relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-12 text-center lg:text-left">
        <span className="mb-3 flex items-center justify-center lg:justify-start gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-lime">
          // WORK WORKSTATION · PROJECTS
        </span>
        <h2 className="max-w-3xl font-sans text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Project Ecosystem
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          A collection of systems, libraries, and tools built to solve specific engineering problems. Scroll to assemble the workstation, and click any card to inspect the detailed architecture.
        </p>
      </div>

      {shouldLoad ? (
        <Suspense fallback={
          <div className="min-h-[40rem] flex items-center justify-center border border-line/10 bg-panel/85 rounded-xl text-dim font-mono text-xs uppercase tracking-widest shadow-soft">
            LOADING ECOSYSTEM SYSTEM...
          </div>
        }>
          <ProjectEcosystem projects={projects} onProjectSelect={setActiveProject} />
        </Suspense>
      ) : (
        <div className="min-h-[40rem] flex items-center justify-center border border-line/10 bg-panel/85 rounded-xl text-dim font-mono text-xs uppercase tracking-widest shadow-soft">
          SYSTEM ON STANDBY
        </div>
      )}

      {activeProject ? <ProjectStoryOverlay project={activeProject} onClose={() => setActiveProject(null)} /> : null}
    </section>
  );
}
