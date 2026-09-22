import { IconCalendar, IconExpand, IconFilter, IconSort } from "./icons";
import { processingRateBars, vaultLegend, vaultStacks, vaultTotalUsd } from "./data";
import { formatAed } from "./currency";

const ACTIVE_BAR_INDEX = 5;

export default function MetricsCharts() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <article className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-sm text-text-primary">
            Document Processing &amp; Verification Rate
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Select Date Range"
              className="rounded-lg p-2 text-placeholder transition hover:bg-surface-inset hover:text-text-primary"
            >
              <IconCalendar className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="View Full Performance"
              className="rounded-lg p-2 text-placeholder transition hover:bg-surface-inset hover:text-text-primary"
            >
              <IconExpand className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative pb-2 pt-6">
          <div className="pointer-events-none absolute bottom-6 right-0 top-0 flex flex-col justify-between text-[11px] font-medium text-placeholder">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>
          <div className="pointer-events-none absolute left-[48%] top-0 flex -translate-x-1/2 flex-col items-center">
            <span className="mb-0.5 text-[11px] font-semibold text-text-primary">
              19 Sep
            </span>
          </div>
          <div className="flex h-44 items-end justify-between gap-1.5 pl-2 pr-10 sm:gap-2">
            {processingRateBars.map((height, i) => (
              <div
                key={i}
                className={`relative w-full rounded-t-sm ${
                  i === ACTIVE_BAR_INDEX
                    ? "bg-primary shadow-md"
                    : "bg-gradient-to-t from-border via-surface-inset to-surface"
                }`}
                style={{ height: `${height}%` }}
              >
                {i === ACTIVE_BAR_INDEX ? (
                  <div className="absolute -top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary" />
                ) : (
                  <div className="absolute -top-1 h-[2px] w-full bg-placeholder" />
                )}
              </div>
            ))}
          </div>
        </div>
      </article>

      <article className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-label-md uppercase tracking-wider text-text-secondary">
            Vault &amp; Processed Documents
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Filter Metrics"
              className="rounded-lg p-1.5 text-placeholder hover:bg-surface-inset hover:text-text-primary"
            >
              <IconFilter className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Sort Metrics"
              className="rounded-lg p-1.5 text-placeholder hover:bg-surface-inset hover:text-text-primary"
            >
              <IconSort className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-baseline gap-3">
          <h2 className="text-headline-xl text-text-primary">
            {formatAed(vaultTotalUsd)}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-inset px-2.5 py-0.5 text-label-sm text-text-secondary">
            32.2%
            <svg className="h-3 w-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </span>
        </div>

        <div className="grid grid-cols-3 items-end gap-6">
          {vaultStacks.map((stack) => (
            <div key={stack.label} className="flex flex-col items-center">
              <span className="mb-2 text-[11px] font-semibold text-text-secondary">
                {formatAed(stack.valueUsd)}
              </span>
              <div className="flex w-full max-w-[90px] flex-col gap-1.5">
                {stack.segments.map((h, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      i === stack.segments.length - 1 ? "bg-primary" : "bg-border"
                    }`}
                    style={{
                      height: `${h}px`,
                      opacity: 0.4 + (i / stack.segments.length) * 0.6,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[11px] font-medium text-text-secondary">
          {vaultLegend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${item.swatch}`} />
              {item.label}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}
