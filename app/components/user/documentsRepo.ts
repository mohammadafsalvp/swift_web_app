// Data access for the document vault, shared by both the employee portal and the
// admin dashboard so an upload from either one shows up in both.
// Currently an in-memory mock; when the database is added, replace these function
// bodies with calls to API routes (e.g. GET/POST /api/documents, GET /api/documents/[id]/file)
// and keep the signatures so the UI does not change.

import type { UploadInput } from "../dashboard/UploadModal";
import { mergeWipFields } from "../../lib/documentExtraction";
import { currentUser, type CategoryKey, type JobAttachment, type UserDocument } from "./userData";

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
      sNo: 1,
      customer: "Stena Drilling",
      jobNo: "JOB-24-0112",
      model: "Wärtsilä 50DF",
      serialNo: "WD50-88214",
      assetId: "AST-11029",
      contactName: currentUser.name,
      jobOpeningDate: daysAgo(now, 1),
      reqNo: "REQ-5521",
      poStatus: "Pending",
      poDate: "",
      poNo: "",
      poIssuedBy: "",
      invoiceSubmissionStatus: "Not Submitted",
      paymentStatus: "Pending",
      invoiceNo: "",
      invoiceDate: "",
      swiftValue: 18500,
      idcValue: 15200,
      scopeOfWork: "Main generator overhaul & diagnostic survey",
      jobLocation: "Stena DrillMAX (Offshore)",
      reportSubmission: "Pending",
      completionReportSign: "Pending",
      jobCompletionDate: "",
      remarks: "Awaiting turbocharger spares",
      swiftFocalPoint: "Marcus Vance",
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
      sNo: 2,
      customer: "Maersk Line",
      jobNo: "JOB-24-0098",
      model: "MAN B&W 6S70ME-C8.2",
      serialNo: "MB70-55310",
      assetId: "AST-10877",
      contactName: "Craig Howard",
      jobOpeningDate: daysAgo(now, 8),
      reqNo: "REQ-5478",
      poStatus: "Issued",
      poDate: daysAgo(now, 5),
      poNo: "PO-88231",
      poIssuedBy: "Maersk Procurement",
      invoiceSubmissionStatus: "Submitted",
      paymentStatus: "Pending",
      invoiceNo: "INV-33021",
      invoiceDate: daysAgo(now, 1),
      swiftValue: 42300,
      idcValue: 36900,
      scopeOfWork: "Crankshaft & bearing clearance inspection",
      jobLocation: "Maersk Mc-Kinney (Tanker)",
      reportSubmission: "Submitted",
      completionReportSign: "Signed",
      jobCompletionDate: daysAgo(now, 2),
      remarks: "Class surveyor witnessed final checks",
      swiftFocalPoint: "Marcus Vance",
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
      sNo: 3,
      customer: "Bergen Offshore AS",
      jobNo: "JOB-24-0121",
      model: "Rolls-Royce Bergen B32:40",
      serialNo: "RRB32-24471",
      assetId: "AST-11104",
      contactName: "Timothy Hines",
      jobOpeningDate: daysAgo(now, 3),
      reqNo: "REQ-5539",
      poStatus: "Not Received",
      poDate: "",
      poNo: "",
      poIssuedBy: "",
      invoiceSubmissionStatus: "Not Submitted",
      paymentStatus: "Pending",
      invoiceNo: "",
      invoiceDate: "",
      swiftValue: 9800,
      idcValue: 8100,
      scopeOfWork: "Cylinder head assembly drawing review",
      jobLocation: "Bergen Rig Alpha",
      reportSubmission: "Pending",
      completionReportSign: "Pending",
      jobCompletionDate: "",
      remarks: "Waiting on customer PO confirmation",
      swiftFocalPoint: "Edgar Humbert",
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
      sNo: 4,
      customer: "CMA CGM",
      jobNo: "JOB-24-0083",
      model: "CAT C32 Marine Turbo",
      serialNo: "CATC32-90142",
      assetId: "AST-10655",
      contactName: "Lisa Collins",
      jobOpeningDate: daysAgo(now, 12),
      reqNo: "REQ-5390",
      poStatus: "Issued",
      poDate: daysAgo(now, 10),
      poNo: "PO-88109",
      poIssuedBy: "CMA CGM Procurement",
      invoiceSubmissionStatus: "Submitted",
      paymentStatus: "Received",
      invoiceNo: "INV-32877",
      invoiceDate: daysAgo(now, 4),
      swiftValue: 12750,
      idcValue: 10400,
      scopeOfWork: "Turbocharger service bulletin compliance check",
      jobLocation: "CMA CGM Fort Royal",
      reportSubmission: "Submitted",
      completionReportSign: "Signed",
      jobCompletionDate: daysAgo(now, 5),
      remarks: "",
      swiftFocalPoint: "Marcus Vance",
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
      sNo: 5,
      customer: "Rotterdam Drydock Co.",
      jobNo: "JOB-24-0067",
      model: "Sulzer RTA96-C",
      serialNo: "SRTA96-77820",
      assetId: "AST-10391",
      contactName: "Marcus Vance",
      jobOpeningDate: daysAgo(now, 20),
      reqNo: "REQ-5301",
      poStatus: "Issued",
      poDate: daysAgo(now, 18),
      poNo: "PO-87980",
      poIssuedBy: "Rotterdam Drydock Co.",
      invoiceSubmissionStatus: "Submitted",
      paymentStatus: "Received",
      invoiceNo: "INV-32410",
      invoiceDate: daysAgo(now, 12),
      swiftValue: 61200,
      idcValue: 52800,
      scopeOfWork: "Class certification survey & DNV verification",
      jobLocation: "Rotterdam Drydock 7",
      reportSubmission: "Submitted",
      completionReportSign: "Signed",
      jobCompletionDate: daysAgo(now, 9),
      remarks: "Verified & classed by DNV",
      swiftFocalPoint: "Marcus Vance",
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
      sNo: 6,
      customer: "Maersk Line",
      jobNo: "JOB-24-0071",
      model: "Wärtsilä 12V32",
      serialNo: "W12V32-40218",
      assetId: "AST-10502",
      contactName: currentUser.name,
      jobOpeningDate: daysAgo(now, 15),
      reqNo: "REQ-5344",
      poStatus: "Issued",
      poDate: daysAgo(now, 13),
      poNo: "PO-88012",
      poIssuedBy: "Maersk Procurement",
      invoiceSubmissionStatus: "Submitted",
      paymentStatus: "Received",
      invoiceNo: "INV-32690",
      invoiceDate: daysAgo(now, 10),
      swiftValue: 7400,
      idcValue: 6100,
      scopeOfWork: "Fuel pump exploded-view drawing package",
      jobLocation: "Maersk Mc-Kinney (Tanker)",
      reportSubmission: "Submitted",
      completionReportSign: "Signed",
      jobCompletionDate: daysAgo(now, 12),
      remarks: "",
      swiftFocalPoint: "Marcus Vance",
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
      sNo: 7,
      customer: "Bergen Offshore AS",
      jobNo: "JOB-24-0055",
      model: "CAT 3516B Genset",
      serialNo: "C3516B-61094",
      assetId: "AST-10218",
      contactName: "Timothy Hines",
      jobOpeningDate: daysAgo(now, 19),
      reqNo: "REQ-5288",
      poStatus: "Issued",
      poDate: daysAgo(now, 17),
      poNo: "PO-87901",
      poIssuedBy: "Bergen Offshore AS",
      invoiceSubmissionStatus: "Submitted",
      paymentStatus: "Received",
      invoiceNo: "INV-32288",
      invoiceDate: daysAgo(now, 15),
      swiftValue: 5100,
      idcValue: 4200,
      scopeOfWork: "Quarterly running hours & fuel consumption log",
      jobLocation: "Bergen Rig Alpha",
      reportSubmission: "Submitted",
      completionReportSign: "Signed",
      jobCompletionDate: daysAgo(now, 16),
      remarks: "",
      swiftFocalPoint: "Edgar Humbert",
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
      sNo: 8,
      customer: "CMA CGM",
      jobNo: "JOB-24-0031",
      model: "Hull & Machinery Survey",
      serialNo: "HMS-2024-0031",
      assetId: "AST-09984",
      contactName: "Lisa Collins",
      jobOpeningDate: daysAgo(now, 30),
      reqNo: "REQ-5190",
      poStatus: "Issued",
      poDate: daysAgo(now, 28),
      poNo: "PO-87604",
      poIssuedBy: "CMA CGM Procurement",
      invoiceSubmissionStatus: "Submitted",
      paymentStatus: "Received",
      invoiceNo: "INV-31820",
      invoiceDate: daysAgo(now, 25),
      swiftValue: 15600,
      idcValue: 13000,
      scopeOfWork: "DNV hull & machinery class survey",
      jobLocation: "CMA CGM Fort Royal",
      reportSubmission: "Submitted",
      completionReportSign: "Signed",
      jobCompletionDate: daysAgo(now, 24),
      remarks: "Verified & classed by DNV",
      swiftFocalPoint: "Marcus Vance",
    },
  ];
}

