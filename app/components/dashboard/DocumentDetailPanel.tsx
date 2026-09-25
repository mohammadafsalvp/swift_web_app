"use client";

import { useEffect, useState } from "react";
import { IconClose, IconDownload } from "./icons";
import { statusMeta, statusTone, toneDot, type DocStatus, type WipFields } from "./data";

// Structural shape both the admin DocumentRow and the user-portal UserDocument satisfy,
// so this single panel renders either without an adapter layer.
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
};

interface DocumentDetailPanelProps<T extends DetailDocument> {
  doc: T | null;
  onClose: () => void;
  onDownload?: (doc: T) => void;
}

function formatMoney(value: number): string {
  return value ? `$${value.toLocaleString()}` : "-";
}

function formatBytes(bytes: number): string {
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
}: DocumentDetailPanelProps<T>) {
  const [mountedDoc, setMountedDoc] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [prevDoc, setPrevDoc] = useState<T | null>(null);

  // Adjust state during render when the `doc` prop changes, per React's guidance for
  // deriving state from props without an effect (avoids the extra render an effect causes).
  if (doc !== prevDoc) {
    setPrevDoc(doc);
    if (doc) setMountedDoc(doc);
    else setIsOpen(false);
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
  const isFile = Boolean(d.fileName);
  const canPreview =
    isFile && d.objectUrl && (d.mimeType?.startsWith("image/") || d.mimeType === "application/pdf");
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
            {isFile ? (
              <span className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface-inset font-mono text-[10px] font-semibold text-text-secondary">
                {fileExtension(d.fileName!).slice(0, 4)}
              </span>
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary text-label-md font-bold text-secondary">
                {d.flag || d.vessel.slice(0, 1)}
              </span>
            )}
            <div className="min-w-0">
              <h3 id="detailPanelTitle" className="truncate text-headline-sm text-text-primary">
                {d.fileName || d.vessel}
              </h3>
              <p className="truncate text-label-sm text-text-secondary">{d.jobNo || d.id}</p>
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
          {isFile ? (
            <div className="mb-6 overflow-hidden rounded-lg border border-border bg-surface-inset">
              {canPreview && d.mimeType!.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL, not optimizable
                <img src={d.objectUrl} alt={d.fileName} className="mx-auto max-h-80 object-contain" />
              ) : canPreview ? (
                <iframe src={d.objectUrl} title={d.fileName} className="h-80 w-full" />
              ) : (
                <p className="px-4 py-10 text-center text-body-md text-text-secondary">
                  Preview isn&apos;t available for this file type. Download it to open.
                </p>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2.5">
            {d.status ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 py-1 text-label-sm font-medium text-text-primary">
                <span className={`h-2 w-2 rounded-full ${statusMeta[d.status].dot}`} />
                {statusMeta[d.status].label}
              </span>
            ) : null}
            {d.poStatus ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-inset px-3 py-1 text-label-sm font-medium text-text-primary">
                <span className={`h-2 w-2 rounded-full ${toneDot[tone ?? statusTone(d.poStatus)]}`} />
                PO {d.poStatus}
              </span>
            ) : null}
          </div>

          <div className="mt-6 space-y-6">
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

            {isFile ? (
              <section>
                <SectionHeading>File</SectionHeading>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                  <InfoField label="Uploaded By" value={d.uploadedBy || "-"} />
                  <InfoField label="Upload Date" value={formatDate(d.uploadedAt || "")} />
                  <InfoField label="Size" value={d.sizeBytes ? formatBytes(d.sizeBytes) : "-"} />
                  <InfoField label="Category" value={d.category || "-"} />
                  <InfoField label="Document ID" value={d.id} mono />
                </dl>
              </section>
            ) : (
              <section>
                <SectionHeading>Job Overview</SectionHeading>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                  <InfoField label="Document ID" value={d.id} mono />
                  <InfoField label="Engineer" value={d.engineer || d.contactName} />
                  <InfoField label="Date" value={d.date || formatDate(d.jobOpeningDate)} />
                </dl>
              </section>
            )}

            <section>
              <SectionHeading>Job / WIP Details</SectionHeading>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                <InfoField label="Customer" value={d.customer} />
                <InfoField label="Job No" value={d.jobNo} mono />
                <InfoField label="Contact Name" value={d.contactName} />
                <InfoField label="Job Opening Date" value={formatDate(d.jobOpeningDate)} />
                <InfoField label="Req No" value={d.reqNo} />
                <InfoField label="PO No" value={d.poNo} />
                <InfoField label="PO Date" value={formatDate(d.poDate)} />
                <InfoField label="PO Issued By" value={d.poIssuedBy} />
                <InfoField label="Invoice Submission" value={d.invoiceSubmissionStatus} />
                <InfoField label="Payment Status" value={d.paymentStatus} />
                <InfoField label="Invoice No" value={d.invoiceNo} />
                <InfoField label="Invoice Date" value={formatDate(d.invoiceDate)} />
                <InfoField label="Swift Value" value={formatMoney(d.swiftValue)} />
                <InfoField label="IDC Value" value={formatMoney(d.idcValue)} />
                <InfoField label="Job Location Report" value={d.jobLocationReportSubmission} />
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

        <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-4">
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
              onClick={() => onDownload(d)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-white shadow-card transition hover:bg-primary-hover"
            >
              <IconDownload className="h-4 w-4" />
              Download
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
