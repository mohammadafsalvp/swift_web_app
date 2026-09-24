// Data access for the employee portal.
// Currently an in-memory mock; when the database is added, replace these function
// bodies with calls to API routes (e.g. GET/POST /api/documents, GET /api/documents/[id]/file)
// and keep the signatures so the UI does not change.

import type { UploadInput } from "../dashboard/UploadModal";
import { currentUser, type CategoryKey, type UserDocument } from "./userData";

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(now: number, days: number): string {
  return new Date(now - days * DAY).toISOString();
}

function seedDocuments(now: number): UserDocument[] {
  return [
    {
      id: "#DOC-5520913",
      fileName: "Stena_DrillMAX_50DF_overhaul_log.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2_480_000,
      category: "engine-log",
      sector: "Offshore Rig",
      vessel: "Stena DrillMAX (Offshore)",
      flag: "\u{1F1EC}\u{1F1E7}",
      flagLabel: "UK",
      engine: "Wärtsilä 50DF Main Gen",
      uploadedBy: currentUser.name,
      uploadedAt: daysAgo(now, 1),
      status: "review",
    },
    {
      id: "#DOC-1838967",
      fileName: "6S70ME-C8_crankshaft_inspection.pdf",
      mimeType: "application/pdf",
      sizeBytes: 4_120_000,
      category: "inspection",
      sector: "Marine Vessel",
      vessel: "Maersk Mc-Kinney (Tanker)",
      flag: "\u{1F1E9}\u{1F1F0}",
      flagLabel: "Denmark",
      engine: "MAN B&W 6S70ME-C8.2",
      uploadedBy: "Craig Howard",
      uploadedAt: daysAgo(now, 2),
      status: "approved",
    },
    {
      id: "#DOC-2671893",
      fileName: "B32-40_cylinder_head_assembly.dwg",
      mimeType: "application/acad",
      sizeBytes: 8_950_000,
      category: "blueprint",
      sector: "Offshore Rig",
      vessel: "Bergen Rig Alpha",
      flag: "\u{1F1F3}\u{1F1F4}",
      flagLabel: "Norway",
      engine: "Rolls-Royce Bergen B32:40",
      uploadedBy: "Timothy Hines",
      uploadedAt: daysAgo(now, 3),
      status: "review",
    },
    {
      id: "#DOC-9426253",
      fileName: "C32_turbo_service_bulletin.pdf",
      mimeType: "application/pdf",
      sizeBytes: 960_000,
      category: "bulletin",
      sector: "Marine Vessel",
      vessel: "CMA CGM Fort Royal",
      flag: "\u{1F1EB}\u{1F1F7}",
      flagLabel: "France",
      engine: "CAT C32 Marine Turbo",
      uploadedBy: "Lisa Collins",
      uploadedAt: daysAgo(now, 5),
      status: "approved",
    },
    {
      id: "#DOC-4819024",
      fileName: "RTA96-C_class_certificate_2024.pdf",
      mimeType: "application/pdf",
      sizeBytes: 640_000,
      category: "certificate",
      sector: "Onshore Unit",
      vessel: "Rotterdam Drydock 7",
      flag: "\u{1F1F3}\u{1F1F1}",
      flagLabel: "Netherlands",
      engine: "Sulzer RTA96-C Class Cert",
      uploadedBy: "Marcus Vance (Lead)",
      uploadedAt: daysAgo(now, 9),
      status: "verified",
    },
    {
      id: "#DOC-7310458",
      fileName: "12V32_fuel_pump_exploded_view.step",
      mimeType: "application/step",
      sizeBytes: 12_300_000,
      category: "blueprint",
      sector: "Marine Vessel",
      vessel: "Maersk Mc-Kinney (Tanker)",
      flag: "\u{1F1E9}\u{1F1F0}",
      flagLabel: "Denmark",
      engine: "Wärtsilä 12V32",
      uploadedBy: currentUser.name,
      uploadedAt: daysAgo(now, 12),
      status: "approved",
    },
    {
      id: "#DOC-6082741",
      fileName: "CAT3516_running_hours_Q3.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sizeBytes: 310_000,
      category: "engine-log",
      sector: "Offshore Rig",
      vessel: "Bergen Rig Alpha",
      flag: "\u{1F1F3}\u{1F1F4}",
      flagLabel: "Norway",
      engine: "CAT 3516B Genset",
      uploadedBy: "Timothy Hines",
      uploadedAt: daysAgo(now, 16),
      status: "approved",
    },
    {
      id: "#DOC-3395610",
      fileName: "Fort_Royal_DNV_hull_survey.pdf",
      mimeType: "application/pdf",
      sizeBytes: 5_700_000,
      category: "certificate",
      sector: "Marine Vessel",
      vessel: "CMA CGM Fort Royal",
      flag: "\u{1F1EB}\u{1F1F7}",
      flagLabel: "France",
      engine: "Hull & Machinery Survey",
      uploadedBy: "Lisa Collins",
      uploadedAt: daysAgo(now, 24),
      status: "verified",
    },
  ];
}

let store: UserDocument[] | null = null;

export async function listDocuments(): Promise<UserDocument[]> {
  if (!store) store = seedDocuments(Date.now());
  return [...store].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function addDocument(input: UploadInput): Promise<UserDocument> {
  const doc: UserDocument = {
    id: `#DOC-${Math.floor(1_000_000 + Math.random() * 9_000_000)}`,
    fileName: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    sizeBytes: input.file.size,
    category: (input.category as CategoryKey | null) ?? "engine-log",
    sector: input.sector,
    vessel: input.vesselName,
    engine: input.engineModel,
    uploadedBy: currentUser.name,
    uploadedAt: new Date().toISOString(),
    status: "review",
    objectUrl: URL.createObjectURL(input.file),
  };
  store = [doc, ...(store ?? [])];
  return doc;
}

// Returns the file contents to download. Mock seed documents have no stored file,
// so a placeholder text file with their metadata is generated instead.
export async function getDocumentFile(doc: UserDocument): Promise<{ url: string; fileName: string; revoke: boolean }> {
  if (doc.objectUrl) return { url: doc.objectUrl, fileName: doc.fileName, revoke: false };

  const text = [
    "IDC Swift — placeholder download (mock data, no stored file yet)",
    "",
    `Document ID: ${doc.id}`,
    `File name:   ${doc.fileName}`,
    `Vessel:      ${doc.vessel}`,
    `Engine:      ${doc.engine}`,
    `Uploaded by: ${doc.uploadedBy}`,
    `Uploaded at: ${doc.uploadedAt}`,
  ].join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  return { url: URL.createObjectURL(blob), fileName: `${doc.fileName}.txt`, revoke: true };
}

export async function downloadDocument(doc: UserDocument): Promise<void> {
  const { url, fileName, revoke } = await getDocumentFile(doc);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
