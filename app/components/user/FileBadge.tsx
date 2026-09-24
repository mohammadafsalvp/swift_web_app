import { fileExtension } from "./userData";

export default function FileBadge({ fileName }: { fileName: string }) {
  return (
    <span className="inline-flex h-8 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface-inset font-mono text-[10px] font-semibold text-text-secondary">
      {fileExtension(fileName).slice(0, 4)}
    </span>
  );
}
