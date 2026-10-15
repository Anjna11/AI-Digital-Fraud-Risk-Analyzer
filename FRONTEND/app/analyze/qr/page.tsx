"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrUploadForm } from "@/components/analysis-form/qr-upload-form";
import { ResultCard } from "@/components/result-card/result-card";
import { analyzeQr } from "@/services/analysisService";
import { AnalysisResult } from "@/types/analysis";
import { Info, ScanSearch } from "lucide-react";

export default function QrAnalyzerPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(imageDataUrl: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeQr(imageDataUrl);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "QR analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar variant="app" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink">QR analysis</h1>
        <p className="mt-1 text-ink-dim">
          Upload a QR code before scanning it with a payment or camera app.
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
              Upload a QR code
            </CardTitle>
            <CardDescription>Take a clear photo or screenshot of the code.</CardDescription>
          </CardHeader>
          <CardContent>
            <QrUploadForm onAnalyze={handleAnalyze} loading={loading} />
          </CardContent>
        </Card>

        {error && (
          <div role="alert" className="mt-4 rounded-md border border-risk-high/30 bg-surface p-4 text-sm text-risk-high">
            {error}
          </div>
        )}

        {loading && (
          <div className="relative mt-6 overflow-hidden rounded-lg border border-border bg-surface p-10 text-center">
            <div className="scan-line" />
            <p className="text-sm text-muted">Decoding the QR destination and checking indicators…</p>
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
