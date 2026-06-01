export interface PypiPackage {
  name: string;
  version: string;
  summary: string;
  projectUrl: string;
  releaseDate?: string;
}

interface PypiResponse {
  info: {
    name: string;
    version: string;
    summary: string;
    project_url: string;
  };
  releases: Record<string, Array<{ upload_time_iso_8601: string }>>;
}

export async function fetchPypiPackage(name: string): Promise<PypiPackage> {
  const response = await fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`);
  if (!response.ok) throw new Error(`PyPI package "${name}" returned ${response.status}`);
  const payload = (await response.json()) as PypiResponse;
  const latest = payload.releases[payload.info.version]?.[0]?.upload_time_iso_8601;

  return {
    name: payload.info.name,
    version: payload.info.version,
    summary: payload.info.summary,
    projectUrl: payload.info.project_url,
    releaseDate: latest,
  };
}

export async function fetchPypiPackages(names: string[]): Promise<PypiPackage[]> {
  return Promise.all(names.map(fetchPypiPackage));
}
