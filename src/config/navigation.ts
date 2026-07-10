/**
 * Purpose: Sidebar navigation config for the authenticated shell.
 * Responsibilities: Centralized nav items so adding a route is one edit.
 * Dependencies: lucide-react
 */

import {
  LayoutDashboard,
  FileText,
  Github,
  Target,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/github", label: "GitHub Verification", icon: Github },
  { to: "/skill-gap", label: "Skill Gap & Roadmap", icon: Target },
  { to: "/recruiter", label: "Recruiter View", icon: Briefcase },
];
