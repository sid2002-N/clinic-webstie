export interface EcosystemProject {
  key: string;
  index: number;
  class: string;
  accent: string;
  pulseIds: string[];
  label: string;
  x: number;
  y: number;
}

export const cardProjects: EcosystemProject[] = [
  {
    key: "card1",
    index: 0, // Maps to RVMN
    class: "card1",
    accent: "#bede4a", // Portfolio lime
    pulseIds: ["#pulse-rvmn-workspace"],
    label: "P-01",
    x: 15 + 196.5,
    y: 30
  },
  {
    key: "card2",
    index: 1, // Maps to Workspace
    class: "card2",
    accent: "#06b6d4", // Portfolio cyan
    pulseIds: ["#pulse-rvmn-workspace", "#pulse-workspace-datahub", "#pulse-workspace-authcore"],
    label: "P-02",
    x: 15 + 393 + 196.5,
    y: 30
  },
  {
    key: "card3",
    index: 2, // Maps to Data Hub (corresponds to neural-search or astronomy logs in the projects database)
    class: "card3",
    accent: "#8b5cf6", // Portfolio violet
    pulseIds: ["#pulse-workspace-datahub"],
    label: "P-03",
    x: 15,
    y: 30 + 288
  },
  {
    key: "card4",
    index: 3, // Maps to Auth Core
    class: "card4",
    accent: "#f59e0b", // Portfolio amber
    pulseIds: ["#pulse-workspace-authcore", "#pulse-authcore-launcher"],
    label: "P-04",
    x: 15 + 393,
    y: 30 + 288
  },
  {
    key: "card5",
    index: 4, // Maps to Launcher
    class: "card5",
    accent: "#ff4fc3", // Portfolio pink
    pulseIds: ["#pulse-authcore-launcher"],
    label: "P-05",
    x: 15 + 2 * 393,
    y: 30 + 288
  }
];
