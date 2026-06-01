import { env } from "../lib/config";

export interface GitHubLanguage {
  name: string;
  size: number;
  color: string;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
}

export interface GitHubDashboardData {
  username: string;
  repositories: number;
  stars: number;
  followers: number;
  contributions: number;
  languages: GitHubLanguage[];
  contributionDays: GitHubContributionDay[];
}

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      login: string;
      followers: { totalCount: number };
      repositories: {
        totalCount: number;
        nodes: Array<{
          stargazerCount: number;
          languages: {
            edges: Array<{
              size: number;
              node: { name: string; color: string | null };
            }>;
          };
        }>;
      };
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number }> }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function fetchGitHubDashboard(): Promise<GitHubDashboardData> {
  if (!env.githubToken) {
    throw new Error("GitHub token missing. Add VITE_GITHUB_TOKEN to enable GraphQL metrics.");
  }

  const query = `
    query PortfolioDashboard($login: String!) {
      user(login: $login) {
        login
        followers { totalCount }
        repositories(first: 60, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: { field: UPDATED_AT, direction: DESC }) {
          totalCount
          nodes {
            stargazerCount
            languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node { name color }
              }
            }
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays { date contributionCount }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.githubToken}`,
    },
    body: JSON.stringify({ query, variables: { login: env.githubUsername } }),
  });

  if (!response.ok) throw new Error(`GitHub GraphQL returned ${response.status}`);
  const payload = (await response.json()) as GitHubGraphQLResponse;
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join(", "));
  const user = payload.data?.user;
  if (!user) throw new Error(`GitHub user "${env.githubUsername}" was not found.`);

  const languageMap = new Map<string, GitHubLanguage>();
  let stars = 0;
  user.repositories.nodes.forEach((repo) => {
    stars += repo.stargazerCount;
    repo.languages.edges.forEach((edge) => {
      const existing = languageMap.get(edge.node.name);
      languageMap.set(edge.node.name, {
        name: edge.node.name,
        color: edge.node.color || "#64748b",
        size: (existing?.size || 0) + edge.size,
      });
    });
  });

  return {
    username: user.login,
    repositories: user.repositories.totalCount,
    stars,
    followers: user.followers.totalCount,
    contributions: user.contributionsCollection.contributionCalendar.totalContributions,
    languages: Array.from(languageMap.values()).sort((a, b) => b.size - a.size).slice(0, 6),
    contributionDays: user.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })),
    ),
  };
}
