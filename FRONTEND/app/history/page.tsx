"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar/navbar";
import { RiskBadge } from "@/components/risk-badge/risk-badge";
import { getHistory } from "@/services/analysisService";
import { HistoryItem, RiskLevel } from "@/types/analysis";
import { Link2, MessageSquare, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcon = { url: Link2, message: MessageSquare, qr: QrCode };

type FilterKey = "all" | RiskLevel;

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "high", label: "High Risk" },
  { key: "medium", label: "Medium Risk" },
  { key: "safe", label: "Low / Safe" },
];

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    getHistory().then(setItems);
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "high") return item.riskLevel === "high" || item.riskLevel === "critical";
    return item.riskLevel === filter;
  });

  return (
    <div className="min-h-screen bg-bg">
      <Navbar variant="app" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink">Scan history</h1>
        <p className="mt-1 text-ink-dim">Every analysis you&apos;ve run, in one place.</p>

        <div className="mt-6 flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                filter === f.key
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border-strong text-ink-dim hover:bg-surface"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {filtered.map((item) => {
            const Icon = typeIcon[item.type];
            return (
              <Link
                key={item.id}
                href={`/report/${item.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 hover:bg-surface-hover"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon className="h-4 w-4 flex-none text-muted" />
                  <div className="min-w-0">
                    <div className="truncate font-mono text-sm text-ink-dim">
                      {item.inputPreview}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-none items-center gap-3">
                  <span className="font-mono text-sm text-muted">{item.riskScore}</span>
                  <RiskBadge level={item.riskLevel} size="sm" />
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
              No analyses match this filter yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
