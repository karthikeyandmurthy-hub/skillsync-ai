/**
 * Purpose: Resume file upload zone (PDF, DOCX, TXT).
 * Responsibilities: Drag/drop + click select, basic validation, file chip.
 * Dependencies: react, lucide-react
 */

import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

interface FileDropzoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
}

const ACCEPT = ".pdf,.docx,.txt";
const MAX_MB = 10;

export function FileDropzone({ file, onFile }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(list: FileList | null) {
    setError(null);
    if (!list || list.length === 0) return;
    const f = list[0];
    const okExt = /\.(pdf|docx|txt)$/i.test(f.name);
    if (!okExt) { setError("Use a PDF, DOCX, or TXT file."); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`Max file size is ${MAX_MB}MB.`); return; }
    onFile(f);
  }

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-card p-5 hairline">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onFile(null)}
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Remove file"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => { e.preventDefault(); setHover(false); handleFiles(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card px-6 py-14 text-center transition-colors ${
          hover ? "border-accent bg-secondary" : "border-border hover:border-accent/60"
        }`}
      >
        <div className="grid size-12 place-items-center rounded-full bg-secondary text-accent">
          <UploadCloud className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">
          Drop your resume here, or <span className="text-accent">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOCX, or TXT — up to {MAX_MB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