// The admin dashboard and employee portal are separate pages with no client-side link
// between them, so a plain in-memory variable would reset on every navigation between
// them. Persisting to localStorage keeps the list in sync across page loads and tabs on
// the same origin (still a mock: replace with a real API once a database is added).
const STORAGE_KEY = "idc-swift-documents";

let store: UserDocument[] | null = null;

function loadPersisted(): UserDocument[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserDocument[]) : null;
  } catch {
    return null;
  }
}

function persist(docs: UserDocument[]) {
  if (typeof window === "undefined") return;
  try {
    // objectUrl (blob:) URLs die with the tab that created them, so they're dropped here;
    // getDocumentFile() already falls back to a generated placeholder when one is absent.
    const persistable = docs.map((doc) => {
      const copy: Partial<UserDocument> = { ...doc };
      delete copy.objectUrl;
      if (copy.attachments) {
        copy.attachments = copy.attachments.map((att) => {
          const attCopy = { ...att };
          delete attCopy.objectUrl;
          return attCopy;
        });
      }
      return copy;
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // best-effort (e.g. storage quota/private browsing) - in-memory state still works
  }
}

function ensureStore(): UserDocument[] {
  if (!store) {
    store = loadPersisted() ?? seedDocuments(Date.now());
  }
  // Ensure every document has its attachments array initialized with its primary document
  for (const doc of store) {
    if (!doc.attachments || doc.attachments.length === 0) {
      doc.attachments = [
        {
          id: doc.id,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          sizeBytes: doc.sizeBytes,
          category: doc.category,
          uploadedBy: doc.uploadedBy,
          uploadedAt: doc.uploadedAt,
          objectUrl: doc.objectUrl,
        },
      ];
    }
  }
  return store;
}

export async function listDocuments(): Promise<UserDocument[]> {
  const current = ensureStore();
  // Sort descending by uploadedAt (newest first)
  const sorted = [...current].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  // Cleanly re-assign sequential S.No: 1, 2, 3, 4... N
  return sorted.map((doc, idx) => ({
    ...doc,
    sNo: idx + 1,
  }));
}

// Set of active listeners in current page
const subscribers = new Set<() => void>();
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    broadcastChannel = new BroadcastChannel("idc-swift-sync-v1");
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === "SYNC") {
        store = null; // bust local in-memory cache
        subscribers.forEach((cb) => {
          try {
            cb();
          } catch {}
        });
      }
    };
  } catch {}
}

