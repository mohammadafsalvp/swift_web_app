"use client";

import { useState, type DragEvent, type FormEvent } from "react";
import { IconClose, IconUploadCloud } from "./icons";
import type { ExtractedDocumentFields } from "../../lib/documentExtraction";

export const sectors = ["Marine Vessel", "Offshore Rig", "Onshore Unit"] as const;
export type Sector = (typeof sectors)[number];

export interface UploadInput {
  sector: Sector;
  engineModel: string;
  vesselName: string;
  category: string | null;
  file: File;
  // populated when the AI was able to read job/WIP details out of the file
  extractedFields?: ExtractedDocumentFields;
}

const ANALYZABLE_EXTENSIONS = [".pdf", ".docx", ".txt"];

function isAnalyzable(file: File): boolean {
  const name = file.name.toLowerCase();
  return ANALYZABLE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

const EXTRACTED_PREVIEW_FIELDS: { key: keyof ExtractedDocumentFields; label: string }[] = [
  { key: "customer", label: "Customer" },
  { key: "jobNo", label: "Job No" },
  { key: "serialNo", label: "Serial No" },
  { key: "poStatus", label: "PO Status" },
  { key: "paymentStatus", label: "Payment Status" },
  { key: "scopeOfWork", label: "Scope of Work" },
];

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  // when provided, a file is required and the form data is handed back to the caller
  onUpload?: (input: UploadInput) => void | Promise<void>;
  // when provided, shows a document category selector
  categories?: readonly { key: string; label: string }[];
}

export default function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  onUpload,
  categories,
}: UploadModalProps) {
  const [sector, setSector] = useState<Sector>("Marine Vessel");
  const [engineModel, setEngineModel] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [category, setCategory] = useState(categories?.[0]?.key ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedDocumentFields | null>(null);

  if (!isOpen) return null;

  function resetForm() {
    setSector("Marine Vessel");
    setEngineModel("");
    setVesselName("");
    setCategory(categories?.[0]?.key ?? "");
    setFile(null);
    setError(null);
    setExtracting(false);
    setExtractError(null);
    setExtractedFields(null);
  }

  function handleClose() {
    resetForm();
    onClose();
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
      if (fields.sector) setSector(fields.sector);
      if (fields.engine) setEngineModel(fields.engine);
      if (fields.vessel) setVesselName(fields.vessel);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Could not analyze this document.");
    } finally {
      setExtracting(false);
    }
  }

  function handleFileSelected(selected: File | null) {
    setFile(selected);
    setError(null);
    setExtractedFields(null);
    setExtractError(null);
    if (selected && isAnalyzable(selected)) {
      void analyzeFile(selected);
    }
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelected(dropped);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (onUpload) {
      if (!file) {
        setError("Please attach a file to upload.");
        return;
      }
      await onUpload({
        sector,
        engineModel,
        vesselName,
        category: categories ? category : null,
        file,
        extractedFields: extractedFields ?? undefined,
      });
      onSuccess(`${file.name} was uploaded to the IDC document library.`);
    } else {
      onSuccess(`Document for ${engineModel} on [${vesselName}] was registered to the IDC vault.`);
    }
    resetForm();
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 id="modalTitle" className="text-headline-sm text-text-primary">
              Upload Engineering Document
            </h3>
            <p className="text-body-sm text-text-secondary">
              Attach CADs, engine logs, or vessel class certificates
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="rounded-lg p-2 text-placeholder transition hover:bg-surface-inset hover:text-text-primary"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-label-md text-text-primary">Asset Sector</label>
            <div className="grid grid-cols-3 gap-2">
              {sectors.map((s) => (
                <label
                  key={s}
                  className={`cursor-pointer rounded-lg border p-2.5 text-center text-label-sm font-medium transition ${
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="engineModel" className="mb-1 block text-label-md text-text-primary">
                Engine Spec
              </label>
              <input
                id="engineModel"
                type="text"
                required
                value={engineModel}
                onChange={(e) => setEngineModel(e.target.value)}
                placeholder="e.g. Wärtsilä 12V32"
                className="w-full rounded-lg border border-border p-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="vesselName" className="mb-1 block text-label-md text-text-primary">
                Vessel / Rig ID
              </label>
              <input
                id="vesselName"
                type="text"
                required
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="IMO 9384728"
                className="w-full rounded-lg border border-border p-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-label-md text-text-primary">
              Blueprints or Inspection Logs
            </label>
            <label
              htmlFor="hiddenFileInput"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition hover:border-primary hover:bg-tertiary/40 ${
                isDragging ? "border-primary bg-tertiary/40" : "border-border bg-surface-inset"
              }`}
            >
              <IconUploadCloud className="mx-auto mb-2 h-8 w-8 text-placeholder" />
              <p className="text-label-md text-text-primary">Click or drag files here to upload</p>
              <p className="mt-1 text-[11px] text-placeholder">
                PDF, CAD/DWG, STEP, XLSX up to 50MB
              </p>
              <input
                id="hiddenFileInput"
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="mt-2 text-label-sm font-semibold text-secondary">
                  Selected: {file.name}
                </div>
              ) : null}
            </label>
            {error ? <p className="mt-1.5 text-label-sm text-danger">{error}</p> : null}

            {isExtracting ? (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-border bg-surface-inset px-3 py-2.5 text-label-sm text-text-secondary">
                <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                Analyzing document with AI…
              </div>
            ) : null}

            {extractError ? (
              <p className="mt-2.5 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2.5 text-label-sm text-danger">
                {extractError} You can still fill the fields in manually.
              </p>
            ) : null}

            {extractedFields && !isExtracting ? (
              <div className="mt-2.5 rounded-lg border border-border bg-surface-inset p-3.5">
                <p className="text-label-sm font-semibold text-secondary">
                  AI auto-filled details from this document — review before uploading
                </p>
                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
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
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-white shadow-card transition hover:bg-primary-hover"
            >
              {onUpload ? "Upload Document" : "Process & Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
