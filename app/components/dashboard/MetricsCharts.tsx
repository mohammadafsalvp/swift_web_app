"use client";

import { useMemo } from "react";
import { IconCalendar, IconExpand, IconFilter, IconSort } from "./icons";
import { processingRateBars, vaultLegend, vaultStacks, vaultTotalUsd } from "./data";
import { formatAed } from "./currency";
import type { UserDocument } from "../user/userData";

const ACTIVE_BAR_INDEX = 5;

interface MetricsChartsProps {
  documents?: UserDocument[];
}

export default function MetricsCharts({ documents = [] }: MetricsChartsProps) {
  // Derive live vault total from uploaded docs; fall back to seed constant when none available
  const { liveVaultUsd, liveGrowthPct, barHeights } = useMemo(() => {
    if (documents.length === 0) {
      return { liveVaultUsd: vaultTotalUsd, liveGrowthPct: 32.2, barHeights: processingRateBars };
    }

    const totalSwift = documents.reduce((s, d) => s + (d.swiftValue ?? 0), 0);

    // Build 12 monthly bars from uploadedAt timestamps
    const now = Date.now();
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const start = now - (12 - i) * 30 * 24 * 60 * 60 * 1000;
      const end = now - (11 - i) * 30 * 24 * 60 * 60 * 1000;
      return documents.filter((d) => {
        const t = new Date(d.uploadedAt).getTime();
        return t >= start && t < end;
      }).length;
    });
    const maxBucket = Math.max(...buckets, 1);
    const dynamicBars = buckets.map((b) => Math.round((b / maxBucket) * 95) + 5);

    // Growth vs seed
    const growthPct = vaultTotalUsd > 0
      ? Math.round(((totalSwift - vaultTotalUsd) / vaultTotalUsd) * 1000) / 10
      : 0;

    return {
      liveVaultUsd: totalSwift || vaultTotalUsd,
      liveGrowthPct: growthPct,
      barHeights: dynamicBars,
    };
  }, [documents]);

  const isPositive = liveGrowthPct >= 0;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* ── Processing Rate Chart ── */}
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
            <span className="mb-0.5 text-[11px] font-semibold text-text-primary">Latest</span>
          </div>
          <div className="flex h-44 items-end justify-between gap-1.5 pl-2 pr-10 sm:gap-2">
            {barHeights.map((height, i) => (
              <div
                key={i}
                className={`relative w-full rounded-t-sm transition-all duration-500 ${
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

      {/* ── Vault Total (live) ── */}
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
          <h2 className="text-headline-xl text-text-primary">{formatAed(liveVaultUsd)}</h2>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-label-sm ${
              isPositive
                ? "border-success/20 bg-success/5 text-success"
                : "border-danger/20 bg-danger/5 text-danger"
            }`}
          >
            {liveGrowthPct > 0 ? "+" : ""}
            {liveGrowthPct}%
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isPositive ? (
                <path
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              ) : (
                <path
                  d="M5 14l7 7m0 0l7-7m-7 7V3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              )}
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
