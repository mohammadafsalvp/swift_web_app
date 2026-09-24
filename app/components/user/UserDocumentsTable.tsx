import { IconDownload, IconEye } from "../dashboard/icons";
import { statusMeta } from "../dashboard/data";
import FileBadge from "./FileBadge";
import {
  categoryLabel,
  currentUser,
  formatBytes,
  formatDate,
  libraryTabs,
  type LibraryView,
  type UserDocument,
} from "./userData";

interface UserDocumentsTableProps {
  documents: UserDocument[];
  tabCounts: Record<LibraryView, number>;
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
  query: string;
  isLoading: boolean;
  onPreview: (doc: UserDocument) => void;
  onDownload: (doc: UserDocument) => void;
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
}: UserDocumentsTableProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <h2 className="text-headline-md text-text-primary">Document Library</h2>
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
        <table className="w-full border-collapse text-left text-body-md">
          <thead>
            <tr className="border-b border-border text-label-sm uppercase tracking-wider text-placeholder">
              <th className="px-3 py-3 font-medium">Document</th>
              <th className="px-3 py-3 font-medium">Uploaded By</th>
              <th className="px-3 py-3 font-medium">Vessel / Facility</th>
              <th className="px-3 py-3 font-medium">Engine Model / System</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Upload Date</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text-secondary">
            {documents.map((doc) => {
              const status = statusMeta[doc.status];
              const isMine = doc.uploadedBy === currentUser.name;
              return (
                <tr key={doc.id} className="group transition-colors hover:bg-surface-inset">
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileBadge fileName={doc.fileName} />
                      <div className="min-w-0">
                        <p className="max-w-[260px] truncate font-semibold text-text-primary" title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <p className="font-mono text-label-sm text-placeholder">
                          {doc.id} · {formatBytes(doc.sizeBytes)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium text-text-primary">
                    <span className="inline-flex items-center gap-1.5">
                      {doc.uploadedBy}
                      {isMine ? (
                        <span className="rounded-full bg-tertiary px-2 py-0.5 text-label-sm font-semibold text-secondary">
                          You
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {doc.flag ? <span title={doc.flagLabel}>{doc.flag}</span> : null}
                      <span>{doc.vessel}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium">{doc.engine}</td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="rounded-full border border-border bg-surface-inset px-2.5 py-1 text-label-sm text-text-secondary">
                      {categoryLabel[doc.category]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                    {formatDate(doc.uploadedAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                      <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                    </div>
                  </td>
                </tr>
              );
            })}
            {!isLoading && documents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-text-secondary">
                  {query ? <>No documents match &quot;{query}&quot;.</> : "No documents in this view yet."}
                </td>
              </tr>
            ) : null}
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-text-secondary">
                  Loading documents…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}
