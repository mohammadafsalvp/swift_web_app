export type DocStatus = "review" | "approved" | "verified";

// Mirrors the WIP register columns (WIP.xlsx) used to track jobs end-to-end.
export interface WipFields {
  sNo: number;
  customer: string;
  jobNo: string;
  model: string;
  serialNo: string;
  assetId: string;
  contactName: string;
  jobOpeningDate: string;
  reqNo: string;
  quotationStatus: string;
  poStatus: string;
  poDate: string;
  poNo: string;
  poIssuedBy: string;
  invoiceSubmissionStatus: string;
  paymentStatus: string;
  invoiceNo: string;
  invoiceDate: string;
  swiftValue: number;
  idcValue: number;
  scopeOfWork: string;
  jobLocation: string;
  reportSubmission: string;
  completionReportSign: string;
  jobCompletionDate: string;
  remarks: string;
  swiftFocalPoint: string;
}

export const statusMeta: Record<DocStatus, { label: string; dot: string }> = {
  review: { label: "Under Review", dot: "bg-warning" },
  approved: { label: "Approved", dot: "bg-success" },
  verified: { label: "Verified & Classed", dot: "bg-info" },
};

// Buckets a free-text status value (PO Status, Invoice Submission Status, Payment Status, ...)
// into a color tone for the WIP table badges.
export function statusTone(value: string): "success" | "warning" | "danger" | "neutral" {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return "neutral";
  if (["issued", "submitted", "received", "signed", "paid", "approved", "verified"].includes(v)) {
    return "success";
  }
  if (["pending", "under review", "in progress"].includes(v)) return "warning";
  if (["not received", "not submitted", "overdue", "rejected", "on hold"].includes(v)) {
    return "danger";
  }
  return "neutral";
}

// the five status filters shown on the WIP tables in both the Admin Dashboard and the Employee Portal
export const statusFilterFields = [
  { key: "jobStatus", label: "Job Status" },
  { key: "quotationStatus", label: "Quotation Status" },
  { key: "poStatus", label: "PO Status" },
  { key: "paymentStatus", label: "Payment Status" },
  { key: "invoiceSubmissionStatus", label: "Invoice Submission Status" },
] as const;

export type StatusFilterKey = (typeof statusFilterFields)[number]["key"];

export type StatusFilterState = Record<StatusFilterKey, string>;

export const allStatusFilters: StatusFilterState = {
  jobStatus: "all",
  quotationStatus: "all",
  poStatus: "all",
  paymentStatus: "all",
  invoiceSubmissionStatus: "all",
};

export function statusFilterValue(doc: WipFields & { status: DocStatus }, key: StatusFilterKey): string {
  if (key === "jobStatus") return statusMeta[doc.status]?.label ?? doc.status;
  return doc[key] || "";
}

export function matchesStatusFilters<T extends WipFields & { status: DocStatus }>(
  doc: T,
  filters: StatusFilterState,
): boolean {
  return statusFilterFields.every(({ key }) => {
    const active = filters[key];
    if (!active || active === "all") return true;
    return statusFilterValue(doc, key) === active;
  });
}

export const toneDot: Record<ReturnType<typeof statusTone>, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-placeholder",
};

export const navItems = [
  { key: "analytics", label: "Analytics", href: "#analytics" },
] as const;

// bar heights as percentages for the processing-rate chart; index 5 is the highlighted "19 Sep" bar
export const processingRateBars = [38, 52, 68, 40, 82, 95, 76, 58, 30, 62, 88, 48];

// amounts in AED
export const vaultTotalAed = 1619297;

export const vaultStacks = [
  { label: "Onshore Base", valueAed: 575282, segments: [14, 16, 18, 28, 24] },
  { label: "Offshore Drilling", valueAed: 316434, segments: [8, 10, 12, 18, 20] },
  { label: "Marine Fleets", valueAed: 727581, segments: [16, 16, 20, 24, 40] },
];

export const vaultLegend = [
  { label: "Engine Overhauls", swatch: "bg-primary" },
  { label: "Survey Certs", swatch: "bg-text-secondary" },
  { label: "Rig Diagnostics", swatch: "bg-placeholder" },
  { label: "OEM Bulletins", swatch: "bg-border" },
  { label: "Class & DNV Docs", swatch: "bg-surface-inset" },
];
