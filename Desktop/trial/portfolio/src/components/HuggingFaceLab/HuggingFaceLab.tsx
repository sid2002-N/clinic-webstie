import { Heart } from "lucide-react";
import { useAsync } from "../../hooks/useAsync";
import { compactNumber, formatDate } from "../../lib/format";
import { fetchHuggingFaceLab } from "../../services/huggingface";
import { Card } from "../ui/Card";
import { Section } from "../ui/Section";
import { StatusView } from "../ui/StatusView";

export function HuggingFaceLab() {
  const { data, loading, error } = useAsync(fetchHuggingFaceLab, []);

  return (
    <Section
      id="lab"
      label="hugging face · ai lab"
      title="AI & ML Work"
      copy="Models, Spaces, and datasets from the Hugging Face API when a username is configured."
    >
      {loading ? <StatusView status="loading" message="Connecting Hugging Face..." /> : null}
      {error ? <StatusView status="error" message={error} /> : null}
      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <Card key={`${item.type}-${item.id}`} className="reveal p-5 transition hover:-translate-y-1 hover:border-violet/40">
              <div className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-violet">{item.type}</div>
              <h3 className="break-words text-base font-semibold text-ink">{item.id}</h3>
              <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs text-dim">
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> {compactNumber(item.likes)}
                </span>
                {typeof item.downloads === "number" ? <span>downloads {compactNumber(item.downloads)}</span> : null}
                <span>{formatDate(item.updatedAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
