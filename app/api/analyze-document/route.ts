import path from "node:path";
import { pathToFileURL } from "node:url";
import { NextRequest, NextResponse } from "next/server";
import {
  buildExtractionPrompt,
  parseExtractedFields,
  type ExtractedDocumentFields,
} from "@/app/lib/documentExtraction";

// pdf-parse/mammoth need Node's Buffer/fs, so this route can't run on the edge runtime.
export const runtime = "nodejs";

const MAX_TEXT_CHARS = 12000;

// pdfjs-dist (used by pdf-parse) loads its worker via a relative path that doesn't survive
// Next.js's server bundling, so it's pointed at the copy on disk in node_modules directly.
let pdfWorkerConfigured = false;

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    if (!pdfWorkerConfigured) {
      const workerPath = path.join(
        process.cwd(),
        "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      );
      PDFParse.setWorker(pathToFileURL(workerPath).href);
      pdfWorkerConfigured = true;
    }
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Fallback so plain-text exports also work (handy for testing without a real PDF/DOCX).
  if (type.startsWith("text/") || name.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type. Only PDF and DOCX files can be analyzed.");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !model) {
    return NextResponse.json(
      { error: "AI document analysis is not configured on the server." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was provided." }, { status: 400 });
  }

  let text: string;
  try {
    text = (await extractText(file)).trim();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not read the file." },
      { status: 422 },
    );
  }

  if (!text) {
    return NextResponse.json(
      { error: "No readable text was found in this document." },
      { status: 422 },
    );
  }

  const { system, user } = buildExtractionPrompt(text.slice(0, MAX_TEXT_CHARS), file.name);

  let completion: Response;
  try {
    completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://idc-swift.local",
        "X-Title": "IDC Swift Document Intelligence",
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the AI service." }, { status: 502 });
  }

  if (!completion.ok) {
    const detail = await completion.text().catch(() => "");
    return NextResponse.json(
      { error: `AI service error (${completion.status}). ${detail.slice(0, 300)}` },
      { status: 502 },
    );
  }

  const payload = await completion.json();
  const content: string | undefined = payload?.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "The AI service returned an empty response." }, { status: 502 });
  }

  let fields: ExtractedDocumentFields;
  try {
    fields = parseExtractedFields(content);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not parse the AI response." },
      { status: 502 },
    );
  }

  return NextResponse.json({ fields });
}
