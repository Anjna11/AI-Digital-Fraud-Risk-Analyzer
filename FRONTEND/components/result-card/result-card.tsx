import { AnalysisResult } from "@/types/analysis";
import { RiskScore } from "@/components/risk-score/risk-score";
import { RiskBadge } from "@/components/risk-badge/risk-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/recommendation-card/recommendation-card";
import { AlertTriangle, Link2, MessageSquare, QrCode } from "lucide-react";

const typeMeta = {
  url: { label: "URL Analysis", Icon: Link2 },
  message: { label: "Message Analysis", Icon: MessageSquare },
  qr: { label: "QR Analysis", Icon: QrCode },
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ResultCard({
  result,
  onAnalyzeAnother,
}: {
  result: AnalysisResult;
    onAnalyzeAnother?: () => void;
}) {
  const { label, Icon } = typeMeta[result.type];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </div>
          <div className="mt-2 max-w-md truncate font-mono text-sm text-ink-dim">
            {result.input}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <RiskBadge level={result.riskLevel} />
            {result.scamCategory && (
              <span className="text-sm text-muted">· {result.scamCategory}</span>
            )}
          </div>
        </div>
        <RiskScore score={result.riskScore} level={result.riskLevel} size="sm" />
      </div>

      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
            <AlertTriangle className="h-4 w-4 text-risk-medium" />
            Why this score
          </div>
          <ul className="space-y-2">
            {result.reasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-dim">
                <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-border-strong" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <RecommendationCard recommendations={result.recommendations} level={result.riskLevel} />
      </CardContent>

      <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted">Analyzed {formatTimestamp(result.timestamp)}</span>
        {onAnalyzeAnother && (
          <Button variant="secondary" size="sm" onClick={onAnalyzeAnother}>
            Analyze another
          </Button>
        )}
      </div>
    </Card>
  );
}
