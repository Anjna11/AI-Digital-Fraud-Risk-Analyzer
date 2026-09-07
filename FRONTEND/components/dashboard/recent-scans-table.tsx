import Link from "next/link";
import { HistoryItem } from "@/types/analysis";
import { RiskBadge } from "@/components/risk-badge/risk-badge";
import { Link2, MessageSquare, QrCode } from "lucide-react";

const typeIcon = { url: Link2, message: MessageSquare, qr: QrCode };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function RecentScansTable({ items }: { items: HistoryItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h3 className="text-sm font-medium text-ink">Recent analysis</h3>
        <Link href="/history" className="text-xs text-accent hover:underline">
          View all
        </Link>
      </div>
      <ul>
        {items.map((item) => {
          const Icon = typeIcon[item.type];
          return (
            <li key={item.id}>
              <Link
                href={`/report/${item.id}`}
                className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 hover:bg-surface-hover"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon className="h-4 w-4 flex-none text-muted" />
                  <span className="truncate font-mono text-sm text-ink-dim">
                    {item.inputPreview}
                  </span>
                </div>
                <div className="flex flex-none items-center gap-4">
                  <span className="hidden text-xs text-muted sm:inline">
                    {formatDate(item.date)}
                  </span>
                  <RiskBadge level={item.riskLevel} size="sm" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
