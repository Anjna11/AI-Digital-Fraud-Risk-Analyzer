"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { AnalysisCard } from "@/components/analysis-card/analysis-card";
import { StatsSummary } from "@/components/dashboard/stats-summary";
import { RecentScansTable } from "@/components/dashboard/recent-scans-table";
import { getDashboardSummary } from "@/services/analysisService";
import { DashboardSummary } from "@/types/analysis";
import { Link2, MessageSquare, QrCode } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary);
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar variant="app" />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink">Welcome back, Anjna</h1>
        <p className="mt-1 text-ink-dim">What would you like to check?</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <AnalysisCard
            href="/analyze/url"
            title="Check URL"
            description="Analyze a suspicious website link."
            Icon={Link2}
          />
          <AnalysisCard
            href="/analyze/message"
            title="Analyze message"
            description="Check an SMS, email, or chat message."
            Icon={MessageSquare}
          />
          <AnalysisCard
            href="/analyze/qr"
            title="Scan QR"
            description="Upload a QR code before you scan it."
            Icon={QrCode}
          />
        </div>

        <div className="mt-10">
          {summary ? (
            <StatsSummary summary={summary} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-surface" />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          {summary ? (
            <RecentScansTable items={summary.recent} />
          ) : (
            <div className="h-48 animate-pulse rounded-lg border border-border bg-surface" />
          )}
        </div>
      </div>
    </div>
  );
}
