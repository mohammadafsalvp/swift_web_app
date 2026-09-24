import { IconDownload } from "../dashboard/icons";
import FileBadge from "./FileBadge";
import { categories, currentUser, formatDate, type UserDocument } from "./userData";

const WEEK = 7 * 24 * 60 * 60 * 1000;

interface UserSummaryProps {
  documents: UserDocument[];
  now: number | null;
  onDownload: (doc: UserDocument) => void;
}

export default function UserSummary({ documents, now, onDownload }: UserSummaryProps) {
  const mine = documents.filter((d) => d.uploadedBy === currentUser.name).length;
  const thisWeek =
    now === null ? 0 : documents.filter((d) => now - Date.parse(d.uploadedAt) <= WEEK).length;
  const byCategory = categories.map((c) => ({
    ...c,
    count: documents.filter((d) => d.category === c.key).length,
  }));
  const maxCount = Math.max(1, ...byCategory.map((c) => c.count));
  const fromColleagues = documents.filter((d) => d.uploadedBy !== currentUser.name).slice(0, 4);

  const stats = [
    { label: "Library Documents", value: documents.length },
    { label: "My Uploads", value: mine },
    { label: "Added This Week", value: thisWeek },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <article className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <h3 className="mb-4 text-headline-sm text-text-primary">Library Overview</h3>

        <div className="mb-5 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-surface-inset p-3">
              <div className="text-headline-lg text-text-primary">{s.value}</div>
              <div className="text-label-sm text-text-secondary">{s.label}</div>
            </div>
          ))}
        </div>

        <span className="mb-2.5 text-label-md uppercase tracking-wider text-text-secondary">
          By Category
        </span>
        <div className="flex flex-col gap-2">
          {byCategory.map((c) => (
            <div key={c.key} className="flex items-center gap-3 text-label-sm">
              <span className="w-32 shrink-0 font-medium text-text-primary">{c.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-inset">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(c.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-5 text-right font-semibold text-text-secondary">{c.count}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-sm text-text-primary">Recently Shared by Colleagues</h3>
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {fromColleagues.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <FileBadge fileName={doc.fileName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-md text-text-primary">{doc.fileName}</p>
                <p className="truncate text-label-sm text-text-secondary">
                  {doc.uploadedBy} · {doc.vessel} · {formatDate(doc.uploadedAt)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Download ${doc.fileName}`}
                onClick={() => onDownload(doc)}
                className="rounded-lg border border-border p-2 text-text-secondary shadow-card transition hover:bg-surface-inset hover:text-text-primary"
              >
                <IconDownload className="h-4 w-4" />
              </button>
            </li>
          ))}
          {fromColleagues.length === 0 ? (
            <li className="py-6 text-center text-body-md text-text-secondary">
              No documents from colleagues yet.
            </li>
          ) : null}
        </ul>
      </article>
    </div>
  );
}