export function notifySync(): void {
  store = null;
  // 1. Notify local subscribers in this tab/portal
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
  // 2. Broadcast to all other tabs/windows
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: "SYNC", timestamp: Date.now() });
    } catch {}
  }
}

// Fires when the other portal (a different tab, window, or route) uploads or
// deletes or edits a document, so open portals update live without reload.
export function subscribeToChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers.add(onChange);

  function handleStorage(e: StorageEvent) {
    if (e.key !== STORAGE_KEY) return;
    store = null; // drop the stale in-memory cache so the next listDocuments() re-reads it
    onChange();
  }

  function handleVisibilityOrFocus() {
    store = null;
    onChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener("focus", handleVisibilityOrFocus);
  document.addEventListener("visibilitychange", handleVisibilityOrFocus);

  return () => {
    subscribers.delete(onChange);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("focus", handleVisibilityOrFocus);
    document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
  };
}

// `uploadedBy` lets callers outside the employee portal (e.g. the admin dashboard)
// attribute the upload to something other than the mock logged-in employee, while
// still sharing this single in-memory store so uploads from either portal show up in both.
export async function addDocument(
  input: UploadInput,
  uploadedBy: string = currentUser.name,
): Promise<UserDocument> {
  const now = new Date().toISOString();
  const currentStore = ensureStore();
  const extracted = input.extractedFields;
  const incomingFiles = input.files && input.files.length > 0 ? input.files : [input.file];

  const targetJobNo = (input.jobNo || extracted?.jobNo || "").trim().toLowerCase();
  // Check if job already exists by targetJobId or matching jobNo
  const existingJob =
    (input.targetJobId ? currentStore.find((d) => d.id === input.targetJobId) : null) ??
    (targetJobNo ? currentStore.find((d) => d.jobNo && d.jobNo.trim().toLowerCase() === targetJobNo) : null);

  if (existingJob) {
    // Add file(s) as attachments to existing job — do not create duplicate job row!
    const newAttachments: JobAttachment[] = incomingFiles.map((f) => ({
      id: `#DOC-${Math.floor(1_000_000 + Math.random() * 9_000_000)}`,
      fileName: f.name,
      mimeType: f.type || "application/octet-stream",
      sizeBytes: f.size,
      category: (input.category as CategoryKey | null) ?? existingJob.category ?? "engine-log",
      uploadedBy,
      uploadedAt: now,
      objectUrl: URL.createObjectURL(f),
    }));

    if (!existingJob.attachments || existingJob.attachments.length === 0) {
      existingJob.attachments = [
        {
          id: existingJob.id,
          fileName: existingJob.fileName,
          mimeType: existingJob.mimeType,
          sizeBytes: existingJob.sizeBytes,
          category: existingJob.category,
          uploadedBy: existingJob.uploadedBy,
          uploadedAt: existingJob.uploadedAt,
          objectUrl: existingJob.objectUrl,
        },
      ];
    }

    // Prepend new attachments so newest files are shown first
    existingJob.attachments = [...newAttachments, ...existingJob.attachments];
    // Update active file pointers to the newest attachment
    existingJob.fileName = newAttachments[0].fileName;
    existingJob.mimeType = newAttachments[0].mimeType;
    existingJob.sizeBytes = newAttachments[0].sizeBytes;
    existingJob.objectUrl = newAttachments[0].objectUrl;
    existingJob.uploadedAt = now;

    // Fill any missing metadata from form or extraction
    if (!existingJob.customer && (input.customerName || extracted?.customer)) {
      existingJob.customer = input.customerName || extracted?.customer || "";
    }
    if (!existingJob.scopeOfWork && (input.scopeOfWork || extracted?.scopeOfWork)) {
      existingJob.scopeOfWork = input.scopeOfWork || extracted?.scopeOfWork || "";
    }
    if (!existingJob.model && (input.engineModel || extracted?.model)) {
      existingJob.model = input.engineModel || extracted?.model || "";
    }

    persist(currentStore);
    notifySync();
    return existingJob;
  }

  // Merge AI-extracted fields; use the manually entered form values as fallbacks
  const wip = mergeWipFields(
    {
      ...extracted,
      customer: extracted?.customer || input.customerName || "",
      jobNo: extracted?.jobNo || input.jobNo || "",
      scopeOfWork: extracted?.scopeOfWork || input.scopeOfWork || "",
    },
    {
      contactName: uploadedBy,
      modelName: input.engineModel,
    },
  );

  const initialAttachments: JobAttachment[] = incomingFiles.map((f) => ({
    id: `#DOC-${Math.floor(1_000_000 + Math.random() * 9_000_000)}`,
    fileName: f.name,
    mimeType: f.type || "application/octet-stream",
    sizeBytes: f.size,
    category: (input.category as CategoryKey | null) ?? "engine-log",
    uploadedBy,
    uploadedAt: now,
    objectUrl: URL.createObjectURL(f),
  }));

  const doc: UserDocument = {
    ...wip,
    sNo: 1, // Will be ordered properly in listDocuments()
    id: `#DOC-${Math.floor(1_000_000 + Math.random() * 9_000_000)}`,
    fileName: incomingFiles[0].name,
    mimeType: incomingFiles[0].type || "application/octet-stream",
    sizeBytes: incomingFiles[0].size,
    category: (input.category as CategoryKey | null) ?? "engine-log",
    sector: extracted?.sector ?? input.sector,
    vessel: input.vesselName || input.customerName || "Marine Vessel",
    engine: input.engineModel,
    uploadedBy,
    uploadedAt: now,
    status: "review",
    objectUrl: initialAttachments[0].objectUrl,
    attachments: initialAttachments,
  };

  store = [doc, ...currentStore];
  persist(store);
  notifySync();
  return doc;
}

