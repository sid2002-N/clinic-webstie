export type ProjectStatus = "online" | "beta" | "research" | "maintained";
export type ProjectAssetType = "video" | "image" | "diagram" | "code" | "doc";

export interface ProjectAsset {
  type: ProjectAssetType;
  title: string;
  description: string;
  src?: string;
  mockup: string[];
  meta: string;
}

export interface ProjectStory {
  problem: string;
  build: string;
  architecture: string;
  challenges: string;
  learnings: string;
  vlog: string[];
}

export interface Project {
  name: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  year: string;
  links: {
    github?: string;
    demo?: string;
    docs?: string;
    package?: string;
  };
  story: ProjectStory;
  assets: ProjectAsset[];
  graphNodes: string[];
}

export const projects: Project[] = [
  {
    name: "rvmn",
    description: "Runtime version management utility for Python projects and reproducible developer environments.",
    stack: ["Python", "CLI", "Packaging"],
    status: "maintained",
    year: "2025",
    links: { package: "https://pypi.org/project/rvmn/" },
    story: {
      problem: "Python projects often drift across local machines because runtime versions, package metadata, and developer setup are handled separately.",
      build: "I built a small CLI-first workflow for declaring and checking runtime expectations, with packaging shaped for repeatable installs.",
      architecture: "The core flow is config parsing -> environment inspection -> package command surface -> PyPI distribution.",
      challenges: "Keeping the command output useful without making the tool feel noisy was the main design constraint.",
      learnings: "A developer tool wins when the failure state is more helpful than the happy path is impressive.",
      vlog: ["Bootstrapped the CLI contract", "Defined package metadata", "Tested install and release flow", "Prepared PyPI-facing docs"],
    },
    assets: [
      {
        type: "video",
        title: "CLI Demo Vlog",
        description: "Short terminal walkthrough of install, inspect, and package commands.",
        meta: "02:18 walkthrough",
        mockup: ["00:00 install package", "00:42 inspect runtime", "01:24 validate config", "02:02 publish notes"],
      },
      {
        type: "diagram",
        title: "Release Flow",
        description: "Config, validation, package build, and PyPI publish pipeline.",
        meta: "6 connected stages",
        mockup: ["config.toml", "runtime check", "cli command", "build wheel", "twine upload", "PyPI"],
      },
      {
        type: "code",
        title: "Command Surface",
        description: "Main CLI entrypoints and runtime checks.",
        meta: "Python CLI",
        mockup: ["@app.command()", "def inspect(ctx):", "  runtime = detect()", "  print(report(runtime))"],
      },
      {
        type: "doc",
        title: "PyPI Page",
        description: "Public package metadata and installation instructions.",
        src: "https://pypi.org/project/rvmn/",
        meta: "package docs",
        mockup: ["pip install rvmn", "Runtime constraints", "CLI examples", "Release history"],
      },
    ],
    graphNodes: ["config", "runtime", "cli", "package", "pypi", "docs"],
  },
  {
    name: "neural-search",
    description: "Semantic search prototype using sentence embeddings, vector indexing, and a FastAPI service layer.",
    stack: ["Python", "PyTorch", "FAISS", "FastAPI"],
    status: "research",
    year: "2025",
    links: {},
    story: {
      problem: "Keyword search misses intent when users describe ideas differently from how content is written.",
      build: "I prototyped a semantic search service that encodes documents, indexes vectors, and exposes retrieval through FastAPI.",
      architecture: "Documents move through an embedding worker into FAISS, while the API handles queries, ranking, and response shaping.",
      challenges: "The hard part was balancing retrieval quality, latency, and explainability in a small prototype.",
      learnings: "Vector search needs strong product constraints; better embeddings alone do not make a better experience.",
      vlog: ["Collected sample documents", "Generated embeddings", "Built FAISS index", "Wrapped retrieval in FastAPI"],
    },
    assets: [
      {
        type: "diagram",
        title: "Retrieval Graph",
        description: "Embedding, vector index, query encoder, ranker, and API response flow.",
        meta: "semantic pipeline",
        mockup: ["documents", "encoder", "FAISS index", "query vector", "ranker", "JSON response"],
      },
      {
        type: "image",
        title: "Search UI Mock",
        description: "A compact interface for comparing semantic results.",
        meta: "UI preview",
        mockup: ["search: aircraft materials", "0.91 fatigue analysis", "0.84 composite testing", "0.78 thermal stress"],
      },
      {
        type: "code",
        title: "FastAPI Route",
        description: "Query endpoint and response schema.",
        meta: "API endpoint",
        mockup: ["@router.post('/search')", "embedding = model.encode(q)", "hits = index.search(embedding)", "return SearchResult(hits)"],
      },
      {
        type: "doc",
        title: "Experiment Notes",
        description: "Evaluation notes for ranking and latency tradeoffs.",
        meta: "research log",
        mockup: ["Recall improved with chunking", "Latency target: <250ms", "Top-k tuned from 5 to 12", "Needs query explainers"],
      },
    ],
    graphNodes: ["documents", "encoder", "faiss", "query", "ranker", "api"],
  },
  {
    name: "developer-workspace",
    description: "A Neovim-inspired portfolio interface rebuilt as a typed React system with live service dashboards.",
    stack: ["React", "TypeScript", "TailwindCSS", "Vite"],
    status: "online",
    year: "2026",
    links: {},
    story: {
      problem: "The original portfolio was visually strong but packed into static HTML, making it difficult to maintain or extend.",
      build: "I rebuilt it as a Vite, React, TypeScript, and Tailwind system with typed data, service layers, and reusable sections.",
      architecture: "Profile data, project content, API services, hooks, and UI components are separated so the visual interface can evolve safely.",
      challenges: "The boot sequence, Neovim workspace, and premium terminal feeling had to survive the refactor.",
      learnings: "A portfolio can behave like a product surface when the content model is treated as seriously as the UI.",
      vlog: ["Extracted content into typed data", "Created reusable UI primitives", "Added API dashboards", "Built interactive hero transitions"],
    },
    assets: [
      {
        type: "video",
        title: "Portfolio Vlog",
        description: "Before/after walkthrough of the static HTML to React conversion.",
        meta: "03:46 case study",
        mockup: ["00:00 original HTML", "01:10 data extraction", "02:25 live dashboards", "03:16 interaction polish"],
      },
      {
        type: "diagram",
        title: "Component Map",
        description: "Hero, Workspace, Projects, dashboards, command palette, and contact sections.",
        meta: "React architecture",
        mockup: ["App", "SiteLayout", "Hero", "Workspace", "Projects", "Services"],
      },
      {
        type: "code",
        title: "Data Model",
        description: "Typed project, skill, profile, and experience structures.",
        meta: "TypeScript data",
        mockup: ["interface Project", "story: ProjectStory", "assets: ProjectAsset[]", "graphNodes: string[]"],
      },
      {
        type: "image",
        title: "Hero Interaction",
        description: "Photo card disintegrating into ASCII before reconstructing as terminal.",
        meta: "motion mock",
        mockup: ["profile.card", "ASCII scatter", "10k texture", "terminal rebuild"],
      },
    ],
    graphNodes: ["profile", "components", "services", "dashboards", "motion", "build"],
  },
  {
    name: "llm-router",
    description: "Experimental routing layer for model selection, request shaping, and observability in AI apps.",
    stack: ["TypeScript", "Node.js", "Redis", "OpenAI"],
    status: "beta",
    year: "2026",
    links: {},
    story: {
      problem: "AI apps often need different models for different requests, but routing decisions are usually hidden in application code.",
      build: "I explored a routing layer that can shape requests, select models, track cost, and expose observability hooks.",
      architecture: "Requests pass through policy checks, model selection, provider adapters, cache/queue layers, and telemetry.",
      challenges: "Routing logic needs to stay explainable because cost, latency, and quality decisions affect the whole product.",
      learnings: "The routing layer should feel boring and auditable, not magical.",
      vlog: ["Drafted routing policy schema", "Sketched provider adapters", "Designed telemetry events", "Modeled cost-aware fallbacks"],
    },
    assets: [
      {
        type: "diagram",
        title: "Routing Map",
        description: "Policy, provider adapters, queue/cache, telemetry, and fallback routes.",
        meta: "request graph",
        mockup: ["request", "policy", "router", "provider", "fallback", "telemetry"],
      },
      {
        type: "code",
        title: "Policy Schema",
        description: "Typed configuration for model selection rules.",
        meta: "routing config",
        mockup: ["strategy: cost-aware", "max_latency_ms: 900", "fallback: enabled", "trace: true"],
      },
      {
        type: "doc",
        title: "Observability Notes",
        description: "Metrics and traces needed for debugging model behavior.",
        meta: "ops notes",
        mockup: ["p95 latency", "provider errors", "token spend", "fallback reason"],
      },
      {
        type: "image",
        title: "Dashboard Concept",
        description: "Operator view for latency, cost, and provider health.",
        meta: "dashboard mock",
        mockup: ["latency 742ms", "cost $0.018", "provider healthy", "cache hit 31%"],
      },
    ],
    graphNodes: ["request", "policy", "router", "provider", "cache", "telemetry"],
  },
  {
    name: "launcher",
    description: "Containerized deployment engine and automation runner for orchestrating distributed backend builds.",
    stack: ["Go", "Docker", "CI/CD", "gRPC"],
    status: "research",
    year: "2026",
    links: {},
    story: {
      problem: "Deploying microservices consistently requires coordination across packaging, configurations, and health checks.",
      build: "I constructed an automation-oriented runner that packages services, schedules local container environments, and monitors states.",
      architecture: "A Go control loop listens for build directives, communicates with Docker, and maintains a local gRPC telemetry interface.",
      challenges: "Ensuring container state synchronization and preventing orphan processes on deployment failure.",
      learnings: "Automation pipelines succeed when the build boundaries are clearly isolated from the runner engine.",
      vlog: [
        "Sketched deployment runner loop",
        "Configured Docker API client in Go",
        "Implemented gRPC telemetry service",
        "Wrote test orchestrations",
      ],
    },
    assets: [
      {
        type: "video",
        title: "Deployment Log",
        description: "Terminal recording showing compilation, dockerization, and pipeline execution.",
        meta: "01:45 capture",
        mockup: ["00:00 fetch commit", "00:25 build binary", "00:54 tag container", "01:30 launch container"],
      },
      {
        type: "diagram",
        title: "Container Pipeline",
        description: "Process diagram showing pipeline triggers, container building, and orchestration.",
        meta: "orchestration flow",
        mockup: ["source code", "pipeline trigger", "compile check", "docker build", "gRPC test", "health check"],
      },
      {
        type: "code",
        title: "Runner Daemon",
        description: "Core runner loop listening for system build jobs.",
        meta: "Go structure",
        mockup: ["type Runner struct {", "  client *docker.Client", "  jobs   chan Job", "}", "func (r *Runner) Start()"],
      },
    ],
    graphNodes: ["source", "builder", "docker", "runner", "grpc", "health"],
  },
];

