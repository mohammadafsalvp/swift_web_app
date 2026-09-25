"use client";

import { formatMoney } from "./currency";
import { useEffect, useState } from "react";
import { IconClose, IconDownload } from "./icons";
import { statusMeta, statusTone, toneDot, type DocStatus, type WipFields } from "./data";

// Structural shape UserDocument satisfies (used by both the admin and employee portals,
// which now share a single document store), so this panel needs no adapter layer.
export type DetailDocument = WipFields & {
  id: string;
  vessel: string;
  engine: string;
  status?: DocStatus;
  flag?: string;
  flagLabel?: string;
  engineer?: string;
  date?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  category?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  objectUrl?: string;
  attachments?: {
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    category?: string;
    uploadedBy: string;
    uploadedAt: string;
    objectUrl?: string;
  }[];
};

interface DocumentDetailPanelProps<T extends DetailDocument> {
  doc: T | null;
  onClose: () => void;
  onDownload?: (doc: T, attachmentId?: string) => void;
  onAttachMore?: (doc: T) => void;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "FILE" : fileName.slice(dot + 1).toUpperCase();
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-label-sm uppercase tracking-wider text-placeholder">{label}</dt>
      <dd
        className={`truncate text-body-md text-text-primary ${mono ? "font-mono" : "font-medium"}`}
        title={value}
      >
        {value || "-"}
      </dd>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-label-md uppercase tracking-wider text-placeholder">{children}</h4>
  );
}

