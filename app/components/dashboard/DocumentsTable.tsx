"use client";

import { useMemo, useState } from "react";
import { IconKebab, IconSort } from "./icons";
import { documents, filterTabs, statusMeta, type DocumentRow } from "./data";

function matchesQuery(doc: DocumentRow, query: string) {
  if (!query) return true;
  const haystack = `${doc.id} ${doc.engineer} ${doc.vessel} ${doc.engine} ${doc.date}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

interface DocumentsTableProps {
  query: string;
}

export default function DocumentsTable({ query }: DocumentsTableProps) {
  const [activeFilter, setActiveFilter] = useState<string>("assigned");
  const [pulsing, setPulsing] = useState(false);

  const visibleDocs = useMemo(
    () => documents.filter((doc) => matchesQuery(doc, query)),
    [query],
  );

  function handleFilterClick(key: string) {
    setActiveFilter(key);
    setPulsing(true);
    window.setTimeout(() => setPulsing(false), 150);
  }

  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <h2 className="text-headline-md text-text-primary">Documents</h2>
          <span className="rounded-full border border-border bg-surface-inset px-2.5 py-1 text-label-sm text-text-secondary">
            264
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center gap-1.5 md:w-auto" role="tablist">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeFilter === tab.key}
              onClick={() => handleFilterClick(tab.key)}
              className={`rounded-lg px-4 py-2 text-label-md transition ${
                activeFilter === tab.key
                  ? "bg-primary text-white shadow-card"
                  : "text-text-secondary hover:bg-surface-inset hover:text-text-primary"
              }`}
            >
              {tab.label} {tab.count}
            </button>
          ))}
          <button
            type="button"
            aria-label="Sort Order"
            className="ml-1 rounded-lg border border-border p-2 text-text-secondary hover:bg-surface-inset"
          >
            <IconSort className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="-mx-2 overflow-x-auto sm:mx-0">
        <table className="w-full border-collapse text-left text-body-md">
          <thead>
            <tr className="border-b border-border text-label-sm uppercase tracking-wider text-placeholder">
              <th className="px-3 py-3 font-medium">Document ID</th>
              <th className="px-3 py-3 font-medium">Uploaded By / Engineer</th>
              <th className="px-3 py-3 font-medium">Vessel / Facility</th>
              <th className="px-3 py-3 font-medium">Engine Model / System</th>
              <th className="px-3 py-3 font-medium">Upload Date</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-border text-text-secondary transition-opacity duration-150 ${
              pulsing ? "opacity-40" : "opacity-100"
            }`}
          >
            {visibleDocs.map((doc) => {
              const status = statusMeta[doc.status];
              return (
                <tr key={doc.id} className="group transition-colors hover:bg-surface-inset">
                  <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-text-primary">
                    {doc.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium text-text-primary">
                    {doc.engineer}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span title={doc.flagLabel}>{doc.flag}</span>
                      <span>{doc.vessel}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium">
                    {doc.engine}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                    {doc.date}
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
                        className="rounded-lg border border-border bg-surface px-3 py-1 text-label-sm text-text-primary shadow-card transition hover:bg-surface-inset"
                      >
                        View Doc
                      </button>
                      <button
                        type="button"
                        aria-label="Row options"
                        className="rounded-lg p-1 text-placeholder hover:bg-surface-inset hover:text-text-primary"
                      >
                        <IconKebab className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visibleDocs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-text-secondary">
                  No documents match &quot;{query}&quot;.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}
