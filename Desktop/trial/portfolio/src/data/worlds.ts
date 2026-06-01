import { Camera, Code2, FlaskConical, Lightbulb, Mic2, Telescope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface WorldLink {
  title: string;
  description: string;
  href: string;
  status: "live" | "coming-soon" | "draft";
  accent: "lime" | "blue" | "cyan" | "violet" | "amber";
  icon: LucideIcon;
}

export const worldLinks: WorldLink[] = [
  {
    title: "Developer Portfolio",
    description: "The engineering workstation, open-source projects, dashboards, and build logs.",
    href: "/",
    status: "live",
    accent: "lime",
    icon: Code2,
  },
  {
    title: "Astrophotography Portfolio",
    description: "A future gallery for night-sky captures, gear notes, edits, and field stories.",
    href: "#astrophotography-coming-soon",
    status: "coming-soon",
    accent: "cyan",
    icon: Telescope,
  },
  {
    title: "Science Notes",
    description: "Short essays and explainers on physics, space, computing, and strange questions.",
    href: "#science-notes",
    status: "draft",
    accent: "blue",
    icon: FlaskConical,
  },
  {
    title: "Talks & Curiosity Logs",
    description: "Ideas for talks, conversations, and public learning experiments.",
    href: "#talks",
    status: "draft",
    accent: "violet",
    icon: Mic2,
  },
  {
    title: "Product Ideas",
    description: "Small tools, half-built concepts, sketches, and experiments worth revisiting.",
    href: "#ideas",
    status: "draft",
    accent: "amber",
    icon: Lightbulb,
  },
  {
    title: "Image Experiments",
    description: "Processing workflows for sky images, textures, and visual computing studies.",
    href: "#image-experiments",
    status: "draft",
    accent: "cyan",
    icon: Camera,
  },
];
