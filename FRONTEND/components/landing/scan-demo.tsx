import { RiskBadge } from "@/components/risk-badge/risk-badge";

export function ScanDemo() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
      <div className="scan-line" />
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="border-b border-border p-6 sm:border-b-0 sm:border-r">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">
            Incoming message
          </div>
          <p className="mt-3 font-mono text-sm leading-relaxed text-ink-dim">
            <span className="rounded bg-risk-medium-soft px-1 text-risk-medium">
              Congratulations!
            </span>{" "}
            You have{" "}
            <span className="rounded bg-risk-medium-soft px-1 text-risk-medium">
              won ₹50,000
            </span>
            . Click this link{" "}
            <span className="rounded bg-risk-high-soft px-1 text-risk-high">
              immediately
            </span>{" "}
            to claim your reward:{" "}
            <span className="rounded bg-risk-high-soft px-1 text-risk-high">
              bit.ly/claim-4821
            </span>
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 p-6">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">
            Risk assessment
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-3xl font-semibold text-risk-high">74</span>
            <div>
              <RiskBadge level="high" size="sm" />
              <div className="mt-1 text-xs text-muted">Lottery / reward scam</div>
            </div>
          </div>
          <ul className="mt-1 space-y-1.5 text-xs text-ink-dim">
            <li>· Urgency language detected</li>
            <li>· Unsolicited reward claim</li>
            <li>· Shortened link masking destination</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
