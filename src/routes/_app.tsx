/**
 * Purpose: Pathless authenticated layout — renders the AppShell.
 * Responsibilities: Wrap dashboard/resume/github/etc. routes in shared chrome.
 * Dependencies: TanStack Router, AppShell
 */

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});