export default function DocumentDetailPanel<T extends DetailDocument>({
  doc,
  onClose,
  onDownload,
  onAttachMore,
}: DocumentDetailPanelProps<T>) {
  const [mountedDoc, setMountedDoc] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [prevDoc, setPrevDoc] = useState<T | null>(null);
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);

  // Adjust state during render when the `doc` prop changes
  if (doc !== prevDoc) {
    setPrevDoc(doc);
    if (doc) {
      setMountedDoc(doc);
      setActiveAttachmentId(doc.attachments?.[0]?.id || null);
    } else {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    if (!doc) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIsOpen(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [doc]);

  useEffect(() => {
    if (doc || !mountedDoc) return;
    const timer = window.setTimeout(() => setMountedDoc(null), 320);
    return () => window.clearTimeout(timer);
  }, [doc, mountedDoc]);

  useEffect(() => {
    if (!mountedDoc) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mountedDoc, onClose]);

  if (!mountedDoc) return null;

  const d = mountedDoc;

  // Determine active document to preview
  const attachmentsList =
    d.attachments && d.attachments.length > 0
      ? d.attachments
      : d.fileName
      ? [
          {
            id: d.id,
            fileName: d.fileName,
            mimeType: d.mimeType || "application/octet-stream",
            sizeBytes: d.sizeBytes || 0,
            category: d.category,
            uploadedBy: d.uploadedBy || "",
            uploadedAt: d.uploadedAt || "",
            objectUrl: d.objectUrl,
          },
        ]
      : [];

  const currentFile =
    (activeAttachmentId ? attachmentsList.find((a) => a.id === activeAttachmentId) : null) ??
    attachmentsList[0] ??
    null;

  const isFile = Boolean(currentFile?.fileName);
  const canPreview =
    isFile &&
    currentFile?.objectUrl &&
    (currentFile.mimeType?.startsWith("image/") || currentFile.mimeType === "application/pdf");
  const tone = d.status ? undefined : statusTone(d.poStatus);

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!doc}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detailPanelTitle"
        className={`absolute inset-y-0 right-0 flex h-full w-full max-w-2xl transform flex-col border-l border-border bg-surface shadow-modal transition-transform duration-300 will-change-transform [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-label-md font-bold text-primary">
              {d.flag || (d.customer ? d.customer.slice(0, 2).toUpperCase() : "JB")}
            </span>
            <div className="min-w-0">
              <h3 id="detailPanelTitle" className="truncate text-headline-sm text-text-primary">
                {d.customer || d.vessel}
              </h3>
              <p className="truncate text-label-sm text-text-secondary">
                Job No: <span className="font-mono font-medium text-text-primary">{d.jobNo || d.id}</span>
                {attachmentsList.length > 0 && (
                  <span className="ml-2 rounded bg-surface-inset px-1.5 py-0.5 text-xs text-text-secondary">
                    {attachmentsList.length} file{attachmentsList.length > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-placeholder transition hover:bg-surface-inset hover:text-text-primary"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {/* File Preview Container */}
          {isFile && currentFile ? (
            <div className="mb-6 overflow-hidden rounded-lg border border-border bg-surface-inset">
              <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2 text-label-sm">
                <span className="truncate font-medium text-text-primary">
                  Viewing: {currentFile.fileName}
                </span>
                <span className="shrink-0 text-xs text-text-secondary">
                  {formatBytes(currentFile.sizeBytes)}
                </span>
              </div>
              {canPreview && currentFile.mimeType!.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentFile.objectUrl}
                  alt={currentFile.fileName}
                  className="mx-auto max-h-80 object-contain p-2"
                />
              ) : canPreview ? (
                <iframe src={currentFile.objectUrl} title={currentFile.fileName} className="h-80 w-full" />
              ) : (
                <div className="px-4 py-8 text-center text-body-md text-text-secondary">
                  <p>Preview is not rendered for this document format ({fileExtension(currentFile.fileName)}).</p>
                  <p className="mt-1 text-label-sm text-placeholder">Download to view full content.</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {d.status ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 py-1 text-label-sm font-medium text-text-primary">
                <span className={`h-2 w-2 rounded-full ${statusMeta[d.status].dot}`} />
                {statusMeta[d.status].label}
              </span>
            ) : null}
            {d.quotationStatus ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 py-1 text-label-sm font-medium text-text-primary">
                <span className={`h-2 w-2 rounded-full ${toneDot[statusTone(d.quotationStatus)]}`} />
                Quotation {d.quotationStatus}
              </span>
            ) : null}
            {d.poStatus ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 py-1 text-label-sm font-medium text-text-primary">
                <span className={`h-2 w-2 rounded-full ${toneDot[tone ?? statusTone(d.poStatus)]}`} />
                PO {d.poStatus}
              </span>
            ) : null}
            {d.paymentStatus ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 py-1 text-label-sm font-medium text-text-primary">
                Payment {d.paymentStatus}
              </span>
            ) : null}
          </div>

          <div className="mt-6 space-y-6">
            {/* ── Job Documents & Attachments Section ── */}
            <section className="rounded-xl border border-border bg-surface-inset p-4">
              <div className="flex items-center justify-between">
                <SectionHeading>
                  Job Documents &amp; Attachments ({attachmentsList.length})
                </SectionHeading>
                {onAttachMore ? (
                  <button
                    type="button"
                    onClick={() => onAttachMore(d)}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-label-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    + Attach File
                  </button>
                ) : null}
              </div>

              {attachmentsList.length === 0 ? (
                <p className="mt-2 text-label-sm text-text-secondary">No files attached to this job.</p>
              ) : (
                <div className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface overflow-hidden">
                  {attachmentsList.map((att) => {
                    const isSelected = currentFile?.id === att.id;
                    return (
                      <div
                        key={att.id}
                        className={`flex items-center justify-between p-3 transition ${
                          isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-surface-inset"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded border border-border bg-surface-inset font-mono text-[10px] font-semibold text-text-secondary">
                            {fileExtension(att.fileName).slice(0, 4)}
                          </span>
                          <div className="min-w-0">
                            <p
                              className="truncate text-body-sm font-semibold text-text-primary"
                              title={att.fileName}
                            >
                              {att.fileName}
                            </p>
                            <p className="text-[11px] text-placeholder">
                              {formatBytes(att.sizeBytes)} • {formatDate(att.uploadedAt)}
                              {att.uploadedBy ? ` • By ${att.uploadedBy}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {att.objectUrl ? (
                            <button
                              type="button"
                              onClick={() => setActiveAttachmentId(att.id)}
                              className={`rounded px-2.5 py-1 text-label-sm transition ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-inset"
                              }`}
                            >
                              {isSelected ? "Viewing" : "Preview"}
                            </button>
                          ) : null}
                          {onDownload ? (
                            <button
                              type="button"
                              onClick={() => onDownload(d, att.id)}
                              className="rounded border border-border bg-surface p-1.5 text-text-secondary transition hover:bg-surface-inset hover:text-text-primary"
                              title={`Download ${att.fileName}`}
                            >
                              <IconDownload className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Equipment & Asset */}
            <section>
              <SectionHeading>Equipment &amp; Asset</SectionHeading>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                <InfoField label="Vessel / Facility" value={d.vessel} />
                <InfoField label="Engine / System" value={d.engine} />
                <InfoField label="Model" value={d.model} />
                <InfoField label="Serial No" value={d.serialNo} mono />
                <InfoField label="Asset ID" value={d.assetId} mono />
                <InfoField label="Flag" value={d.flagLabel || "-"} />
              </dl>
            </section>

            {/* Job / WIP Details */}
            <section>
              <SectionHeading>Job / WIP Details</SectionHeading>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                <InfoField label="Customer" value={d.customer} />
                <InfoField label="Job No" value={d.jobNo} mono />
                <InfoField label="Contact Name" value={d.contactName} />
                <InfoField label="Job Opening Date" value={formatDate(d.jobOpeningDate)} />
                <InfoField label="Req No" value={d.reqNo} />
                <InfoField label="Quotation Status" value={d.quotationStatus} />
                <InfoField label="PO No" value={d.poNo} />
                <InfoField label="PO Date" value={formatDate(d.poDate)} />
                <InfoField label="PO Issued By" value={d.poIssuedBy} />
                <InfoField label="Invoice Submission" value={d.invoiceSubmissionStatus} />
                <InfoField label="Payment Status" value={d.paymentStatus} />
                <InfoField label="Invoice No" value={d.invoiceNo} />
                <InfoField label="Invoice Date" value={formatDate(d.invoiceDate)} />
                <InfoField label="Swift Value" value={formatMoney(d.swiftValue)} />
                <InfoField label="IDC Value" value={formatMoney(d.idcValue)} />
                <InfoField label="Job Location" value={d.jobLocation} />
                <InfoField label="Report Submission" value={d.reportSubmission} />
                <InfoField label="Completion Report Sign" value={d.completionReportSign} />
                <InfoField label="Job Completion Date" value={formatDate(d.jobCompletionDate)} />
                <InfoField label="Swift Focal Point" value={d.swiftFocalPoint} />
              </dl>
            </section>

            {d.scopeOfWork || d.remarks ? (
              <section className="space-y-4">
                {d.scopeOfWork ? (
                  <div>
                    <dt className="text-label-sm uppercase tracking-wider text-placeholder">
                      Scope of Work
                    </dt>
                    <dd className="mt-1 text-body-md text-text-primary">{d.scopeOfWork}</dd>
                  </div>
                ) : null}
                {d.remarks ? (
                  <div>
                    <dt className="text-label-sm uppercase tracking-wider text-placeholder">Remarks</dt>
                    <dd className="mt-1 text-body-md text-text-secondary">{d.remarks}</dd>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div>
            {onAttachMore ? (
              <button
                type="button"
                onClick={() => onAttachMore(d)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-label-md text-text-primary transition hover:bg-surface-inset"
              >
                + Attach Another Document
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-label-md text-text-secondary transition hover:bg-surface-inset"
            >
              Close
            </button>
            {onDownload ? (
              <button
                type="button"
                onClick={() => onDownload(d, currentFile?.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-white shadow-card transition hover:bg-primary-hover"
              >
                <IconDownload className="h-4 w-4" />
                Download {currentFile ? currentFile.fileName : "Document"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
