export interface ExperienceItem {
  date: string;
  title: string;
  description: string;
  zone: string;
  status: "cleared" | "active" | "next";
  unlocks: string[];
}

export const experience: ExperienceItem[] = [
  {
    date: "2024",
    title: "Computer Science foundations",
    description: "Focused on software engineering fundamentals, systems thinking, and practical AI projects.",
    zone: "Foundation Node",
    status: "cleared",
    unlocks: ["Algorithms", "Python", "Systems thinking"],
  },
  {
    date: "2025",
    title: "Open source and Python packaging",
    description: "Published and maintained Python tooling while learning production packaging and release workflows.",
    zone: "Open Source Relay",
    status: "cleared",
    unlocks: ["PyPI releases", "CLI tooling", "Versioning"],
  },
  {
    date: "2026",
    title: "AI and developer tools",
    description: "Building interfaces, service layers, and experiments around AI workflows and engineering productivity.",
    zone: "AI Tools Core",
    status: "active",
    unlocks: ["React systems", "AI workflows", "Live dashboards"],
  },
];
