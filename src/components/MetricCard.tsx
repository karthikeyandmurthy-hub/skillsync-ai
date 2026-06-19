/**
 * Purpose: Reusable card surface for dashboard metrics.
 * Responsibilities: Consistent padding, hairline border, hover lift.
 * Dependencies: react, lucide-react
 */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  icon?: LucideIcon;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function MetricCard({ icon: Icon, label, hint, children, className = "" }: MetricCardProps) {
  return (
    <div
      className={`group rounded-2xl bg-card p-6 hairline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {Icon && <Icon className="size-4" />}
          <span>{label}</span>
        </div>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
