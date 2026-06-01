import { useEffect, useState } from "react";
import { Github, ExternalLink, BookOpen, Package } from "lucide-react";
import type { Project } from "../../data/projects";
import { projects } from "../../data/projects";
import { Card } from "../ui/Card";
import { Section } from "../ui/Section";
import { ProjectStoryOverlay } from "./ProjectStoryOverlay";

const projectThemes = [
  {
    accent: "text-lime",
    hoverBorder: "hover:border-lime/40",
    hoverShadow: "hover:shadow-[0_0_24px_rgba(190,222,74,0.06)]",
  },
  {
    accent: "text-blue",
    hoverBorder: "hover:border-blue/40",
    hoverShadow: "hover:shadow-[0_0_24px_rgba(6,182,212,0.06)]",
  },
  {
    accent: "text-violet",
    hoverBorder: "hover:border-violet/40",
    hoverShadow: "hover:shadow-[0_0_24px_rgba(139,92,246,0.06)]",
  },
  {
    accent: "text-amber",
    hoverBorder: "hover:border-amber/40",
    hoverShadow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.06)]",
  },
  {
    accent: "text-[#ff4fc3]",
    hoverBorder: "hover:border-[#ff4fc3]/40",
    hoverShadow: "hover:shadow-[0_0_24px_rgba(255,79,195,0.06)]",
  },
];

export function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

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

  return (
    <Section
      id="projects"
      label="work workstation · projects"
      title="Project Ecosystem"
      copy="A collection of systems, libraries, and tools built to solve specific engineering problems. Click any card to inspect the detailed architecture and learnings."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => {
          const theme = projectThemes[index % projectThemes.length];
          return (
            <Card
              key={project.name}
              as="article"
              className={`reveal p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${theme.hoverBorder} ${theme.hoverShadow} cursor-pointer`}
              onClick={() => setActiveProject(project)}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className={`font-mono text-[0.68rem] uppercase tracking-[0.16em] ${theme.accent}`}>
                  {project.status}
                </span>
                <span className="font-mono text-[0.68rem] text-dim">{project.year}</span>
              </div>
              <h3 className="text-lg font-semibold text-ink uppercase tracking-wide mb-2">
                {project.name}
              </h3>
              <p className="text-xs leading-6 text-muted mb-6 flex-1 min-h-[4rem]">
                {project.description}
              </p>
              
              {/* Stack Badges */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {project.stack.map((tech) => (
                  <span key={tech} className="border border-line/10 bg-black/35 px-2 py-0.5 rounded font-mono text-[0.62rem] text-muted">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Project Links */}
              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-line/5 text-dim font-mono text-[0.68rem]">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-ink transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="h-3.5 w-3.5" /> code
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-ink transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> live
                  </a>
                )}
                {project.links.docs && (
                  <a
                    href={project.links.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-ink transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BookOpen className="h-3.5 w-3.5" /> docs
                  </a>
                )}
                {project.links.package && (
                  <a
                    href={project.links.package}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-ink transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Package className="h-3.5 w-3.5" /> package
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      {activeProject ? <ProjectStoryOverlay project={activeProject} onClose={() => setActiveProject(null)} /> : null}
    </Section>
  );
}
