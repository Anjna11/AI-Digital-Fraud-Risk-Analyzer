"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UrlForm } from "@/components/analysis-form/url-form";
import { ResultCard } from "@/components/result-card/result-card";
import { analyzeUrl } from "@/services/analysisService";
import { AnalysisResult } from "@/types/analysis";
import { Info, ScanSearch } from "lucide-react";

export default function UrlAnalyzerPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze(url: string) {
    setLoading(true);
    const res = await analyzeUrl(url);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar variant="app" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink">URL analysis</h1>
        <p className="mt-1 text-ink-dim">
          Paste a link before you open it. We&apos;ll check its structure against
          patterns commonly seen in fraudulent sites.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-md border border-border bg-surface p-4 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 flex-none text-accent" />
          This is a risk assessment, not a guarantee. Use the result alongside
          your own judgment.
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanSearch className="h-4 w-4 text-accent" />
              Enter a URL
            </CardTitle>
            <CardDescription>Include the full address, starting with http:// or https://</CardDescription>
          </CardHeader>
          <CardContent>
            <UrlForm onAnalyze={handleAnalyze} loading={loading} />
          </CardContent>
        </Card>

        {loading && (
          <div className="relative mt-6 overflow-hidden rounded-lg border border-border bg-surface p-10 text-center">
            <div className="scan-line" />
            <p className="text-sm text-muted">Checking domain structure and indicators…</p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-6">
            <ResultCard result={result} onAnalyzeAnother={() => setResult(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
