import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export function AnalysisCard({
  href,
  title,
  description,
  Icon,
}: {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-hover"
    >
      <div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div className="mt-4 font-medium text-ink">{title}</div>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="mt-4 flex items-center gap-1 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
        Start <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
