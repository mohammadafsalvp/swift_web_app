import { IconDownload, IconEye, IconTrash } from "../dashboard/icons";
import { statusTone, toneDot } from "../dashboard/data";
import {
  libraryTabs,
  type LibraryView,
  type UserDocument,
} from "./userData";

function formatMoney(value: number): string {
  return value ? `$${value.toLocaleString()}` : "-";
}

function formatWipDate(value: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusChip({ value }: { value: string }) {
  const tone = statusTone(value);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-text-primary">
      <span className={`h-2 w-2 rounded-full ${toneDot[tone]}`} />
      {value || "-"}
    </span>
  );
}

interface UserDocumentsTableProps {
  documents: UserDocument[];
  tabCounts: Record<LibraryView, number>;
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
  query: string;
  isLoading: boolean;
  onPreview: (doc: UserDocument) => void;
  onDownload: (doc: UserDocument) => void;
  onDelete: (doc: UserDocument) => void;
  onAttachDoc?: (doc: UserDocument) => void;
}

export default function UserDocumentsTable({
  documents,
  tabCounts,
  view,
  onViewChange,
  query,
  isLoading,
  onPreview,
  onDownload,
  onDelete,
  onAttachDoc,
}: UserDocumentsTableProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <h2 className="text-headline-md text-text-primary">WIP</h2>
          <span className="rounded-full border border-border bg-surface-inset px-2.5 py-1 text-label-sm text-text-secondary">
            {tabCounts.all}
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center gap-1.5 md:w-auto" role="tablist">
          {libraryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={view === tab.key}
              onClick={() => onViewChange(tab.key)}
              className={`rounded-lg px-3.5 py-2 text-label-md transition ${
                view === tab.key
                  ? "bg-primary text-white shadow-card"
                  : "text-text-secondary hover:bg-surface-inset hover:text-text-primary"
              }`}
            >
              {tab.label} {tabCounts[tab.key]}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-2 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[2500px] border-collapse text-left text-body-md">
          <thead>
            <tr className="border-b border-border text-label-sm uppercase tracking-wider text-placeholder">
              <th className="px-3 py-3 font-medium">S.No</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Job No</th>
              <th className="px-3 py-3 font-medium">Model</th>
              <th className="px-3 py-3 font-medium">Serial No</th>
              <th className="px-3 py-3 font-medium">Asset ID</th>
              <th className="px-3 py-3 font-medium">Contact Name</th>
              <th className="px-3 py-3 font-medium">Job Opening Date</th>
              <th className="px-3 py-3 font-medium">Req No</th>
              <th className="px-3 py-3 font-medium">PO Status</th>
              <th className="px-3 py-3 font-medium">PO Date</th>
              <th className="px-3 py-3 font-medium">PO No</th>
              <th className="px-3 py-3 font-medium">PO Issued By</th>
              <th className="px-3 py-3 font-medium">Invoice Submission Status</th>
              <th className="px-3 py-3 font-medium">Payment Status</th>
              <th className="px-3 py-3 font-medium">Invoice No</th>
              <th className="px-3 py-3 font-medium">Invoice Date</th>
              <th className="px-3 py-3 font-medium">Swift Value</th>
              <th className="px-3 py-3 font-medium">IDC Value</th>
              <th className="px-3 py-3 font-medium">Scope of Work</th>
              <th className="px-3 py-3 font-medium">Job Location</th>
              <th className="px-3 py-3 font-medium">Report Submission</th>
              <th className="px-3 py-3 font-medium">Completion Report Sign</th>
              <th className="px-3 py-3 font-medium">Job Completion Date</th>
              <th className="px-3 py-3 font-medium">Remarks</th>
              <th className="px-3 py-3 font-medium">Swift Focal Point</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text-secondary">
            {documents.map((doc, idx) => (
              <tr key={doc.id} className="group transition-colors hover:bg-surface-inset">
                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-label-sm font-medium">
                  {idx + 1}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-text-primary">
                  {doc.customer || "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-text-primary">
                  <div className="flex items-center gap-2">
                    <span>{doc.jobNo || "-"}</span>
                    {doc.attachments && doc.attachments.length > 1 ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary"
                        title={`${doc.attachments.length} documents attached:\n${doc.attachments.map((a) => a.fileName).join("\n")}`}
                      >
                        📎 {doc.attachments.length}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium">{doc.model}</td>
                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-label-sm">
                  {doc.serialNo || "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-label-sm">
                  {doc.assetId || "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.contactName}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                  {formatWipDate(doc.jobOpeningDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.reqNo || "-"}</td>
                <td className="whitespace-nowrap px-3 py-3.5">
                  <StatusChip value={doc.poStatus} />
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                  {formatWipDate(doc.poDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.poNo || "-"}</td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.poIssuedBy || "-"}</td>
                <td className="whitespace-nowrap px-3 py-3.5">
                  <StatusChip value={doc.invoiceSubmissionStatus} />
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">
                  <StatusChip value={doc.paymentStatus} />
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.invoiceNo || "-"}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                  {formatWipDate(doc.invoiceDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-text-primary">
                  {formatMoney(doc.swiftValue)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-text-primary">
                  {formatMoney(doc.idcValue)}
                </td>
                <td className="max-w-[240px] truncate px-3 py-3.5" title={doc.scopeOfWork}>
                  {doc.scopeOfWork || "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.jobLocation || "-"}</td>
                <td className="whitespace-nowrap px-3 py-3.5">
                  <StatusChip value={doc.reportSubmission} />
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.completionReportSign}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                  {formatWipDate(doc.jobCompletionDate)}
                </td>
                <td className="max-w-[200px] truncate px-3 py-3.5 text-placeholder" title={doc.remarks}>
                  {doc.remarks || "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.swiftFocalPoint || "-"}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onAttachDoc ? (
                      <button
                        type="button"
                        onClick={() => onAttachDoc(doc)}
                        title="Upload document to this job"
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-label-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                      >
                        + Add Doc
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onPreview(doc)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1 text-label-sm text-text-primary shadow-card transition hover:bg-surface-inset"
                    >
                      <IconEye className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(doc)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-label-sm text-white shadow-card transition hover:bg-primary-hover"
                    >
                      <IconDownload className="h-3.5 w-3.5" />
                      Download
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${doc.fileName}`}
                      onClick={() => onDelete(doc)}
                      className="rounded-lg p-1.5 text-placeholder transition hover:bg-danger-bg hover:text-danger"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && documents.length === 0 ? (
              <tr>
                <td colSpan={27} className="px-3 py-8 text-center text-text-secondary">
                  {query ? <>No jobs match &quot;{query}&quot;.</> : "No jobs in this view yet."}
                </td>
              </tr>
            ) : null}
            {isLoading ? (
              <tr>
                <td colSpan={27} className="px-3 py-8 text-center text-text-secondary">
                  Loading jobs…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}
