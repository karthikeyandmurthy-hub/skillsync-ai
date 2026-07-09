/**
 * Purpose: Mock 30/60/90 day roadmap data keyed by role.
 * Responsibilities: Provide skill gaps, phased plans, and project ideas.
 * Dependencies: config/roles, types
 */

import type { RoleId } from "@/types";

export interface RoadmapPhase {
  id: "30" | "60" | "90";
  title: string;
  subtitle: string;
  skillsToBridge: string[];
  objectives: string[];
  microProject: {
    name: string;
    summary: string;
  };
}

export interface SuggestedProject {
  name: string;
  summary: string;
  stack: string[];
  features: string[];
}

export interface RoadmapData {
  roleId: RoleId;
  coreGaps: string[];
  readiness: number;      // 0-100
  estimatedDays: number;
  phases: RoadmapPhase[];
  suggestedProjects: SuggestedProject[];
}

const ROADMAPS: Record<RoleId, RoadmapData> = {
  "ai-engineer": {
    roleId: "ai-engineer",
    coreGaps: ["MLOps", "Model Deployment", "Vector Databases"],
    readiness: 65,
    estimatedDays: 60,
    phases: [
      {
        id: "30",
        title: "Foundations & Quick Wins",
        subtitle: "Close the highest-leverage gaps first",
        skillsToBridge: ["Docker basics", "FastAPI serving", "Prompt engineering"],
        objectives: [
          "Containerize a Hugging Face model with Docker",
          "Serve a fine-tuned model via FastAPI",
          "Understand tokenization & context windows deeply",
        ],
        microProject: {
          name: "Dockerized Sentiment API",
          summary: "Wrap a DistilBERT classifier in FastAPI, containerize, and deploy locally.",
        },
      },
      {
        id: "60",
        title: "Core Mastery & Architecture",
        subtitle: "Systems that scale beyond a notebook",
        skillsToBridge: ["RAG pipelines", "Vector DBs (pgvector / Pinecone)", "Evaluation frameworks"],
        objectives: [
          "Design a retrieval-augmented pipeline end-to-end",
          "Implement chunking, embedding, and reranking",
          "Add offline eval with a golden dataset",
        ],
        microProject: {
          name: "RAG Knowledge Assistant",
          summary: "Build a document Q&A app over 100+ PDFs with citations and eval harness.",
        },
      },
      {
        id: "90",
        title: "Advanced Application & Optimization",
        subtitle: "Ship it, monitor it, own it",
        skillsToBridge: ["Model monitoring", "Cost optimization", "LLM observability"],
        objectives: [
          "Deploy to a managed platform with autoscaling",
          "Instrument latency, token cost, and quality drift",
          "Introduce caching & routing between small/large models",
        ],
        microProject: {
          name: "Production-Grade AI Copilot",
          summary: "A domain copilot with feedback loops, evals dashboards, and A/B routing.",
        },
      },
    ],
    suggestedProjects: [
      {
        name: "Multi-Agent Research Assistant",
        summary: "An agentic workflow that plans, searches, and synthesizes reports.",
        stack: ["Python", "LangGraph", "OpenAI API", "pgvector", "FastAPI"],
        features: [
          "Planner + executor agent split",
          "Tool use: web search, calculator, code exec",
          "Citation-backed final report",
          "Streaming UI with token-by-token output",
        ],
      },
      {
        name: "Fine-Tune & Serve Pipeline",
        summary: "End-to-end LoRA fine-tuning on a domain dataset with a served endpoint.",
        stack: ["PyTorch", "PEFT", "Weights & Biases", "Docker", "AWS ECR"],
        features: [
          "Dataset prep + train/eval split",
          "LoRA training with W&B tracking",
          "Merged model export to HF hub",
          "Inference endpoint with autoscaling",
        ],
      },
    ],
  },

  "fullstack-engineer": {
    roleId: "fullstack-engineer",
    coreGaps: ["System Design", "CI/CD", "Auth Patterns"],
    readiness: 72,
    estimatedDays: 45,
    phases: [
      {
        id: "30",
        title: "Foundations & Quick Wins",
        subtitle: "Ship a real app end-to-end",
        skillsToBridge: ["TypeScript strict mode", "Server-side rendering", "REST design"],
        objectives: [
          "Refactor a JS project to strict TS",
          "Set up SSR with a modern meta-framework",
          "Design REST endpoints with proper status codes",
        ],
        microProject: {
          name: "Typed CRUD App",
          summary: "Notes app with typed API client, SSR pages, and PostgreSQL.",
        },
      },
      {
        id: "60",
        title: "Core Mastery & Architecture",
        subtitle: "Scale beyond a single service",
        skillsToBridge: ["Auth (OAuth + sessions)", "Background jobs", "Caching strategies"],
        objectives: [
          "Implement OAuth with refresh tokens",
          "Add a job queue for async work",
          "Introduce Redis for read-through caching",
        ],
        microProject: {
          name: "SaaS Starter Kit",
          summary: "Multi-tenant app with orgs, roles, billing hooks, and background workers.",
        },
      },
      {
        id: "90",
        title: "Advanced Application & Optimization",
        subtitle: "Production readiness",
        skillsToBridge: ["Observability", "CI/CD pipelines", "Load testing"],
        objectives: [
          "Set up structured logging + tracing",
          "Automate deploys with preview envs",
          "Load-test critical paths and tune",
        ],
        microProject: {
          name: "Deploy-Ready Platform",
          summary: "Full CI/CD with preview environments, tracing, and load-tested APIs.",
        },
      },
    ],
    suggestedProjects: [
      {
        name: "Multi-Tenant Analytics Dashboard",
        summary: "Org-scoped analytics with role-based access and real-time charts.",
        stack: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis"],
        features: [
          "Org / member / role model",
          "RBAC on every endpoint",
          "WebSocket live updates",
          "Export to CSV / PDF",
        ],
      },
    ],
  },

  "data-scientist": {
    roleId: "data-scientist",
    coreGaps: ["Experiment design", "Causal inference", "Production pipelines"],
    readiness: 60,
    estimatedDays: 75,
    phases: [
      {
        id: "30",
        title: "Foundations & Quick Wins",
        subtitle: "Sharpen statistical fundamentals",
        skillsToBridge: ["Hypothesis testing", "Bootstrapping", "EDA rigor"],
        objectives: [
          "Run A/B tests with correct power analysis",
          "Bootstrap confidence intervals from scratch",
          "Author a rigorous EDA notebook template",
        ],
        microProject: {
          name: "A/B Test Analyzer",
          summary: "CLI that reads two variants and outputs uplift, CI, and p-values.",
        },
      },
      {
        id: "60",
        title: "Core Mastery & Architecture",
        subtitle: "From notebook to pipeline",
        skillsToBridge: ["Airflow / Prefect", "Feature stores", "Model versioning"],
        objectives: [
          "Convert a notebook into a scheduled pipeline",
          "Track features and models with MLflow",
          "Design a reproducible training workflow",
        ],
        microProject: {
          name: "Churn Prediction Pipeline",
          summary: "Scheduled training + inference pipeline with feature tracking.",
        },
      },
      {
        id: "90",
        title: "Advanced Application & Optimization",
        subtitle: "Impact & communication",
        skillsToBridge: ["Causal inference", "Executive storytelling", "Model monitoring"],
        objectives: [
          "Apply diff-in-diff / propensity scoring",
          "Deliver a stakeholder-ready readout",
          "Monitor drift and re-training triggers",
        ],
        microProject: {
          name: "Uplift Modeling Case Study",
          summary: "Full causal analysis writeup with dashboards and recommendations.",
        },
      },
    ],
    suggestedProjects: [
      {
        name: "Retention Uplift Study",
        summary: "Causal analysis of a retention program with a public writeup.",
        stack: ["Python", "pandas", "statsmodels", "DoWhy", "Streamlit"],
        features: [
          "Propensity score matching",
          "Sensitivity analysis",
          "Interactive dashboard",
          "Executive summary PDF",
        ],
      },
    ],
  },

  "python-developer": {
    roleId: "python-developer",
    coreGaps: ["Async patterns", "Testing depth", "Deployment"],
    readiness: 68,
    estimatedDays: 50,
    phases: [
      {
        id: "30",
        title: "Foundations & Quick Wins",
        subtitle: "Modern Python fluency",
        skillsToBridge: ["Type hints everywhere", "Pydantic v2", "pytest fixtures"],
        objectives: [
          "Add mypy to an existing repo",
          "Model domain types with Pydantic",
          "Write fixture-driven tests",
        ],
        microProject: {
          name: "Typed URL Shortener",
          summary: "FastAPI + Pydantic + Postgres with 90% test coverage.",
        },
      },
      {
        id: "60",
        title: "Core Mastery & Architecture",
        subtitle: "Concurrency & background work",
        skillsToBridge: ["asyncio", "Celery / RQ", "Structured logging"],
        objectives: [
          "Convert sync IO paths to async",
          "Move slow tasks to a worker queue",
          "Emit JSON logs with correlation IDs",
        ],
        microProject: {
          name: "Async Web Scraper",
          summary: "Async crawler with rate limiting, queues, and observability.",
        },
      },
      {
        id: "90",
        title: "Advanced Application & Optimization",
        subtitle: "Ship & scale",
        skillsToBridge: ["Docker", "GitHub Actions", "Perf profiling"],
        objectives: [
          "Multi-stage Dockerfiles",
          "CI matrix with lint/test/build",
          "Profile a hot path and cut p99 latency",
        ],
        microProject: {
          name: "Production API Template",
          summary: "Reusable FastAPI template with CI, Docker, and perf baseline.",
        },
      },
    ],
    suggestedProjects: [
      {
        name: "Event-Driven Order Service",
        summary: "Order service consuming events, writing to Postgres, emitting webhooks.",
        stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
        features: [
          "Idempotent handlers",
          "Outbox pattern for webhooks",
          "Retry with exponential backoff",
          "OpenAPI + typed client",
        ],
      },
    ],
  },

  "frontend-engineer": {
    roleId: "frontend-engineer",
    coreGaps: ["Accessibility", "Performance", "Testing"],
    readiness: 70,
    estimatedDays: 45,
    phases: [
      {
        id: "30",
        title: "Foundations & Quick Wins",
        subtitle: "Craft & fundamentals",
        skillsToBridge: ["Semantic HTML", "WAI-ARIA basics", "Tailwind mastery"],
        objectives: [
          "Audit a page with axe and fix all criticals",
          "Rebuild a component with proper roles/labels",
          "Design tokens & responsive rhythm",
        ],
        microProject: {
          name: "Accessible Component Library",
          summary: "5 fully accessible components with tests and Storybook docs.",
        },
      },
      {
        id: "60",
        title: "Core Mastery & Architecture",
        subtitle: "State & data patterns",
        skillsToBridge: ["React Query", "Route-level code splitting", "Form validation"],
        objectives: [
          "Adopt server-state caching",
          "Split bundles per route",
          "Type-safe forms with schema validation",
        ],
        microProject: {
          name: "Typed Data Grid App",
          summary: "Sortable, filterable, paginated grid backed by a real API.",
        },
      },
      {
        id: "90",
        title: "Advanced Application & Optimization",
        subtitle: "Performance & polish",
        skillsToBridge: ["Core Web Vitals", "Image optimization", "E2E testing"],
        objectives: [
          "Hit green LCP / CLS / INP on a real app",
          "Adopt responsive images + lazy loading",
          "Author critical-path Playwright tests",
        ],
        microProject: {
          name: "Perf-Tuned Marketing Site",
          summary: "SSR marketing site with 95+ Lighthouse across all categories.",
        },
      },
    ],
    suggestedProjects: [
      {
        name: "Design-System Playground",
        summary: "Publishable component library with a docs site and visual tests.",
        stack: ["TypeScript", "React", "Tailwind", "Storybook", "Playwright"],
        features: [
          "Token-driven theming",
          "Dark mode + RTL",
          "Chromatic visual regression",
          "npm-published package",
        ],
      },
    ],
  },
};

export function getRoadmap(roleId: RoleId): RoadmapData {
  return ROADMAPS[roleId];
}
