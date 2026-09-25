import type { DocStatus, WipFields } from "../dashboard/data";
import type { Sector } from "../dashboard/UploadModal";

export const categories = [
  { key: "engine-log", label: "Engine Repair Log" },
  { key: "blueprint", label: "Blueprint / CAD" },
  { key: "inspection", label: "Inspection Report" },
  { key: "certificate", label: "Class Certificate" },
  { key: "bulletin", label: "OEM Bulletin" },
] as const;

export type CategoryKey = (typeof categories)[number]["key"];

export const categoryLabel = Object.fromEntries(
  categories.map((c) => [c.key, c.label]),
) as Record<CategoryKey, string>;

export interface JobAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category?: CategoryKey;
  uploadedBy: string;
  uploadedAt: string; // ISO timestamp
  objectUrl?: string;
}

// shape mirrors the future `documents` table; `objectUrl` only exists for files uploaded this session
export interface UserDocument extends WipFields {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: CategoryKey;
  sector: Sector;
  vessel: string;
  flag?: string;
  flagLabel?: string;
  engine: string;
  uploadedBy: string;
  uploadedAt: string; // ISO timestamp
  status: DocStatus;
  objectUrl?: string;
  attachments?: JobAttachment[];
}

export interface Employee {
  name: string;
  role: string;
  initials: string;
}

// placeholder until authentication is added
export const currentUser: Employee = {
  name: "Edgar Humbert",
  role: "Marine Engineer",
  initials: "EH",
};

// views selectable from the sidebar tiles and the table tabs
export type LibraryView = "all" | "mine" | CategoryKey;

export const libraryTabs: { key: LibraryView; label: string }[] = [
  { key: "all", label: "All Documents" },
  { key: "mine", label: "My Uploads" },
  { key: "blueprint", label: "Blueprints" },
  { key: "engine-log", label: "Engine Logs" },
  { key: "inspection", label: "Inspections" },
  { key: "certificate", label: "Certificates" },
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  return `${day} ${month}, ${d.getFullYear()}`;
}

export function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "FILE" : fileName.slice(dot + 1).toUpperCase();
}
