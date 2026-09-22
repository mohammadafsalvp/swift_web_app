export type DocStatus = "review" | "approved" | "verified";

export interface DocumentRow {
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
  },
];

export const statusMeta: Record<DocStatus, { label: string; dot: string }> = {
  review: { label: "Under Review", dot: "bg-warning" },
  approved: { label: "Approved", dot: "bg-success" },
  verified: { label: "Verified & Classed", dot: "bg-info" },
};

export const filterTabs = [
  { key: "pending", label: "Pending Review", count: 70 },
  { key: "approved", label: "Approved", count: 85 },
  { key: "assigned", label: "Assigned", count: 53 },
  { key: "archived", label: "Archived", count: 56 },
] as const;

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
