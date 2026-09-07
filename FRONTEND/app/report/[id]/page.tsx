"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar/navbar";
import { ResultCard } from "@/components/result-card/result-card";
import { getReport } from "@/services/analysisService";
import { AnalysisResult } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null | undefined>(undefined);

  useEffect(() => {
    getReport(params.id).then(setResult);
  }, [params.id]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar variant="app" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Button variant="ghost" size="sm" onClick={() => router.push("/history")} className="-ml-3 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to history
        </Button>

        {result === undefined && (
          <div className="h-64 animate-pulse rounded-lg border border-border bg-surface" />
        )}

        {result === null && (
          <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
            Report not found.
          </div>
        )}

        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}
