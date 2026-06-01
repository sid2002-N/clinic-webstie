import { Github } from "lucide-react";
import { fetchGitHubDashboard } from "../../services/github";
import { useAsync } from "../../hooks/useAsync";
import { compactNumber } from "../../lib/format";
import { Card } from "../ui/Card";
import { Section } from "../ui/Section";
import { StatusView } from "../ui/StatusView";

const levelClass = (count: number) => {
  if (count > 9) return "bg-lime/90";
  if (count > 5) return "bg-lime/60";
  if (count > 1) return "bg-lime/30";
  return "bg-elevated";
};

export function GithubDashboard() {
  const { data, loading, error } = useAsync(fetchGitHubDashboard, []);
  const totalLanguageSize = data?.languages.reduce((sum, item) => sum + item.size, 0) || 0;

  return (
    <Section
      id="github"
      label="live dashboard"
      title="GitHub Engineering Metrics"
      copy="Pulled from the GitHub GraphQL API when a token is configured. The interface shows configuration and request states instead of placeholder metrics."
    >
      {loading ? <StatusView status="loading" message="Syncing GitHub GraphQL..." /> : null}
      {error ? <StatusView status="error" message={error} /> : null}
      {data ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Repositories", data.repositories, "public"],
              ["Stars", data.stars, "earned"],
              ["Followers", data.followers, `@${data.username}`],
              ["Contributions", data.contributions, "this year"],
            ].map(([label, value, sub]) => (
              <Card key={label} className="reveal p-5 transition hover:-translate-y-1 hover:border-line/20">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-dim">{label}</p>
                  <Github className="h-4 w-4 text-blue" />
                </div>
                <div className="font-mono text-3xl font-bold text-ink">{compactNumber(Number(value))}</div>
                <div className="mt-1 text-xs text-muted">{sub}</div>
              </Card>
            ))}
          </div>

          <Card className="reveal p-5">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-dim">Contribution Activity</div>
            <div className="flex max-w-full gap-1 overflow-hidden" aria-label="GitHub contribution chart">
              {data.contributionDays.slice(-196).map((day) => (
                <div key={day.date} title={`${day.date}: ${day.count} contributions`} className={`h-3 w-3 shrink-0 rounded-[2px] ${levelClass(day.count)}`} />
              ))}
            </div>
          </Card>

          <Card className="reveal p-5">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-dim">Languages</div>
            <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-elevated">
              {data.languages.map((language) => (
                <div
                  key={language.name}
                  style={{ width: `${(language.size / totalLanguageSize) * 100}%`, backgroundColor: language.color }}
                  title={language.name}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {data.languages.map((language) => (
                <span key={language.name} className="flex items-center gap-2 font-mono text-xs text-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: language.color }} />
                  {language.name}
                </span>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </Section>
  );
}
