/**
 * Purpose: Recruiter View.
 * Responsibilities: Render recruiter-focused analysis including:
 *   1. Single Candidate Assessment (via Full Gemini AI screen)
 *   2. Bulk Pipeline Dashboard (supporting CSV upload, automatic ATS scoring, sorting, filtering, and single-click Deep AI Screening)
 * Dependencies: components/PageHeader, components/ScoreRing, services/recruiterAnalyzer, config/roles, types
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  Send,
  Sparkles,
  ThumbsUp,
  Upload,
  User,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FileDropzone } from "@/components/FileDropzone";
import { ScoreRing } from "@/components/ScoreRing";
import { ROLES, ROLE_MAP } from "@/config/roles";
import {
  analyzeRecruiter,
  filterAndScoreCandidatesCSV,
  generateSampleCandidates,
  analyzeRecruiterMock,
} from "@/services/recruiterAnalyzer";
import type { RecruiterViewResult, RoleId, CSVCandidate } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/recruiter")({
  head: () => ({
    meta: [
      { title: "Recruiter View — SkillSync AI" },
      { name: "description", content: "Screen individual resumes with Gemini, or upload your candidate database CSV to run local ATS match scores, rank applicants, and deep screen resumes." },
    ],
  }),
  component: RecruiterPage,
});

function RecruiterPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("bulk");
  const [roleId, setRoleId] = useState<RoleId>("ai-engineer");

  // ── Single Screening State ────────────────────────────────────────────────
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleName, setSingleName] = useState("Karthikeyan D Murthy");
  const [singleResult, setSingleResult] = useState<RecruiterViewResult | null>(null);
  const [singleRunning, setSingleRunning] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  // ── Bulk Screening State ──────────────────────────────────────────────────
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<CSVCandidate[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score-desc" | "score-asc" | "exp-desc">("score-desc");

  // Deep screening state for bulk row
  const [deepScreenRunningId, setDeepScreenRunningId] = useState<string | null>(null);

  const selectedRole = useMemo(() => ROLE_MAP[roleId], [roleId]);

  // ── Single Mode actions ──────────────────────────────────────────────────
  async function runSingleScreen() {
    if (!singleFile) {
      setSingleError("Please supply a resume file to screen.");
      return;
    }
    if (!singleName.trim()) {
      setSingleError("Please specify the candidate name.");
      return;
    }
    setSingleRunning(true);
    setSingleError(null);
    setSingleResult(null);
    try {
      const res = await analyzeRecruiter(singleFile, selectedRole.label, singleName);
      setSingleResult(res);
      toast.success("Single Candidate Screen completed!");
    } catch (e) {
      console.error(e);
      setSingleError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSingleRunning(false);
    }
  }

  // ── Bulk Mode actions ────────────────────────────────────────────────────
  function handleCSVUpload(file: File) {
    setBulkFile(file);
    setBulkRunning(true);
    setCandidates([]);
    setExpandedId(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
          const scored = filterAndScoreCandidatesCSV(text, selectedRole);
          setCandidates(scored);
          toast.success(`Success! Parsed ${scored.length} candidates from CSV.`);
        } catch (error) {
          console.error(error);
          toast.error("Failed to parse CSV. Ensure correct formatting.");
        }
      }
      setBulkRunning(false);
    };
    reader.onerror = () => {
      toast.error("Error reading file.");
      setBulkRunning(false);
    };
    reader.readAsText(file);
  }

  // Generate Sample Candidates helper
  function loadSampleCandidates() {
    const samples = generateSampleCandidates(selectedRole);
    setCandidates(samples);
    setExpandedId(null);
    setBulkFile(null);
    toast.success("Loaded 6 pre-configured candidates matching role criteria.");
  }

  // Generate clean template CSV for client-side download
  function downloadCSVTemplate() {
    const headers = "Name,Email,Skills,Experience,Education,Profile Summary\n";
    const sampleRows = [
      `"Aria Sterling","aria@example.com","Python, PyTorch, LLMs, MLOps, SQL","7 years","MS in CS (Stanford)","ML Engineer deployed to production models. Highly proficient in fine-tuning."`,
      `"Marcus Cole","marcus@example.com","JavaScript, React, Node.js, Express, CSS","4 years","BS in Engineering","Fullstack developer with database management and responsive layouts expertise."`,
      `"Emma Watson","emma@example.com","Python, scikit-learn, SQL, Pandas, Tableau","3 years","BS in Mathematics","Exploratory analysis expert. High-impact visualizations and hypothesis modeling."`
    ].join("\n");

    const blob = new Blob([headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `skillsync_ats_template_${selectedRole.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV import template downloaded.");
  }

  // Run deep AI screen on specific row
  async function runDeepAIScreen(cand: CSVCandidate) {
    setDeepScreenRunningId(cand.id);
    try {
      // Simulate/Trigger full recruiter profile evaluate
      // Create a small mock file representing their profile summary text for the screen
      const mockFileText = `
Candidate: ${cand.name}
Email: ${cand.email}
Skills: ${cand.skills.join(", ")}
Experience: ${cand.experience}
Education: ${cand.education}
Summary: ${cand.summary}
      `;
      // Convert to dummy file object
      const dummyFile = new File([mockFileText], "resume.txt", { type: "text/plain" });
      const analysis = await analyzeRecruiter(dummyFile, selectedRole.label, cand.name);

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === cand.id ? { ...c, isDeepScreened: true, deepScreenResult: analysis } : c
        )
      );
      toast.success(`Deep Screening complete for ${cand.name}!`);
    } catch (e) {
      console.error(e);
      toast.error("Deep screen failed. Falling back to local scoring.");
    } finally {
      setDeepScreenRunningId(null);
    }
  }

  // Filter & Sort parsed candidates
  const processedCandidates = useMemo(() => {
    let list = [...candidates];

    // Recalculate matches if role switches
    list = list.map((cand) => {
      // If candidates loaded from template/CSV need refreshing for a new role
      const roleSkills = [...selectedRole.requiredSkills, ...selectedRole.niceToHaveSkills];
      const matched: string[] = [];
      const missing: string[] = [];

      roleSkills.forEach((skill) => {
        const isMatched = cand.skills.some((cs) => {
          return cs.toLowerCase() === skill.toLowerCase() ||
                 cs.toLowerCase().includes(skill.toLowerCase()) ||
                 skill.toLowerCase().includes(cs.toLowerCase());
        });
        if (isMatched) matched.push(skill);
        else if (selectedRole.requiredSkills.includes(skill)) missing.push(skill);
      });

      let skillScore = roleSkills.length > 0 ? (matched.length / roleSkills.length) * 100 : 50;
      let keywordHits = 0;
      selectedRole.keywords.forEach((keyword) => {
        if (cand.summary.toLowerCase().includes(keyword.toLowerCase())) keywordHits++;
      });
      const keyPercent = selectedRole.keywords.length > 0 ? (keywordHits / selectedRole.keywords.length) * 100 : 0;
      const expNum = parseInt(cand.experience.replace(/[^0-9]/g, "")) || 0;
      let expScore = 50;
      if (expNum >= 5) expScore = 95;
      else if (expNum >= 3) expScore = 80;
      else if (expNum >= 1) expScore = 65;

      const matchScore = Math.round(
        (skillScore * 0.5) + (keyPercent * 0.25) + (expScore * 0.25)
      );

      let verdict: CSVCandidate["verdict"] = "no";
      if (matchScore >= 80) verdict = "strong_yes";
      else if (matchScore >= 62) verdict = "yes";
      else if (matchScore >= 45) verdict = "maybe";

      return {
        ...cand,
        matchScore,
        verdict,
        matchedSkills: matched,
        missingSkills: missing,
      };
    });

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)) ||
          c.summary.toLowerCase().includes(q)
      );
    }

    // Apply Verdict Filter
    if (verdictFilter !== "all") {
      list = list.filter((c) => c.verdict === verdictFilter);
    }

    // Apply Sorting
    list.sort((a, b) => {
      if (sortBy === "score-desc") return b.matchScore - a.matchScore;
      if (sortBy === "score-asc") return a.matchScore - b.matchScore;
      if (sortBy === "exp-desc") {
        const expA = parseInt(a.experience.replace(/[^0-9]/g, "")) || 0;
        const expB = parseInt(b.experience.replace(/[^0-9]/g, "")) || 0;
        return expB - expA;
      }
      return 0;
    });

    return list;
  }, [candidates, searchQuery, verdictFilter, sortBy, selectedRole]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (processedCandidates.length === 0) return { total: 0, strongCount: 0, strongPercent: 0, avgScore: 0 };
    const total = processedCandidates.length;
    const strongCount = processedCandidates.filter((c) => c.verdict === "strong_yes" || c.verdict === "yes").length;
    const avgScore = Math.round(processedCandidates.reduce((acc, c) => acc + c.matchScore, 0) / total);
    return {
      total,
      strongCount,
      strongPercent: Math.round((strongCount / total) * 100),
      avgScore,
    };
  }, [processedCandidates]);

  // Helper verdict layout badges
  function getVerdictBadge(verdict: CSVCandidate["verdict"]) {
    switch (verdict) {
      case "strong_yes":
        return <span className="rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-semibold text-success tracking-wide uppercase">Shortlisted</span>;
      case "yes":
        return <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent tracking-wide uppercase">Qualified</span>;
      case "maybe":
        return <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning tracking-wide uppercase">Review Pool</span>;
      default:
        return <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground tracking-wide uppercase">Pass</span>;
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Recruiting Command Center"
        title="Screen candidates with precision."
        description="Filter out noise instantly. Assess applications in single deep-dive reviews, or upload pipeline CSV sheets to rank candidates algorithmically."
      />

      {/* Mode Switcher */}
      <div className="flex border-b border-border mb-8">
        <button
          onClick={() => setActiveTab("bulk")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold tracking-wide transition-all ${
            activeTab === "bulk"
              ? "border-accent text-accent font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="size-4" /> Bulk Pipeline Screen (CSV)
        </button>
        <button
          onClick={() => setActiveTab("single")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold tracking-wide transition-all ${
            activeTab === "single"
              ? "border-accent text-accent font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="size-4" /> Single Pipeline Screen (Gemini)
        </button>
      </div>

      {activeTab === "single" && (
        <div className="fade-in-up space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-card p-6 hairline">
                <label htmlFor="cname" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Candidate full name
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <User className="size-4 text-muted-foreground" />
                  <input
                    id="cname"
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    placeholder="Candidate Name"
                    className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <FileDropzone file={singleFile} onFile={(f) => { setSingleFile(f); setSingleResult(null); setSingleError(null); }} />
            </div>

            <div className="rounded-2xl bg-card p-6 hairline flex flex-col justify-between">
              <div className="space-y-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Select target requisition
                </label>
                <select
                  value={roleId}
                  onChange={(e) => { setRoleId(e.target.value as RoleId); setSingleResult(null); setSingleError(null); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted-foreground">{selectedRole.description}</p>
                <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground">Scoring indicators:</span>
                  <p>• Candidate skill matching density</p>
                  <p>• Formatting ATS alignment</p>
                  <p>• Semantic keyword matches</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={runSingleScreen}
                  disabled={!singleFile || singleRunning || !singleName.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {singleRunning ? "Analysing Resume..." : <>Screen Candidate <ArrowRight className="size-4" /></>}
                </button>
                {singleRunning && (
                  <p className="mt-2 text-xs text-center text-muted-foreground animate-pulse">⏳ Screening file with Gemini AI...</p>
                )}
                {singleError && <p className="mt-2 text-xs text-center text-destructive">{singleError}</p>}
              </div>
            </div>
          </div>

          {singleResult && (
            <div className="fade-in-up space-y-6">
              {/* Single Result Row */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-card p-6 hairline text-center flex flex-col justify-center items-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Decision Recommendation</p>
                  <div className="mt-4">
                    <span className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold tracking-wide uppercase ${
                      singleResult.recommendedAction === "strong_yes" ? "bg-success text-success-foreground border-success/30"
                      : singleResult.recommendedAction === "yes" ? "bg-success/10 text-success border-success/20"
                      : singleResult.recommendedAction === "maybe" ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {singleResult.recommendedAction.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed">{singleResult.actionRationale}</p>
                </div>

                <div className="rounded-2xl bg-card p-6 hairline flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">First Impression Score</p>
                  <ScoreRing value={singleResult.firstImpressionScore} size={110} strokeWidth={8} />
                </div>

                <div className="rounded-2xl bg-card p-6 hairline flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Shortlist Index</p>
                  <ScoreRing value={singleResult.shortlistProbability} size={110} strokeWidth={8} />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl bg-card p-6 hairline lg:col-span-1 space-y-4">
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">Scoring Categories</h3>
                    <p className="text-xs text-muted-foreground">Adjusted requisition criteria metrics.</p>
                  </div>
                  <div className="space-y-4.5">
                    {singleResult.shortlistFactors.map((factor, index) => (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                          <span className="text-foreground">{factor.factor}</span>
                          <span>{factor.score}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${factor.score >= 80 ? "bg-success" : factor.score >= 60 ? "bg-accent" : "bg-warning"}`} style={{ width: `${factor.score}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                          <span>Weight: {factor.weight}%</span>
                          <span className={factor.verdict === "strong" ? "text-success" : factor.verdict === "average" ? "text-accent" : "text-destructive"}>{factor.verdict}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-primary p-6 text-primary-foreground lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary-foreground/75 font-semibold"><Send className="size-3.5" /> Recruiter Pitch Card</span>
                      <button onClick={() => { navigator.clipboard.writeText(singleResult.elevatorPitch); toast.success("Copied to clipboard!"); }} className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"><Copy className="size-4" /></button>
                    </div>
                    <p className="mt-4 font-display text-xl sm:text-2xl leading-normal text-balance italic">"{singleResult.elevatorPitch}"</p>
                  </div>
                  <p className="text-[10px] text-primary-foreground/50 uppercase tracking-widest block mt-4">Synthesized Hiring manager alignment report</p>
                </div>
              </div>

              {/* Signals */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-card p-6 hairline">
                  <div className="flex items-center gap-2 mb-3.5"><ThumbsUp className="size-4 text-success" /><h3 className="font-display text-base font-semibold">Match Strengths</h3></div>
                  <div className="space-y-3">
                    {singleResult.strongPoints.map((pt, idx) => (
                      <div key={idx} className="rounded-xl border border-success/15 bg-success/5 p-4">
                        <h4 className="text-xs font-semibold text-success uppercase block mb-1">{pt.label}</h4>
                        <p className="text-xs text-muted-foreground tracking-wide leading-relaxed">{pt.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-card p-6 hairline">
                  <div className="flex items-center gap-2 mb-3.5"><AlertTriangle className="size-4 text-warning" /><h3 className="font-display text-base font-semibold">Requisition Vulnerabilities / Red Flags</h3></div>
                  <div className="space-y-3">
                    {singleResult.redFlags.map((pt, idx) => (
                      <div key={idx} className={`rounded-xl border p-4 ${pt.impact === "negative" ? "bg-destructive/5 border-destructive/15" : "bg-warning/5 border-warning/15"}`}>
                        <h4 className={`text-xs font-semibold uppercase block mb-1 ${pt.impact === "negative" ? "text-destructive" : "text-warning"}`}>{pt.label}</h4>
                        <p className="text-xs text-muted-foreground tracking-wide leading-relaxed">{pt.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="fade-in-up space-y-8">
          {/* Top Panel Actions & Template Instruction */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl bg-card p-6 hairline space-y-4">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">Import Candidates Database (CSV / Excel format)</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a standard spreadsheet with applicant information matching our requisition framework columns.
                </p>
              </div>

              {/* Dynamic Drag N Drop Area */}
              <div className="relative border-2 border-dashed border-border rounded-xl bg-background p-8 text-center hover:bg-secondary/15 transition-all">
                <input
                  type="file"
                  accept=".csv,.txt"
                  id="csv-file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCSVUpload(f);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <div className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {bulkFile ? bulkFile.name : "Select or drag CSV candidate sheet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Supports standard CSV exports from sheets.</p>
                  </div>
                </div>
              </div>

              {/* Instruction Tags bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Required Columns:</span>{" "}
                  <code className="text-accent bg-secondary/80 px-1 py-0.5 rounded">Name, Email, Skills, Experience, Education, Profile Summary</code>
                </div>
                <button
                  onClick={downloadCSVTemplate}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                >
                  <Download className="size-3.5" /> Download Schema Template
                </button>
              </div>
            </div>

            {/* Parameter selection & Mock options */}
            <div className="rounded-2xl bg-card p-6 hairline flex flex-col justify-between">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Target Requisition
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value as RoleId)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  {selectedRole.description}
                </p>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-xs text-muted-foreground mb-3 font-medium">No candidate list ready?</p>
                <button
                  onClick={loadSampleCandidates}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/5 hover:bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors"
                >
                  <Users className="size-3.5" /> Load Simulated Applicants
                </button>
              </div>
            </div>
          </div>

          {/* Bulk ATS Stats Area */}
          {candidates.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-3 fade-in-up">
              <div className="rounded-2xl bg-card p-5 hairline">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Applicants Under Scan</span>
                <span className="font-display text-3xl font-bold tracking-tight text-foreground block mt-1.5">{stats.total}</span>
              </div>
              <div className="rounded-2xl bg-card p-5 hairline">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Strong Rejections / Pass</span>
                <span className="font-display text-3xl font-bold tracking-tight text-foreground block mt-1.5">
                  {stats.total - stats.strongCount} <span className="text-xs font-normal text-muted-foreground">candidates passed on</span>
                </span>
              </div>
              <div className="rounded-2xl bg-card p-5 hairline">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Shortlisted Ratio</span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="font-display text-3xl font-bold tracking-tight text-success">{stats.strongPercent}%</span>
                  <span className="text-xs text-muted-foreground">({stats.strongCount} matched candidates)</span>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Dashboard Toolbar & Interactive Table Grid */}
          {candidates.length > 0 ? (
            <div className="rounded-2xl bg-card p-6 hairline space-y-5 fade-in-up">
              {/* Toolbar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
                <div className="flex flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Search className="size-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by candidate name or skills..."
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter option */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Filter className="size-3.5" /> Filter verdict:
                    <select
                      value={verdictFilter}
                      onChange={(e) => setVerdictFilter(e.target.value)}
                      className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none"
                    >
                      <option value="all">All Verdicts</option>
                      <option value="strong_yes">Only Shortlisted</option>
                      <option value="yes">Qualified matches</option>
                      <option value="maybe">Review pool</option>
                      <option value="no">Passes</option>
                    </select>
                  </div>

                  {/* Sort option */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border/80 pl-3">
                    Sort:
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none"
                    >
                      <option value="score-desc">ATS Score: High to Low</option>
                      <option value="score-asc">ATS Score: Low to High</option>
                      <option value="exp-desc">Experience: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table / List rendering */}
              <div className="overflow-x-auto rounded-xl border border-border bg-background">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-secondary/35 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4 font-bold">Applicant Details</th>
                      <th className="py-3 px-4 text-center font-bold">ATS Match</th>
                      <th className="py-3 px-4 font-bold">Requisition Verdict</th>
                      <th className="py-3 px-4 font-bold">Experience</th>
                      <th className="py-3 px-4 text-right font-bold w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {processedCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                          No candidates match the specified filters. Try expanding search query.
                        </td>
                      </tr>
                    ) : (
                      processedCandidates.map((cand) => {
                        const isOpen = expandedId === cand.id;
                        return (
                          <>
                            <tr
                              key={cand.id}
                              onClick={() => setExpandedId(isOpen ? null : cand.id)}
                              className={`cursor-pointer hover:bg-hover active:bg-hover transition-colors ${
                                isOpen ? "bg-secondary/25" : ""
                              }`}
                            >
                              <td className="py-4 px-4">
                                <div className="font-semibold text-foreground leading-snug">{cand.name}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{cand.email}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex justify-center">
                                  <div className="relative flex items-center justify-center">
                                    <ScoreRing value={cand.matchScore} size={42} strokeWidth={3} />
                                    <span className="absolute text-[10px] font-extrabold text-foreground">{cand.matchScore}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex">{getVerdictBadge(cand.verdict)}</div>
                              </td>
                              <td className="py-4 px-4 font-medium text-foreground text-xs">
                                <div>{cand.experience}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">{cand.education}</div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                {isOpen ? (
                                  <ChevronUp className="size-4 text-muted-foreground inline" />
                                ) : (
                                  <ChevronDown className="size-4 text-muted-foreground inline" />
                                )}
                              </td>
                            </tr>

                            {/* Details Accordion Panel */}
                            {isOpen && (
                              <tr className="bg-secondary/10">
                                <td colSpan={5} className="p-0 border-t-0">
                                  <div className="px-6 py-5 border-t border-border grid md:grid-cols-3 gap-6 fade-in-up">
                                    {/* Skills Breakdown */}
                                    <div className="md:col-span-1 space-y-4">
                                      <div>
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Candidate Summary</span>
                                        <p className="text-xs text-foreground mt-1.5 leading-relaxed italic">
                                          "{cand.summary || "No Bio Summary provided."}"
                                        </p>
                                      </div>

                                      <div className="space-y-2">
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Skills Found ({cand.skills.length})</span>
                                        <div className="flex flex-wrap gap-1">
                                          {cand.skills.map((s, idx) => (
                                            <span key={idx} className="rounded bg-secondary text-primary px-2 py-0.5 text-[10px] font-medium border border-border">{s}</span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* ATS delta checks */}
                                    <div className="md:col-span-1 space-y-4">
                                      <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold text-success uppercase tracking-widest block">Matched Target Skills ({cand.matchedSkills.length})</span>
                                        {cand.matchedSkills.length > 0 ? (
                                          <div className="flex flex-wrap gap-1 hover:brightness-95">
                                            {cand.matchedSkills.map((s, idx) => (
                                              <span key={idx} className="rounded bg-success/10 text-success border border-success/15 px-2 py-0.5 text-[10px] font-medium">{s}</span>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-muted-foreground leading-normal italic">None matched</p>
                                        )}
                                      </div>

                                      <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold text-destructive uppercase tracking-widest block">Missing Required Skills ({cand.missingSkills.length})</span>
                                        {cand.missingSkills.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {cand.missingSkills.map((s, idx) => (
                                              <span key={idx} className="rounded bg-destructive/10 text-destructive border border-destructive/15 px-2 py-0.5 text-[10px] font-medium">{s}</span>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-success font-semibold italic text-sm">Perfect Skill Fit!</p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Deep screening actions */}
                                    <div className="md:col-span-1 bg-background border border-border rounded-xl p-5 flex flex-col justify-between">
                                      <div>
                                        <span className="text-[10px] font-semibold text-accent uppercase tracking-widest flex items-center gap-1 leading-none"><Sparkles className="size-3" /> Deep Screen Assessment</span>
                                        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                                          Generate a full corporate profile evaluate with deep analysis, shortlist index and hiring manager pitches.
                                        </p>
                                      </div>

                                      <div className="mt-4 pt-3 border-t border-border/80">
                                        {cand.isDeepScreened && cand.deepScreenResult ? (
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                              <span>Shortlist recommendation:</span>
                                              <span className="font-bold text-success capitalize">{cand.deepScreenResult.recommendedAction.replace("_", " ")}</span>
                                            </div>
                                            <div className="rounded bg-secondary p-3 text-[10px] text-muted-foreground max-h-24 overflow-y-auto leading-relaxed border border-border">
                                              "{cand.deepScreenResult.elevatorPitch}"
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => runDeepAIScreen(cand)}
                                            disabled={deepScreenRunningId !== null}
                                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent/90 disabled:opacity-50"
                                          >
                                            {deepScreenRunningId === cand.id ? (
                                              "Analyzing with AI..."
                                            ) : (
                                              <>Evaluate Requisition Fit <Sparkles className="size-3" /></>
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-12 text-center border-dashed border-2 border-border/80">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
                <FileSpreadsheet className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">Bulk Candidates Pipeline empty</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Drop your spreadsheet, or generate a simulated catalog to test our automated ATS rank matching.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
