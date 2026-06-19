/**
 * Purpose: Target role definitions used by the ATS engine and UI dropdowns.
 * Responsibilities: Source of truth for role keywords and required skills.
 * Dependencies: src/types
 */

import type { Role } from "@/types";

export const ROLES: Role[] = [
  {
    id: "ai-engineer",
    label: "AI Engineer",
    description: "Builds and ships ML / LLM-powered systems in production.",
    requiredSkills: ["Python", "PyTorch", "TensorFlow", "LLMs", "Transformers", "MLOps"],
    niceToHaveSkills: ["LangChain", "Vector DBs", "RAG", "Docker", "AWS"],
    keywords: ["machine learning", "deep learning", "neural", "model", "inference", "fine-tuning", "embedding"],
  },
  {
    id: "python-developer",
    label: "Python Developer",
    description: "Backend systems, APIs, and automation in Python.",
    requiredSkills: ["Python", "FastAPI", "Django", "PostgreSQL", "REST", "Git"],
    niceToHaveSkills: ["Celery", "Redis", "Docker", "Pytest", "AWS"],
    keywords: ["api", "backend", "microservices", "async", "orm", "testing"],
  },
  {
    id: "data-scientist",
    label: "Data Scientist",
    description: "Statistical modeling, experimentation, and data storytelling.",
    requiredSkills: ["Python", "Pandas", "NumPy", "scikit-learn", "SQL", "Statistics"],
    niceToHaveSkills: ["Tableau", "Power BI", "Spark", "A/B testing", "Airflow"],
    keywords: ["regression", "classification", "feature", "experiment", "hypothesis", "visualization"],
  },
  {
    id: "frontend-engineer",
    label: "Frontend Engineer",
    description: "Builds polished, accessible user interfaces.",
    requiredSkills: ["TypeScript", "React", "HTML", "CSS", "Accessibility", "Git"],
    niceToHaveSkills: ["Next.js", "Tailwind", "Testing Library", "Figma", "Performance"],
    keywords: ["component", "responsive", "ui", "ux", "state", "hooks"],
  },
  {
    id: "fullstack-engineer",
    label: "Full-Stack Engineer",
    description: "End-to-end product engineering across frontend and backend.",
    requiredSkills: ["TypeScript", "React", "Node.js", "PostgreSQL", "REST", "Git"],
    niceToHaveSkills: ["Docker", "AWS", "GraphQL", "CI/CD", "Tailwind"],
    keywords: ["full-stack", "api", "database", "deployment", "architecture"],
  },
];

export const ROLE_MAP: Record<string, Role> = Object.fromEntries(
  ROLES.map((r) => [r.id, r]),
);
