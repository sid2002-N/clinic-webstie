import { Package } from "lucide-react";
import { env } from "../../lib/config";
import { formatDate } from "../../lib/format";
import { fetchPypiPackages } from "../../services/pypi";
import { useAsync } from "../../hooks/useAsync";
import { Card } from "../ui/Card";
import { Section } from "../ui/Section";
import { StatusView } from "../ui/StatusView";

export function PypiDashboard() {
  const { data, loading, error } = useAsync(() => fetchPypiPackages(env.pypiPackages), [env.pypiPackages.join(",")]);

  return (
    <Section
      id="pypi"
      label="pypi · packages"
      title="Open Source Libraries"
      copy="Package metadata is fetched from PyPI. Download totals are intentionally omitted because PyPI does not expose reliable totals in this endpoint."
    >
      {loading ? <StatusView status="loading" message="Fetching PyPI package metadata..." /> : null}
      {error ? <StatusView status="error" message={error} /> : null}
      {data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((pkg) => (
            <Card key={pkg.name} className="reveal p-6 transition hover:-translate-y-1 hover:border-amber/40">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-mono text-xl font-bold text-amber">{pkg.name}</h3>
                  <p className="mt-1 font-mono text-xs text-dim">v{pkg.version}</p>
                </div>
                <Package className="h-5 w-5 text-amber" />
              </div>
              <p className="text-sm leading-7 text-muted">{pkg.summary || "No package summary provided."}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-dim">
                <span>Released {formatDate(pkg.releaseDate)}</span>
                <a href={pkg.projectUrl} target="_blank" rel="noreferrer" className="text-amber transition hover:text-ink">
                  View on PyPI
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
