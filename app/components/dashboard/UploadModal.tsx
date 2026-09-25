"use client";

import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import { IconClose, IconUploadCloud } from "./icons";
import type { ExtractedDocumentFields } from "../../lib/documentExtraction";
import type { UserDocument } from "../user/userData";

export const sectors = ["Marine Vessel", "Offshore Rig", "Onshore Unit"] as const;
export type Sector = (typeof sectors)[number];

export interface UploadInput {
  sector: Sector;
  /** Engine / equipment model — maps to WipFields.model */
  engineModel: string;
  /** Vessel / rig name — kept for documentsRepo.vessel */
  vesselName: string;
  /** Customer name — maps to WipFields.customer */
  customerName: string;
  /** Job number — maps to WipFields.jobNo */
  jobNo: string;
  /** Scope of work — maps to WipFields.scopeOfWork */
  scopeOfWork: string;
  category: string | null;
  file: File;
  /** Multi-file uploads for the same job */
  files?: File[];
  /** If uploading to an existing job, its ID */
  targetJobId?: string;
  // populated when the AI was able to read job/WIP details out of the file
  extractedFields?: ExtractedDocumentFields;
}

const ANALYZABLE_EXTENSIONS = [".pdf", ".docx", ".txt"];

function isAnalyzable(file: File): boolean {
  const name = file.name.toLowerCase();
  return ANALYZABLE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Fields shown in the AI extraction preview panel (most important WIP fields)
const EXTRACTED_PREVIEW_FIELDS: { key: keyof ExtractedDocumentFields; label: string }[] = [
  { key: "jobNo", label: "Job No" },
  { key: "customer", label: "Customer" },
  { key: "model", label: "Equipment Model" },
  { key: "serialNo", label: "Serial No" },
  { key: "quotationStatus", label: "Quotation Status" },
  { key: "poStatus", label: "PO Status" },
  { key: "paymentStatus", label: "Payment Status" },
  { key: "invoiceNo", label: "Invoice No" },
  { key: "scopeOfWork", label: "Scope of Work" },
  { key: "swiftFocalPoint", label: "Swift Focal Point" },
];

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  // when provided, a file is required and the form data is handed back to the caller
  onUpload?: (input: UploadInput) => void | Promise<void>;
  // when provided, shows a document category selector (user portal)
  categories?: readonly { key: string; label: string }[];
  /** List of all existing jobs for linking new documents to existing jobs */
  existingJobs?: UserDocument[];
  /** When opened from a specific job row's "+ Add Doc" button */
  targetJob?: UserDocument | null;
}

