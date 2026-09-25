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
  jobLocationReportSubmission: string;
  completionReportSign: string;
  jobCompletionDate: string;
  remarks: string;
  swiftFocalPoint: string;
}

export interface DocumentRow extends WipFields {
  id: string;
  engineer: string;
  flag: string;
  flagLabel: string;
  vessel: string;
  engine: string;
  date: string;
  status: DocStatus;
}

export const documents: DocumentRow[] = [
  {
    id: "#DOC-3245612",
    engineer: "Edgar Humbert",
    flag: "\u{1F1EC}\u{1F1E7}",
    flagLabel: "UK",
    vessel: "Stena DrillMAX (Offshore)",
    engine: "Wärtsilä 50DF Main Gen",
    date: "12 Sep, 2024",
    status: "review",
    sNo: 1,
    customer: "Stena Drilling",
    jobNo: "JOB-24-0112",
    model: "Wärtsilä 50DF",
    serialNo: "WD50-88214",
    assetId: "AST-11029",
    contactName: "Edgar Humbert",
    jobOpeningDate: "2024-09-12",
    reqNo: "REQ-5521",
    poStatus: "Pending",
    poDate: "",
    poNo: "",
    poIssuedBy: "",
    invoiceSubmissionStatus: "Not Submitted",
    paymentStatus: "Pending",
    invoiceNo: "",
    invoiceDate: "",
    swiftValue: 18500,
    idcValue: 15200,
    scopeOfWork: "Main generator overhaul & diagnostic survey",
    jobLocationReportSubmission: "Pending",
    completionReportSign: "Pending",
    jobCompletionDate: "",
    remarks: "Awaiting turbocharger spares",
    swiftFocalPoint: "Marcus Vance",
  },
  {
    id: "#DOC-1838967",
    engineer: "Craig Howard",
    flag: "\u{1F1E9}\u{1F1F0}",
    flagLabel: "Denmark",
    vessel: "Maersk Mc-Kinney (Tanker)",
    engine: "MAN B&W 6S70ME-C8.2",
    date: "14 Sep, 2024",
    status: "approved",
    sNo: 2,
    customer: "Maersk Line",
    jobNo: "JOB-24-0098",
    model: "MAN B&W 6S70ME-C8.2",
    serialNo: "MB70-55310",
    assetId: "AST-10877",
    contactName: "Craig Howard",
    jobOpeningDate: "2024-09-05",
    reqNo: "REQ-5478",
    poStatus: "Issued",
    poDate: "2024-09-10",
    poNo: "PO-88231",
    poIssuedBy: "Maersk Procurement",
    invoiceSubmissionStatus: "Submitted",
    paymentStatus: "Pending",
    invoiceNo: "INV-33021",
    invoiceDate: "2024-09-16",
    swiftValue: 42300,
    idcValue: 36900,
    scopeOfWork: "Crankshaft & bearing clearance inspection",
    jobLocationReportSubmission: "Submitted",
    completionReportSign: "Signed",
    jobCompletionDate: "2024-09-14",
    remarks: "Class surveyor witnessed final checks",
    swiftFocalPoint: "Marcus Vance",
  },
  {
    id: "#DOC-2671893",
    engineer: "Timothy Hines",
    flag: "\u{1F1F3}\u{1F1F4}",
    flagLabel: "Norway",
    vessel: "Bergen Rig Alpha",
    engine: "Rolls-Royce Bergen B32:40",
    date: "15 Sep, 2024",
    status: "review",
    sNo: 3,
    customer: "Bergen Offshore AS",
    jobNo: "JOB-24-0121",
    model: "Rolls-Royce Bergen B32:40",
    serialNo: "RRB32-24471",
    assetId: "AST-11104",
    contactName: "Timothy Hines",
    jobOpeningDate: "2024-09-13",
    reqNo: "REQ-5539",
    poStatus: "Not Received",
    poDate: "",
    poNo: "",
    poIssuedBy: "",
    invoiceSubmissionStatus: "Not Submitted",
    paymentStatus: "Pending",
    invoiceNo: "",
    invoiceDate: "",
    swiftValue: 9800,
    idcValue: 8100,
    scopeOfWork: "Cylinder head assembly drawing review",
    jobLocationReportSubmission: "Pending",
    completionReportSign: "Pending",
    jobCompletionDate: "",
    remarks: "Waiting on customer PO confirmation",
    swiftFocalPoint: "Edgar Humbert",
  },
  {
    id: "#DOC-9426253",
    engineer: "Lisa Collins",
    flag: "\u{1F1EB}\u{1F1F7}",
    flagLabel: "France",
    vessel: "CMA CGM Fort Royal",
    engine: "CAT C32 Marine Turbo",
    date: "18 Sep, 2024",
    status: "approved",
    sNo: 4,
    customer: "CMA CGM",
    jobNo: "JOB-24-0083",
    model: "CAT C32 Marine Turbo",
    serialNo: "CATC32-90142",
    assetId: "AST-10655",
    contactName: "Lisa Collins",
    jobOpeningDate: "2024-08-30",
    reqNo: "REQ-5390",
    poStatus: "Issued",
    poDate: "2024-09-02",
    poNo: "PO-88109",
    poIssuedBy: "CMA CGM Procurement",
    invoiceSubmissionStatus: "Submitted",
    paymentStatus: "Received",
    invoiceNo: "INV-32877",
    invoiceDate: "2024-09-19",
    swiftValue: 12750,
    idcValue: 10400,
    scopeOfWork: "Turbocharger service bulletin compliance check",
    jobLocationReportSubmission: "Submitted",
    completionReportSign: "Signed",
    jobCompletionDate: "2024-09-18",
    remarks: "",
    swiftFocalPoint: "Marcus Vance",
  },
  {
    id: "#DOC-4819024",
    engineer: "Marcus Vance (Lead)",
    flag: "\u{1F1F3}\u{1F1F1}",
    flagLabel: "Netherlands",
    vessel: "Rotterdam Drydock 7",
    engine: "Sulzer RTA96-C Class Cert",
    date: "22 Sep, 2024",
    status: "verified",
    sNo: 5,
    customer: "Rotterdam Drydock Co.",
    jobNo: "JOB-24-0067",
    model: "Sulzer RTA96-C",
    serialNo: "SRTA96-77820",
    assetId: "AST-10391",
    contactName: "Marcus Vance",
    jobOpeningDate: "2024-08-20",
    reqNo: "REQ-5301",
    poStatus: "Issued",
    poDate: "2024-08-25",
    poNo: "PO-87980",
    poIssuedBy: "Rotterdam Drydock Co.",
    invoiceSubmissionStatus: "Submitted",
    paymentStatus: "Received",
    invoiceNo: "INV-32410",
    invoiceDate: "2024-09-01",
    swiftValue: 61200,
    idcValue: 52800,
    scopeOfWork: "Class certification survey & DNV verification",
    jobLocationReportSubmission: "Submitted",
    completionReportSign: "Signed",
    jobCompletionDate: "2024-09-22",
    remarks: "Verified & classed by DNV",
    swiftFocalPoint: "Marcus Vance",
  },
];

export const statusMeta: Record<DocStatus, { label: string; dot: string }> = {
  review: { label: "Under Review", dot: "bg-warning" },
  approved: { label: "Approved", dot: "bg-success" },
  verified: { label: "Verified & Classed", dot: "bg-info" },
};

// Buckets a free-text status value (PO Status, Invoice Submission Status, Payment Status, ...)
// into a color tone for the WIP table badges.
export function statusTone(value: string): "success" | "warning" | "danger" | "neutral" {
  const v = value.trim().toLowerCase();
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
