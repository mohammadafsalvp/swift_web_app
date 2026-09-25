"use client";

import { useMemo, useState } from "react";
import { IconKebab, IconSort } from "./icons";
import { statusTone, toneDot, type DocumentRow } from "./data";
import DocumentDetailPanel from "./DocumentDetailPanel";

function formatMoney(value: number): string {
  return value ? `$${value.toLocaleString()}` : "-";
}

function formatDate(value: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function matchesQuery(doc: DocumentRow, query: string) {
  if (!query) return true;
  const haystack = [
    doc.jobNo,
    doc.customer,
    doc.model,
    doc.serialNo,
    doc.assetId,
    doc.contactName,
    doc.reqNo,
    doc.poNo,
    doc.invoiceNo,
    doc.scopeOfWork,
    doc.swiftFocalPoint,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

const wipTabs = [
  { key: "all", label: "All Jobs" },
  { key: "po-pending", label: "PO Pending" },
  { key: "invoice-pending", label: "Invoice Pending" },
  { key: "payment-pending", label: "Payment Pending" },
  { key: "completed", label: "Completed" },
] as const;

type WipTabKey = (typeof wipTabs)[number]["key"];

function matchesTab(doc: DocumentRow, tab: WipTabKey) {
  switch (tab) {
    case "po-pending":
      return statusTone(doc.poStatus) !== "success";
    case "invoice-pending":
      return statusTone(doc.invoiceSubmissionStatus) !== "success";
    case "payment-pending":
      return statusTone(doc.paymentStatus) !== "success";
    case "completed":
      return doc.completionReportSign.trim().toLowerCase() === "signed";
    default:
      return true;
  }
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

interface DocumentsTableProps {
  documents: DocumentRow[];
  query: string;
}

export default function DocumentsTable({ documents, query }: DocumentsTableProps) {
  const [activeTab, setActiveTab] = useState<WipTabKey>("all");
  const [pulsing, setPulsing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRow | null>(null);

  const visibleDocs = useMemo(
    () => documents.filter((doc) => matchesQuery(doc, query) && matchesTab(doc, activeTab)),
    [documents, query, activeTab],
  );

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        wipTabs.map((tab) => [tab.key, documents.filter((doc) => matchesTab(doc, tab.key)).length]),
      ) as Record<WipTabKey, number>,
    [documents],
  );

  function handleTabClick(key: WipTabKey) {
    setActiveTab(key);
    setPulsing(true);
    window.setTimeout(() => setPulsing(false), 150);
  }

  return (
    <>
    <article className="rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <h2 className="text-headline-md text-text-primary">WIP</h2>
          <span className="rounded-full border border-border bg-surface-inset px-2.5 py-1 text-label-sm text-text-secondary">
            {documents.length}
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center gap-1.5 md:w-auto" role="tablist">
          {wipTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`rounded-lg px-4 py-2 text-label-md transition ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-card"
                  : "text-text-secondary hover:bg-surface-inset hover:text-text-primary"
              }`}
            >
              {tab.label} {tabCounts[tab.key]}
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
        <table className="w-full min-w-[2400px] border-collapse text-left text-body-md">
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
              <th className="px-3 py-3 font-medium">Job Location Report Submission</th>
              <th className="px-3 py-3 font-medium">Completion Report Sign</th>
              <th className="px-3 py-3 font-medium">Job Completion Date</th>
              <th className="px-3 py-3 font-medium">Remarks</th>
              <th className="px-3 py-3 font-medium">Swift Focal Point</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-border text-text-secondary transition-opacity duration-150 ${
              pulsing ? "opacity-40" : "opacity-100"
            }`}
          >
            {visibleDocs.map((doc) => (
              <tr key={doc.id} className="group transition-colors hover:bg-surface-inset">
                <td className="whitespace-nowrap px-3 py-3.5">{doc.sNo}</td>
                <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-text-primary">
                  {doc.customer}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-text-primary">
                  {doc.jobNo}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium">{doc.model}</td>
                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-label-sm">{doc.serialNo}</td>
                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-label-sm">{doc.assetId}</td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.contactName}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                  {formatDate(doc.jobOpeningDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.reqNo}</td>
                <td className="whitespace-nowrap px-3 py-3.5">
                  <StatusChip value={doc.poStatus} />
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                  {formatDate(doc.poDate)}
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
                  {formatDate(doc.invoiceDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-text-primary">
                  {formatMoney(doc.swiftValue)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-text-primary">
                  {formatMoney(doc.idcValue)}
                </td>
                <td className="max-w-[240px] truncate px-3 py-3.5" title={doc.scopeOfWork}>
                  {doc.scopeOfWork}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.jobLocationReportSubmission}</td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.completionReportSign}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-placeholder">
                  {formatDate(doc.jobCompletionDate)}
                </td>
                <td className="max-w-[200px] truncate px-3 py-3.5 text-placeholder" title={doc.remarks}>
                  {doc.remarks || "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5">{doc.swiftFocalPoint}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="rounded-lg border border-border bg-surface px-3 py-1 text-label-sm text-text-primary shadow-card transition hover:bg-surface-inset"
                    >
                      View Job
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
            ))}
            {visibleDocs.length === 0 ? (
              <tr>
                <td colSpan={26} className="px-3 py-8 text-center text-text-secondary">
                  No jobs match &quot;{query}&quot;.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
    <DocumentDetailPanel doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </>
  );
}