export async function updateDocument(
  id: string,
  updates: Partial<UserDocument>,
): Promise<UserDocument | null> {
  const current = ensureStore();
  const index = current.findIndex((d) => d.id === id || (updates.jobNo && d.jobNo === updates.jobNo));
  if (index === -1) return null;

  const existing = current[index];
  const updated: UserDocument = {
    ...existing,
    ...updates,
    attachments: updates.attachments ?? existing.attachments,
  };
  current[index] = updated;
  persist(current);
  notifySync();
  return updated;
}

export async function deleteDocument(id: string): Promise<void> {
  store = ensureStore().filter((doc) => doc.id !== id);
  persist(store);
  notifySync();
}

// Returns the file contents to download. Mock seed documents have no stored file,
// so a placeholder text file with their metadata is generated instead.
export async function getDocumentFile(
  doc: UserDocument,
  attachmentId?: string,
): Promise<{ url: string; fileName: string; revoke: boolean }> {
  // If specific attachment requested
  const att = attachmentId && doc.attachments ? doc.attachments.find((a) => a.id === attachmentId) : null;
  if (att) {
    if (att.objectUrl) return { url: att.objectUrl, fileName: att.fileName, revoke: false };
    const text = [
      "IDC Swift — Document Attachment",
      "",
      `Job No:      ${doc.jobNo || doc.id}`,
      `File name:   ${att.fileName}`,
      `Category:    ${att.category || doc.category}`,
      `Uploaded by: ${att.uploadedBy}`,
      `Uploaded at: ${att.uploadedAt}`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    return { url: URL.createObjectURL(blob), fileName: `${att.fileName}.txt`, revoke: true };
  }

  if (doc.objectUrl) return { url: doc.objectUrl, fileName: doc.fileName, revoke: false };

  const text = [
    "IDC Swift — placeholder download (mock data, no stored file yet)",
    "",
    `Document ID: ${doc.id}`,
    `Job No:      ${doc.jobNo}`,
    `File name:   ${doc.fileName}`,
    `Vessel:      ${doc.vessel}`,
    `Engine:      ${doc.engine}`,
    `Uploaded by: ${doc.uploadedBy}`,
    `Uploaded at: ${doc.uploadedAt}`,
  ].join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  return { url: URL.createObjectURL(blob), fileName: `${doc.fileName}.txt`, revoke: true };
}

export async function downloadDocument(doc: UserDocument, attachmentId?: string): Promise<void> {
  const { url, fileName, revoke } = await getDocumentFile(doc, attachmentId);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadAttachment(doc: UserDocument, attachment: JobAttachment): Promise<void> {
  return downloadDocument(doc, attachment.id);
}
