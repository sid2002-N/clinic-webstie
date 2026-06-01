export interface SkillGroup {
  name: string;
  file: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    name: "backend",
    file: "services.py",
    items: ["Python", "FastAPI", "REST APIs", "PostgreSQL", "Redis"],
  },
  {
    name: "frontend",
    file: "interface.tsx",
    items: ["React", "TypeScript", "TailwindCSS", "Vite", "Accessibility"],
  },
  {
    name: "ai_ml",
    file: "lab.ipynb",
    items: ["PyTorch", "Hugging Face", "RAG", "Embeddings", "Model evaluation"],
  },
  {
    name: "devops",
    file: "pipeline.yml",
    items: ["Docker", "GitHub Actions", "Linux", "Monitoring", "Deployment"],
  },
  {
    name: "security",
    file: "threat-model.md",
    items: ["Web security", "OSINT basics", "Network analysis", "Secure API design"],
  },
  {
    name: "workflow",
    file: "init.lua",
    items: ["Neovim", "tmux", "Git", "Shell scripting", "Documentation"],
  },
];
