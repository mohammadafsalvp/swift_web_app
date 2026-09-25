import { useMemo } from "react";
import {
  statusFilterFields,
  statusFilterValue,
  type DocStatus,
  type StatusFilterKey,
  type StatusFilterState,
  type WipFields,
} from "./data";

interface StatusFilterBarProps<T extends WipFields & { status: DocStatus }> {
  documents: T[];
  filters: StatusFilterState;
  onChange: (key: StatusFilterKey, value: string) => void;
}

export default function StatusFilterBar<T extends WipFields & { status: DocStatus }>({
  documents,
  filters,
  onChange,
}: StatusFilterBarProps<T>) {
  const optionsByField = useMemo(() => {
    const map = {} as Record<StatusFilterKey, string[]>;
    for (const { key } of statusFilterFields) {
      const values = new Set<string>();
      for (const doc of documents) {
        const value = statusFilterValue(doc, key);
        if (value) values.add(value);
      }
      map[key] = Array.from(values).sort((a, b) => a.localeCompare(b));
    }
    return map;
  }, [documents]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statusFilterFields.map(({ key, label }) => (
        <select
          key={key}
          aria-label={label}
          value={filters[key]}
          onChange={(e) => onChange(key, e.target.value)}
          className={`rounded-lg border px-2.5 py-2 text-label-md transition ${
            filters[key] !== "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface text-text-secondary hover:bg-surface-inset"
          }`}
        >
          <option value="all">{label}: All</option>
          {optionsByField[key].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
