/**
 * Purpose: Consistent page title block.
 * Responsibilities: Eyebrow, heading, supporting text, optional actions.
 * Dependencies: react
 */

import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="fade-in-up mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl text-balance text-foreground sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
