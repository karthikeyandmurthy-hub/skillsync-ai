/**
 * Purpose: Circular score indicator (0-100) used across dashboards.
 * Responsibilities: Render an accessible SVG ring with color-coded progress.
 * Dependencies: react
 */

interface ScoreRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

/**
 * Map a 0-100 score to a semantic color token.
 */
function tone(value: number): string {
  if (value >= 80) return "var(--color-success)";
  if (value >= 60) return "var(--color-accent)";
  if (value >= 40) return "var(--color-warning)";
  return "var(--color-destructive)";
}

export function ScoreRing({ value, size = 160, stroke = 12, label, sublabel }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const color = tone(clamped);

  return (
    <div className="inline-flex flex-col items-center" role="img" aria-label={`${label ?? "Score"}: ${clamped} out of 100`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--color-border)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.2,0.7,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-semibold tracking-tight text-foreground">
            {clamped}
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">/ 100</span>
        </div>
      </div>
      {label && <div className="mt-3 text-sm font-medium text-foreground">{label}</div>}
      {sublabel && <div className="text-xs text-muted-foreground">{sublabel}</div>}
    </div>
  );
}
