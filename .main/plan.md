## SkillSync AI — Initial Build Scope

Focus this first build on the three primary surfaces you called out:
1. **Dashboard Home** (executive summary)
2. **Resume Analyzer** page
3. **GitHub Verification** page

Plus a minimal **Landing Page** and shared shell (sidebar + header) so the dashboard has a real home. Skill Gap, Career Roadmap, and Recruiter View will be scaffolded as placeholder routes (nav entries + empty states) and built out in a follow-up so we don't sprawl this turn.

---

### Design system (locked in `src/styles.css`)
- Pure white background, Apple-style spacious layout, light mode only
- Tokens: primary `#1E3A5F`, accent `#2563EB`, success `#10B981`, warning `#F59E0B`, error `#EF4444`, card `#F8FAFC`, border `#E5E7EB`, secondary text `#4B5563`
- Typography: Inter for body, a refined display face (e.g. Fraunces or SF-style fallback) for headings — no purple, no gradients, no glass
- Subtle fade/slide-in on scroll via framer-motion; generous whitespace; rounded-2xl cards with hairline borders

### Routes (TanStack file-based)
```
src/routes/
  index.tsx                 → Landing page (public)
  _app.tsx                  → Authenticated shell (sidebar + topbar) — pathless layout
  _app.dashboard.tsx        → Dashboard Home
  _app.resume.tsx           → Resume Analyzer
  _app.github.tsx           → GitHub Verification
  _app.skill-gap.tsx        → Placeholder ("Coming soon")
  _app.recruiter.tsx        → Placeholder ("Coming soon")
```
(No auth wiring yet — `_app` is just a layout. Cloud/auth can be added later.)

### Dashboard Home
Executive summary grid of 5 metric cards:
- Career Readiness Score (large hero ring, 0–100)
- ATS Compatibility (progress bar + delta)
- GitHub Verification Score
- Portfolio Strength (Beginner / Intermediate / Advanced badge)
- Skill Gaps (count + top 3 missing skills)

Plus: recent activity timeline, quick actions ("Analyze new resume", "Re-scan GitHub"), and a "Next recommended step" callout. Uses **mock data** from `src/services/mockDashboard.ts` so the UI is fully populated.

### Resume Analyzer
- Drop zone (PDF / DOCX / TXT) with file preview chip
- Target role dropdown sourced from `src/config/roles.ts` (AI Engineer, Python Developer, Data Scientist, Frontend Engineer, Full-Stack — each with its own keyword set & required skills)
- On "Analyze" → runs a client-side mock scoring engine (`src/services/atsEngine.ts`) that returns the weighted breakdown:
  - Skills 30 / Projects 20 / Experience 20 / Education 10 / Keywords 10 / Formatting 10
- Results panel: overall score ring + per-category bars + a "Smart Improvements" list with Before → After rewrite cards

### GitHub Verification
- Input: GitHub profile URL with validation
- On submit → mock analyzer (`src/services/githubAnalyzer.ts`) returns:
  - Code Consistency score, Project Quality score, Portfolio Strength tier
  - Verified Skills list (with evidence: repo name + commit count)
  - Unverified Skills (claimed on resume, not found)
- Clean two-column layout with evidence cards

### Architecture (built for long-term VS Code maintenance)
```
src/
  components/        # presentational UI (DashboardCard, ScoreRing, FileDropzone, …)
  routes/            # TanStack routes (thin — only composition)
  services/          # business logic: atsEngine, githubAnalyzer, resumeParser
  config/            # roles.ts, scoringWeights.ts, navigation.ts
  hooks/             # useResumeAnalysis, useGithubAnalysis
  types/             # Resume, GithubProfile, ScoreBreakdown, Role
  utils/             # logger.ts (centralized [TAG] logger), errors.ts
  api/               # placeholder interfaces for future LLM/AI modules
```
- Every file gets a header comment (Purpose / Responsibilities / Dependencies)
- Every exported function gets a TSDoc block
- Logger: `logger.info('[ATS_ENGINE]', …)` style, single module
- `api/llm.ts` & `api/interview.ts` exported as typed interfaces with `NotImplementedError` stubs so future LLM wiring is drop-in

### Explicitly **out of scope** this turn
- Real resume parsing (PDF/DOCX text extraction) — mock returns sample structured data
- Real GitHub API calls — mock data; will wire to real API once you add a token via Cloud secrets
- Auth / Lovable Cloud
- Skill Gap roadmap UI, Recruiter View UI (placeholders only)
- README.md / DEVELOPER_SETUP.md (do that as your "Day 2" follow-up prompt as planned)

---

Approve and I'll build it. If you'd rather I also fully build Skill Gap + Recruiter View in this same turn, say so and I'll expand — but it will be a heavier first pass.