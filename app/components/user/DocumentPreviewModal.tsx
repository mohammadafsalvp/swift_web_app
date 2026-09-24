import { IconClose, IconDownload } from "../dashboard/icons";
import { statusMeta } from "../dashboard/data";
import FileBadge from "./FileBadge";
import { categoryLabel, formatBytes, formatDate, type UserDocument } from "./userData";

interface DocumentPreviewModalProps {
  doc: UserDocument | null;
  onClose: () => void;
  onDownload: (doc: UserDocument) => void;
}

export default function DocumentPreviewModal({ doc, onClose, onDownload }: DocumentPreviewModalProps) {
  if (!doc) return null;

  const canPreview =
    doc.objectUrl && (doc.mimeType.startsWith("image/") || doc.mimeType === "application/pdf");

  const details = [
    { label: "Document ID", value: doc.id, mono: true },
    { label: "Uploaded By", value: doc.uploadedBy },
    { label: "Vessel / Facility", value: doc.vessel },
    { label: "Engine / System", value: doc.engine },
    { label: "Asset Sector", value: doc.sector },
    { label: "Category", value: categoryLabel[doc.category] },
    { label: "Upload Date", value: formatDate(doc.uploadedAt) },
    { label: "Size", value: formatBytes(doc.sizeBytes) },
    { label: "Status", value: statusMeta[doc.status].label },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="previewTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-modal">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileBadge fileName={doc.fileName} />
            <h3 id="previewTitle" className="truncate text-headline-sm text-text-primary">
              {doc.fileName}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-2 text-placeholder transition hover:bg-surface-inset hover:text-text-primary"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface-inset">
          {canPreview && doc.mimeType.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL, not optimizable
            <img src={doc.objectUrl} alt={doc.fileName} className="mx-auto max-h-80 object-contain" />
          ) : canPreview ? (
            <iframe src={doc.objectUrl} title={doc.fileName} className="h-80 w-full" />
          ) : (
            <p className="px-4 py-10 text-center text-body-md text-text-secondary">
              Preview isn&apos;t available for this file type. Download it to open.
            </p>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-label-sm uppercase tracking-wider text-placeholder">{d.label}</dt>
              <dd className={`text-body-md text-text-primary ${d.mono ? "font-mono" : "font-medium"}`}>
                {d.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-label-md text-text-secondary transition hover:bg-surface-inset"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onDownload(doc)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-white shadow-card transition hover:bg-primary-hover"
          >
            <IconDownload className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
