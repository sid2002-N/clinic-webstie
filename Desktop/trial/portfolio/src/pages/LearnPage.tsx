import { LearnWithMe } from "../components/LearnWithMe/LearnWithMe";
import { useReveal } from "../hooks/useReveal";

export function LearnPage() {
  useReveal();

  return <LearnWithMe />;
}
