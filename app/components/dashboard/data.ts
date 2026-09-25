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

export const toneDot: Record<ReturnType<typeof statusTone>, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-placeholder",
};

export const navItems = [
  { key: "blueprints", label: "Blueprints", href: "#blueprints" },
  { key: "vessels", label: "Vessels & Rigs", href: "#vessels" },
  { key: "engine-repairs", label: "Engine Repairs", href: "#engine-repairs" },
  { key: "analytics", label: "Analytics", href: "#analytics" },
] as const;

// bar heights as percentages for the processing-rate chart; index 5 is the highlighted "19 Sep" bar
export const processingRateBars = [38, 52, 68, 40, 82, 95, 76, 58, 30, 62, 88, 48];

// source amounts are USD; convert to AED at render time via formatAed()
export const vaultTotalUsd = 440925;

export const vaultStacks = [
  { label: "Onshore Base", valueUsd: 156646, segments: [14, 16, 18, 28, 24] },
  { label: "Offshore Drilling", valueUsd: 86163, segments: [8, 10, 12, 18, 20] },
  { label: "Marine Fleets", valueUsd: 198116, segments: [16, 16, 20, 24, 40] },
];

export const vaultLegend = [
  { label: "Engine Overhauls", swatch: "bg-primary" },
  { label: "Survey Certs", swatch: "bg-text-secondary" },
  { label: "Rig Diagnostics", swatch: "bg-placeholder" },
  { label: "OEM Bulletins", swatch: "bg-border" },
  { label: "Class & DNV Docs", swatch: "bg-surface-inset" },
];
