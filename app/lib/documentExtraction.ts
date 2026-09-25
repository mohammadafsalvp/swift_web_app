import type { WipFields } from "../components/dashboard/data";
import type { Sector } from "../components/dashboard/UploadModal";

// Fields the AI is asked to pull out of an uploaded PDF/DOCX so the WIP table
// (and the upload form) can be auto-filled instead of typed in by hand.
export type ExtractedDocumentFields = Partial<WipFields> & {
  vessel?: string;
  engine?: string;
  sector?: Sector;
};

const TEXT_KEYS: (keyof WipFields)[] = [
  "customer",
  "jobNo",
  "model",
  "serialNo",
  "assetId",
  "contactName",
  "jobOpeningDate",
  "reqNo",
  "poStatus",
  "poDate",
  "poNo",
  "poIssuedBy",
  "invoiceSubmissionStatus",
  "paymentStatus",
  "invoiceNo",
  "invoiceDate",
  "scopeOfWork",
  "jobLocationReportSubmission",
  "completionReportSign",
  "jobCompletionDate",
  "remarks",
  "swiftFocalPoint",
];

const NUMBER_KEYS: (keyof WipFields)[] = ["swiftValue", "idcValue"];

export const EXTRACTION_JSON_SCHEMA_HINT = `{
  "vessel": string,
  "engine": string,
  "sector": "Marine Vessel" | "Offshore Rig" | "Onshore Unit",
  "customer": string,
  "jobNo": string,
  "model": string,
  "serialNo": string,
  "assetId": string,
  "contactName": string,
  "jobOpeningDate": string (ISO date, e.g. 2024-09-12),
  "reqNo": string,
  "poStatus": string,
  "poDate": string (ISO date),
  "poNo": string,
  "poIssuedBy": string,
  "invoiceSubmissionStatus": string,
  "paymentStatus": string,
  "invoiceNo": string,
  "invoiceDate": string (ISO date),
  "swiftValue": number,
  "idcValue": number,
  "scopeOfWork": string,
  "jobLocationReportSubmission": string,
  "completionReportSign": string,
  "jobCompletionDate": string (ISO date),
  "remarks": string,
  "swiftFocalPoint": string
}`;

// Best-effort: pull the first {...} block out of a model response that may be
// wrapped in markdown fences or prose despite being asked for raw JSON.
function extractJsonBlock(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return raw.slice(start, end + 1);
  return null;
}

export function parseExtractedFields(raw: string): ExtractedDocumentFields {
  const jsonText = extractJsonBlock(raw) ?? raw;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("The AI response was not valid JSON.");
  }

  const result: ExtractedDocumentFields = {};

  if (typeof parsed.vessel === "string" && parsed.vessel.trim()) result.vessel = parsed.vessel.trim();
  if (typeof parsed.engine === "string" && parsed.engine.trim()) result.engine = parsed.engine.trim();
  if (
    parsed.sector === "Marine Vessel" ||
    parsed.sector === "Offshore Rig" ||
    parsed.sector === "Onshore Unit"
  ) {
    result.sector = parsed.sector;
  }

  for (const key of TEXT_KEYS) {
    const value = parsed[key];
    if (typeof value === "string" && value.trim()) {
      (result as Record<string, string>)[key] = value.trim();
    }
  }

  for (const key of NUMBER_KEYS) {
    const value = parsed[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      (result as Record<string, number>)[key] = value;
    } else if (typeof value === "string" && value.trim()) {
      const numeric = Number(value.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(numeric)) (result as Record<string, number>)[key] = numeric;
    }
  }

  return result;
}

// Turns whatever the AI managed to find into a full WipFields record, falling back to
// sensible defaults for anything it couldn't extract. Shared by the admin and user upload
// flows so the same 20-odd field mapping isn't duplicated in both repos.
export function mergeWipFields(
  extracted: ExtractedDocumentFields | undefined,
  fallback: { contactName: string; modelName: string },
): WipFields {
  return {
    sNo: 0,
    customer: extracted?.customer ?? "",
    jobNo: extracted?.jobNo ?? "",
    model: extracted?.model || fallback.modelName,
    serialNo: extracted?.serialNo ?? "",
    assetId: extracted?.assetId ?? "",
    contactName: extracted?.contactName || fallback.contactName,
    jobOpeningDate: extracted?.jobOpeningDate || new Date().toISOString(),
    reqNo: extracted?.reqNo ?? "",
    poStatus: extracted?.poStatus ?? "Pending",
    poDate: extracted?.poDate ?? "",
    poNo: extracted?.poNo ?? "",
    poIssuedBy: extracted?.poIssuedBy ?? "",
    invoiceSubmissionStatus: extracted?.invoiceSubmissionStatus ?? "Not Submitted",
    paymentStatus: extracted?.paymentStatus ?? "Pending",
    invoiceNo: extracted?.invoiceNo ?? "",
    invoiceDate: extracted?.invoiceDate ?? "",
    swiftValue: extracted?.swiftValue ?? 0,
    idcValue: extracted?.idcValue ?? 0,
    scopeOfWork: extracted?.scopeOfWork ?? "",
    jobLocationReportSubmission: extracted?.jobLocationReportSubmission ?? "Pending",
    completionReportSign: extracted?.completionReportSign ?? "Pending",
    jobCompletionDate: extracted?.jobCompletionDate ?? "",
    remarks: extracted?.remarks ?? "",
    swiftFocalPoint: extracted?.swiftFocalPoint ?? "",
  };
}

export function buildExtractionPrompt(documentText: string): { system: string; user: string } {
  return {
    system:
      "You are a document-intelligence agent for IDC Swift, a marine & offshore engineering document portal. " +
      "You extract structured job/WIP metadata from uploaded engineering documents (engine overhaul logs, class " +
      "survey certificates, blueprints, OEM bulletins). Respond with ONLY a single raw JSON object matching the " +
      "given schema - no markdown fences, no commentary. Use an empty string \"\" for any text field you cannot " +
      "find in the document, and 0 for any numeric field you cannot find. Never invent values that are not " +
      "supported by the document text.",
    user:
      `Extract the following fields as JSON from this document:\n\n${EXTRACTION_JSON_SCHEMA_HINT}\n\n` +
      `--- DOCUMENT TEXT START ---\n${documentText}\n--- DOCUMENT TEXT END ---`,
  };
}
