"use client";

import { useMemo } from "react";
import type { UserDocument } from "../user/userData";
import { formatAed, formatAedCompact } from "./currency";

// ── helpers ──────────────────────────────────────────────────────────────────

function pct(value: number, total: number): number {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

// ── sub-components ────────────────────────────────────────────────────────────

function TrendArrow({ positive }: { positive: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 ${positive ? "text-success" : "text-danger"}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {positive ? (
        <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
      ) : (
        <path d="M5 14l7 7m0 0l7-7m-7 7V3" />
      )}
    </svg>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  accent?: "primary" | "success" | "warning" | "info";
  animIndex?: number;
}

function KpiCard({ label, value, sub, trend, accent = "primary", animIndex = 0 }: KpiCardProps) {
  const accentBorder: Record<string, string> = {
    primary: "border-primary/20",
    success: "border-success/20",
    warning: "border-warning/20",
    info: "border-info/20",
  };
  const dotColor: Record<string, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-popover ${accentBorder[accent]}`}
      style={{ animationDelay: `${animIndex * 60}ms` }}
    >
      <span className={`absolute right-4 top-4 h-2 w-2 rounded-full ${dotColor[accent]}`} />
      <p className="mb-0.5 text-label-sm uppercase tracking-wider text-text-secondary">{label}</p>
      <p className="text-headline-lg text-text-primary">{value}</p>
      {sub && <p className="mt-0.5 text-body-sm text-placeholder">{sub}</p>}
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-label-sm font-medium">
          <TrendArrow positive={trend >= 0} />
          <span className={trend >= 0 ? "text-success" : "text-danger"}>
            {trend >= 0 ? "+" : ""}
            {trend}% from baseline
          </span>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface FinancialMetricsProps {
  documents: UserDocument[];
}

export default function FinancialMetrics({ documents }: FinancialMetricsProps) {
  const stats = useMemo(() => {
    const totalSwift = documents.reduce((s, d) => s + (d.swiftValue ?? 0), 0);
    const totalIdc = documents.reduce((s, d) => s + (d.idcValue ?? 0), 0);
    const profitRate =
      totalSwift > 0 ? Math.round(((totalSwift - totalIdc) / totalSwift) * 100) : 0;

    const poIssued = documents.filter((d) =>
      ["issued", "approved"].includes((d.poStatus ?? "").trim().toLowerCase()),
    ).length;
    const invSubmitted = documents.filter((d) =>
      ["submitted", "issued"].includes((d.invoiceSubmissionStatus ?? "").trim().toLowerCase()),
    ).length;
    const payReceived = documents.filter((d) =>
      ["received", "paid"].includes((d.paymentStatus ?? "").trim().toLowerCase()),
    ).length;
    const completed = documents.filter(
      (d) => (d.completionReportSign ?? "").trim().toLowerCase() === "signed",
    ).length;

    // top customers
    const custMap = new Map<string, number>();
    for (const d of documents) {
      if (d.customer) custMap.set(d.customer, (custMap.get(d.customer) ?? 0) + (d.swiftValue ?? 0));
    }
    const topCustomers = [...custMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    // last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = documents.filter(
      (d) => new Date(d.uploadedAt).getTime() >= thirtyDaysAgo,
    );

    return {
      totalSwift,
      totalIdc,
      profitRate,
      profitDelta: profitRate - 18,
      totalJobs: documents.length,
      poIssuedCount: poIssued,
      poRate: pct(poIssued, documents.length),
      invoiceSubmittedCount: invSubmitted,
      invoiceRate: pct(invSubmitted, documents.length),
      paymentReceivedCount: payReceived,
      paymentRate: pct(payReceived, documents.length),
      completedCount: completed,
      completionRate: pct(completed, documents.length),
      topCustomers,
      recentMonthSwift: recent.reduce((s, d) => s + (d.swiftValue ?? 0), 0),
      recentMonthCount: recent.length,
    };
  }, [documents]);

  return (
    <section aria-label="Financial Analytics" className="space-y-5">
      {/* header */}
      <div className="flex items-center gap-2">
        <h2 className="text-headline-md text-text-primary">Analytics Dashboard</h2>
        <span className="rounded-full border border-border bg-surface-inset px-2.5 py-0.5 text-label-sm text-text-secondary">
          Live
        </span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-success" title="Updates on upload" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Total Swift Revenue"
          value={formatAedCompact(stats.totalSwift)}
          sub={formatAed(stats.totalSwift)}
          accent="primary"
          animIndex={0}
        />
        <KpiCard
          label="Profit Margin"
          value={`${stats.profitRate}%`}
          sub={`IDC Cost ${formatAedCompact(stats.totalIdc)}`}
          trend={stats.profitDelta}
          accent="success"
          animIndex={1}
        />
        <KpiCard
          label="PO Conversion"
          value={`${stats.poRate}%`}
          sub={`${stats.poIssuedCount} / ${stats.totalJobs} jobs`}
          accent="info"
          animIndex={2}
        />
        <KpiCard
          label="Payment Collected"
          value={`${stats.paymentRate}%`}
          sub={`${stats.paymentReceivedCount} payments received`}
          accent={stats.paymentRate >= 60 ? "success" : "warning"}
          animIndex={3}
        />
        <KpiCard
          label="Jobs Completed"
          value={`${stats.completionRate}%`}
          sub={`${stats.completedCount} signed off`}
          accent="info"
          animIndex={4}
        />
      </div>

      {/* bottom row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Customers */}
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-4 text-headline-sm text-text-primary">Top Customers</h3>
          <div className="divide-y divide-border">
            {stats.topCustomers.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-inset text-[11px] font-bold text-text-secondary">
                    {i + 1}
                  </span>
                  <span className="text-body-sm font-medium text-text-primary">{c.name}</span>
                </div>
                <span className="text-label-sm font-semibold text-secondary">{formatAedCompact(c.value)}</span>
              </div>
            ))}
            {stats.topCustomers.length === 0 && (
              <p className="py-2 text-body-sm text-placeholder">No customers yet.</p>
            )}
          </div>
        </article>

        {/* Job Pipeline Funnel */}
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-1 text-headline-sm text-text-primary">Job Pipeline</h3>
          <p className="mb-4 text-body-sm text-text-secondary">
            Last 30 days:{" "}
            <span className="font-semibold text-text-primary">
              {stats.recentMonthCount} jobs
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-secondary">
              {formatAedCompact(stats.recentMonthSwift)}
            </span>
          </p>
          <div className="space-y-3">
            {[
              {
                label: "PO Issued",
                rate: stats.poRate,
                count: stats.poIssuedCount,
                color: "bg-info",
              },
              {
                label: "Invoice Submitted",
                rate: stats.invoiceRate,
                count: stats.invoiceSubmittedCount,
                color: "bg-warning",
              },
              {
                label: "Payment Received",
                rate: stats.paymentRate,
                count: stats.paymentReceivedCount,
                color: "bg-success",
              },
              {
                label: "Completion Signed",
                rate: stats.completionRate,
                count: stats.completedCount,
                color: "bg-secondary",
              },
            ].map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-text-secondary">
                  <span>{step.label}</span>
                  <span className="font-semibold text-text-primary">
                    {step.count} · {step.rate}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-inset">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${step.color}`}
                    style={{ width: `${step.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
