import { experience } from "./experience";
import { profile } from "./profile";
import { projects } from "./projects";
import { skills } from "./skills";

export type WorkspaceFileKey = "about" | "skills" | "projects" | "experience" | "contact";

export interface WorkspaceFile {
  key: WorkspaceFileKey;
  name: string;
  language: string;
  lines: string[];
}

export const workspaceFiles: WorkspaceFile[] = [
  {
    key: "about",
    name: "about.md",
    language: "markdown",
    lines: [
      "# about.md",
      "",
      `## ${profile.name}`,
      profile.role,
      "",
      "### Bio",
      profile.bio,
      "",
      "### Currently",
      "-> Building AI and developer tooling",
      "-> Maintaining practical open-source experiments",
      "-> Designing workstation-inspired interfaces",
    ],
  },
  {
    key: "skills",
    name: "skills.ts",
    language: "typescript",
    lines: [
      "export const skills = [",
      ...skills.map((skill) => `  "${skill.name}:${skill.file}",`),
      "];",
    ],
  },
  {
    key: "projects",
    name: "projects.json",
    language: "json",
    lines: JSON.stringify(
      projects.map(({ name, status, stack }) => ({ name, status, stack })),
      null,
      2,
    ).split("\n"),
  },
  {
    key: "experience",
    name: "experience.yaml",
    language: "yaml",
    lines: experience.flatMap((item) => [`- date: ${item.date}`, `  title: ${item.title}`, `  description: ${item.description}`]),
  },
  {
    key: "contact",
    name: "contact.sh",
    language: "shell",
    lines: ["#!/bin/bash", `EMAIL="${profile.email}"`, `LOCATION="${profile.location}"`, "echo \"Ready to build.\""],
  },
];
