/**
 * Purpose: Client-side text extraction from resume files (PDF/TXT/DOCX-fallback).
 */
import * as pdfjs from "pdfjs-dist";
// @ts-expect-error - worker url import
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) return await file.text();
  if (name.endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let out = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      out += content.items.map((it: any) => it.str).join(" ") + "\n";
    }
    return out.trim();
  }
  // DOCX: no clean browser parser installed; fall back to raw text (best-effort).
  return await file.text();
}
