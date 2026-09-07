import Link from "next/link";
import { ShieldHalf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <ShieldHalf className="h-5 w-5 text-accent" />
              Veristate
            </div>
            <p className="mt-3 text-sm text-muted">
              A risk-assessment tool for suspicious links, messages, and QR codes.
              Findings are indicators to guide your judgment, not a guarantee.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">Product</div>
              <ul className="mt-3 space-y-2 text-sm text-ink-dim">
                <li><Link href="/analyze/url" className="hover:text-ink">URL analysis</Link></li>
                <li><Link href="/analyze/message" className="hover:text-ink">Message analysis</Link></li>
                <li><Link href="/analyze/qr" className="hover:text-ink">QR analysis</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">Account</div>
              <ul className="mt-3 space-y-2 text-sm text-ink-dim">
                <li><Link href="/login" className="hover:text-ink">Log in</Link></li>
                <li><Link href="/register" className="hover:text-ink">Create account</Link></li>
                <li><Link href="/history" className="hover:text-ink">Scan history</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">About</div>
              <ul className="mt-3 space-y-2 text-sm text-ink-dim">
                <li><span className="cursor-default">How scoring works</span></li>
                <li><span className="cursor-default">Limitations</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted">
          Veristate provides a risk assessment based on available indicators. It is not
          a guarantee that content is safe or fraudulent. Always apply your own judgment
          before sharing information or making a payment.
        </div>
      </div>
    </footer>
  );
}
