import { Contact } from "../components/Contact/Contact";
import { GithubDashboard } from "../components/GithubDashboard/GithubDashboard";
import { Hero } from "../components/Hero/Hero";
import { HuggingFaceLab } from "../components/HuggingFaceLab/HuggingFaceLab";
import { Projects } from "../components/Projects/Projects";
import { PypiDashboard } from "../components/PypiDashboard/PypiDashboard";
import { Workspace } from "../components/Workspace/Workspace";
import { useReveal } from "../hooks/useReveal";

export function HomePage() {
  useReveal();

  return (
    <>
      <Hero />
      <GithubDashboard />
      <Workspace />
      <Projects />
      <HuggingFaceLab />
      <PypiDashboard />
      <Contact />
    </>
  );
}
