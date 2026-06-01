import { env } from "../lib/config";

export interface ProfileLink {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  email: string;
  bio: string;
  photoUrl: string;
  interests: string[];
  stack: string[];
  links: ProfileLink[];
}

export const profile: Profile = {
  name: "Siddharth P Santhosh",
  role: "Software Engineer · Builder · Open Source Contributor",
  location: "India",
  email: env.contactEmail,
  photoUrl: env.profileImage,
  bio: "I build practical engineering systems across AI tooling, developer workflows, and full-stack products.",
  interests: ["AI & ML", "Systems Design", "Open Source", "Cybersecurity"],
  stack: ["Python", "TypeScript", "React", "FastAPI", "Docker", "PyTorch", "TailwindCSS", "PostgreSQL"],
  links: [
    { label: "GitHub", href: `https://github.com/${env.githubUsername}` },
    { label: "Hugging Face", href: env.huggingFaceUsername ? `https://huggingface.co/${env.huggingFaceUsername}` : "https://huggingface.co" },
    { label: "PyPI", href: "https://pypi.org" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
};