export default function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  onUpload,
  categories,
  existingJobs = [],
  targetJob = null,
}: UploadModalProps) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [sector, setSector] = useState<Sector>("Marine Vessel");
  const [customerName, setCustomerName] = useState("");
  const [jobNo, setJobNo] = useState("");
  const [engineModel, setEngineModel] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [category, setCategory] = useState(categories?.[0]?.key ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedDocumentFields | null>(null);

  // Sync targetJob if provided
  useEffect(() => {
    if (targetJob) {
      setMode("existing");
      setSelectedJobId(targetJob.id);
      setJobNo(targetJob.jobNo || "");
      setCustomerName(targetJob.customer || "");
      setEngineModel(targetJob.model || targetJob.engine || "");
      setScopeOfWork(targetJob.scopeOfWork || "");
      setSector(targetJob.sector || "Marine Vessel");
    }
  }, [targetJob]);

  if (!isOpen) return null;

  function resetForm() {
    setMode("new");
    setSelectedJobId("");
    setSector("Marine Vessel");
    setCustomerName("");
    setJobNo("");
    setEngineModel("");
    setScopeOfWork("");
    setCategory(categories?.[0]?.key ?? "");
    setFiles([]);
    setError(null);
    setExtracting(false);
    setExtractError(null);
    setExtractedFields(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSelectExistingJob(jobId: string) {
    setSelectedJobId(jobId);
    const found = existingJobs.find((j) => j.id === jobId);
    if (found) {
      setJobNo(found.jobNo || "");
      setCustomerName(found.customer || "");
      setEngineModel(found.model || found.engine || "");
      setScopeOfWork(found.scopeOfWork || "");
      setSector(found.sector || "Marine Vessel");
    }
  }

  async function analyzeFile(selected: File) {
    setExtracting(true);
    setExtractError(null);
    setExtractedFields(null);
    try {
      const body = new FormData();
      body.append("file", selected);
      const res = await fetch("/api/analyze-document", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not analyze this document.");
      const fields: ExtractedDocumentFields = data.fields ?? {};
      setExtractedFields(fields);
      // Auto-fill visible form fields from AI extraction (user can still override)
      if (fields.sector) setSector(fields.sector);
      if (fields.customer) setCustomerName(fields.customer);
      if (fields.jobNo) {
        setJobNo(fields.jobNo);
        // Check if extracted jobNo matches an existing job!
        const match = existingJobs.find(
          (j) => j.jobNo && j.jobNo.trim().toLowerCase() === fields.jobNo?.trim().toLowerCase(),
        );
        if (match) {
          setSelectedJobId(match.id);
        }
      }
      if (fields.engine) setEngineModel(fields.engine);
      else if (fields.model) setEngineModel(fields.model);
      if (fields.scopeOfWork) setScopeOfWork(fields.scopeOfWork);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Could not analyze this document.");
    } finally {
      setExtracting(false);
    }
  }

  function handleFilesAdded(incoming: FileList | File[]) {
    const arr = Array.from(incoming);
    if (!arr.length) return;
    setError(null);

    // Merge new files preventing duplicates by name and size
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const fresh = arr.filter((f) => !existingNames.has(`${f.name}-${f.size}`));
      return [...prev, ...fresh];
    });

    // Run AI analysis on the first analyzable file if not already extracted
    const analyzable = arr.find((f) => isAnalyzable(f));
    if (analyzable && !extractedFields && mode === "new") {
      void analyzeFile(analyzable);
    }
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFilesAdded(e.dataTransfer.files);
    }
  }

  // Detect if current typed jobNo matches an existing job
  const matchedExistingJob =
    mode === "new" && jobNo.trim()
      ? existingJobs.find(
          (j) => j.jobNo && j.jobNo.trim().toLowerCase() === jobNo.trim().toLowerCase(),
        )
      : null;

  const currentTargetJob =
    (selectedJobId ? existingJobs.find((j) => j.id === selectedJobId) : null) ??
    matchedExistingJob ??
    targetJob;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (onUpload) {
      if (files.length === 0) {
        setError("Please attach at least one file to upload.");
        return;
      }
      await onUpload({
        sector,
        customerName,
        jobNo,
        engineModel,
        scopeOfWork,
        vesselName: extractedFields?.vessel ?? customerName ?? engineModel,
        category: categories ? category : null,
        file: files[0],
        files,
        targetJobId: currentTargetJob?.id,
        extractedFields: extractedFields ?? undefined,
      });

      if (currentTargetJob) {
        onSuccess(
          `Attached ${files.length} document${files.length > 1 ? "s" : ""} to existing job ${
            currentTargetJob.jobNo || currentTargetJob.customer
          }.`,
        );
      } else {
        onSuccess(
          `Registered job ${jobNo || "new"} with ${files.length} document${
            files.length > 1 ? "s" : ""
          } in IDC Swift.`,
        );
      }
    } else {
      onSuccess(`Job ${jobNo || engineModel} was registered to the IDC vault.`);
    }
    resetForm();
    onClose();
  }

  const extractedCount = extractedFields
    ? Object.keys(extractedFields).filter(
        (k) =>
          (extractedFields as Record<string, unknown>)[k] !== "" &&
          (extractedFields as Record<string, unknown>)[k] !== 0 &&
          (extractedFields as Record<string, unknown>)[k] != null,
      ).length
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="uploadModalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-modal">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 id="uploadModalTitle" className="text-headline-sm text-text-primary">
              {currentTargetJob
                ? `Attach Documents to Job ${currentTargetJob.jobNo || ""}`
                : "Upload Job Documents"}
            </h3>
            <p className="text-body-sm text-text-secondary">
              {currentTargetJob
                ? `Add multiple documents to existing job for ${currentTargetJob.customer || "client"}`
                : "Upload single or multiple documents for a new or existing job"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close upload modal"
            onClick={handleClose}
            className="rounded-lg p-2 text-placeholder transition hover:bg-surface-inset hover:text-text-primary"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {/* ── Job Mode Selector (New vs Add to Existing) ── */}
        {!targetJob && existingJobs.length > 0 && (
          <div className="mt-4 flex rounded-lg border border-border bg-surface-inset p-1">
            <button
              type="button"
              onClick={() => {
                setMode("new");
                setSelectedJobId("");
              }}
              className={`flex-1 rounded-md py-1.5 text-center text-label-sm font-medium transition ${
                mode === "new"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              + Create New Job
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("existing");
                if (existingJobs[0]) handleSelectExistingJob(existingJobs[0].id);
              }}
              className={`flex-1 rounded-md py-1.5 text-center text-label-sm font-medium transition ${
                mode === "existing"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              📎 Add to Existing Job ({existingJobs.length})
            </button>
          </div>
        )}

        {/* Existing Job Selector */}
        {mode === "existing" && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
            <label htmlFor="selectExistingJob" className="mb-1 block text-label-md font-semibold text-text-primary">
              Select Target Job
            </label>
            <select
              id="selectExistingJob"
              value={selectedJobId}
              onChange={(e) => handleSelectExistingJob(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface p-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {existingJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.jobNo || "No Job #"} — {j.customer || "Unknown Client"} ({j.model || j.engine || "Equipment"}) [{j.attachments?.length ?? 1} docs]
                </option>
              ))}
            </select>
            {currentTargetJob && (
              <div className="mt-2.5 flex items-center justify-between text-label-sm text-text-secondary">
                <span>Current docs: <strong className="text-text-primary">{currentTargetJob.attachments?.length ?? 1}</strong></span>
                <span>Job opened: <strong className="text-text-primary">{new Date(currentTargetJob.jobOpeningDate).toLocaleDateString("en-GB")}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Banner if matched existing job while typing in new mode */}
        {matchedExistingJob && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/10 px-3.5 py-2.5 text-label-sm text-secondary">
            <span>ℹ️</span>
            <span>
              Job <strong>{matchedExistingJob.jobNo}</strong> exists for <strong>{matchedExistingJob.customer}</strong>. Uploaded files will attach directly to this job.
            </span>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {/* ── Asset Sector ── */}
          <div>
            <label className="mb-1 block text-label-md text-text-primary">Asset Sector</label>
            <div className="grid grid-cols-3 gap-2">
              {sectors.map((s) => (
                <label
                  key={s}
                  className={`cursor-pointer rounded-lg border p-2 text-center text-label-sm font-medium transition ${
                    sector === s
                      ? "border-primary bg-primary text-white"
                      : "border-border text-text-primary hover:bg-surface-inset"
                  }`}
                >
                  <input
                    type="radio"
                    name="sector"
                    value={s}
                    checked={sector === s}
                    onChange={() => setSector(s)}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* ── Document Category (user portal only) ── */}
          {categories ? (
            <div>
              <label htmlFor="docCategory" className="mb-1 block text-label-md text-text-primary">
                Document Category
              </label>
              <select
                id="docCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface p-2.5 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* ── Job No + Customer Name ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="uploadJobNo" className="mb-1 block text-label-md text-text-primary">
                Job No
              </label>
              <input
                id="uploadJobNo"
                type="text"
                value={jobNo}
                onChange={(e) => setJobNo(e.target.value)}
                placeholder="e.g. JOB-24-0112"
                className="w-full rounded-lg border border-border bg-surface p-2.5 text-body-sm text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="uploadCustomer" className="mb-1 block text-label-md text-text-primary">
                Customer Name
              </label>
              <input
                id="uploadCustomer"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Maersk Line"
                className="w-full rounded-lg border border-border bg-surface p-2.5 text-body-sm text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* ── Engine / Equipment Model ── */}
          <div>
            <label htmlFor="uploadEngineModel" className="mb-1 block text-label-md text-text-primary">
              Engine / Equipment Model
            </label>
            <input
              id="uploadEngineModel"
              type="text"
              value={engineModel}
              onChange={(e) => setEngineModel(e.target.value)}
              placeholder="e.g. Wärtsilä 50DF · MAN B&W 6S70ME-C8.2"
              className="w-full rounded-lg border border-border bg-surface p-2.5 text-body-sm text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* ── Scope of Work ── */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="uploadScopeOfWork" className="block text-label-md text-text-primary">
                Scope of Work
              </label>
              {extractedFields?.scopeOfWork ? (
                <span className="inline-flex items-center gap-1 rounded bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary">
                  ✓ Auto-filled by AI from quotation / document
                </span>
              ) : (
                <span className="text-[11px] text-text-secondary">
                  Quotation optional · Enter manually if not required
                </span>
              )}
            </div>
            <textarea
              id="uploadScopeOfWork"
              rows={2}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="e.g. Main generator overhaul & diagnostic survey, cylinder head review (auto-fills from quotation if uploaded, or type manually)…"
              className="w-full resize-none rounded-lg border border-border bg-surface p-2.5 text-body-sm text-text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* ── File Upload Zone (Supports Multiple Files) ── */}
          <div>
            <p className="mb-1 text-label-md text-text-primary">
              Attach Documents (One or Multiple)
              <span className="ml-1.5 text-body-sm font-normal text-text-secondary">
                — all attached to this job
              </span>
            </p>
            <label
              htmlFor="hiddenFileInput"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`block cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition hover:border-primary hover:bg-tertiary/40 ${
                isDragging ? "border-primary bg-tertiary/40" : "border-border bg-surface-inset"
              }`}
            >
              <IconUploadCloud className="mx-auto mb-2 h-7 w-7 text-placeholder" />
              <p className="text-label-md text-text-primary">
                Click or drag files here (multiple supported)
              </p>
              <p className="mt-1 text-[11px] text-placeholder">
                PDF · DOCX · Images · CAD Drawings — AI automatically extracts data from first document
              </p>
              <input
                id="hiddenFileInput"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesAdded(e.target.files);
                }}
              />
            </label>

            {/* List of files selected for upload */}
            {files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-label-sm text-text-secondary">
                  <span>Selected files ({files.length}):</span>
                  <label
                    htmlFor="hiddenFileInput"
                    className="cursor-pointer font-medium text-primary hover:underline"
                  >
                    + Add more files
                  </label>
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-border rounded-lg border border-border bg-surface">
                  {files.map((f, idx) => (
                    <div
                      key={`${f.name}-${idx}`}
                      className="flex items-center justify-between px-3 py-2 text-label-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="font-mono text-xs text-secondary">📄</span>
                        <span className="truncate font-medium text-text-primary" title={f.name}>
                          {f.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-placeholder">
                          ({formatFileSize(f.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="ml-2 rounded p-1 text-placeholder transition hover:bg-danger-bg hover:text-danger"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error ? <p className="mt-1.5 text-label-sm text-danger">{error}</p> : null}

            {/* AI extraction — loading */}
            {isExtracting ? (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-border bg-surface-inset px-3 py-2.5 text-label-sm text-text-secondary">
                <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                AI Agent reading document — extracting Job No, Customer, PO &amp; Invoice fields…
              </div>
            ) : null}

            {/* AI extraction — error */}
            {extractError ? (
              <p className="mt-2.5 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2.5 text-label-sm text-danger">
                {extractError} You can still fill the fields manually.
              </p>
            ) : null}

            {/* AI extraction — results */}
            {extractedFields && !isExtracting ? (
              <div className="mt-2.5 rounded-lg border border-secondary/20 bg-tertiary/30 p-3.5">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                  <p className="text-label-sm font-semibold text-secondary">
                    AI Agent extracted {extractedCount} WIP fields — review &amp; confirm before uploading
                  </p>
                </div>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {EXTRACTED_PREVIEW_FIELDS.filter((f) => extractedFields[f.key]).map((f) => (
                    <div key={f.key} className="min-w-0">
                      <dt className="text-label-sm uppercase tracking-wider text-placeholder">
                        {f.label}
                      </dt>
                      <dd className="truncate text-body-sm font-medium text-text-primary">
                        {String(extractedFields[f.key])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-label-md text-text-secondary transition hover:bg-surface-inset"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-upload-submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-white shadow-card transition hover:bg-primary-hover"
            >
              {currentTargetJob
                ? `Attach to Job (${files.length} file${files.length !== 1 ? "s" : ""})`
                : files.length > 1
                ? `Create Job with ${files.length} Files`
                : onUpload
                ? "Upload Document"
                : "Process & Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
