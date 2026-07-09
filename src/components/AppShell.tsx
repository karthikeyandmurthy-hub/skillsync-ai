/**
 * Purpose: Authenticated app shell — sidebar + top bar + content slot.
 * Responsibilities: Persistent navigation, brand mark, breadcrumb-free header.
 * Dependencies: TanStack Router, navigation config
 */

import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { NAV_ITEMS } from "@/config/navigation";

const LOGO_URL = "/logo-dark.png";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-sidebar px-5 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={LOGO_URL}
            alt="SkillSync logo"
            className="size-8 rounded-lg object-contain bg-primary/10 p-1"
          />
          <span className="font-display text-lg font-semibold tracking-tight">SkillSync</span>
        </Link>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4" />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl bg-secondary p-4">
          <p className="text-xs font-medium text-foreground">Career readiness</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect your GitHub to unlock skill verification.
          </p>
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur lg:px-10">
          <div className="flex items-center gap-3 lg:hidden">
            <img
              src={LOGO_URL}
              alt="SkillSync logo"
              className="size-8 rounded-lg object-contain bg-primary/10 p-1"
            />
            <span className="font-display text-base font-semibold">SkillSync</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">v1.0 · Mock data</span>
            <div className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-medium text-primary">
              SS
            </div>
          </div>
        </header>

        <div className="px-6 py-10 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
