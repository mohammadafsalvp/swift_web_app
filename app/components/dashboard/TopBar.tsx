import { IconExport, IconPlus, IconSearch } from "./icons";

interface TopBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onUploadClick: () => void;
  showExport?: boolean;
}

export default function TopBar({
  query,
  onQueryChange,
  onUploadClick,
  showExport = true,
}: TopBarProps) {
  return (
    <header className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
      <div className="relative max-w-2xl flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-placeholder">
          <IconSearch className="h-4 w-4" />
        </span>
        <input
          id="globalSearchInput"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search documents, vessel IMO, engine overhaul reports (e.g. Wärtsilä 32, CAT 3516)..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-body-md text-text-primary shadow-card placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center gap-2.5">
        {showExport ? (
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-label-md text-text-primary shadow-card transition hover:bg-surface-inset"
          >
            <IconExport className="h-4 w-4 text-text-secondary" />
            Export
          </button>
        ) : null}
        <button
          type="button"
          onClick={onUploadClick}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-label-md text-white shadow-card transition hover:bg-primary-hover active:scale-[0.98]"
        >
          <IconPlus className="h-4 w-4" />
          Upload Document
        </button>
      </div>
    </header>
  );
}
