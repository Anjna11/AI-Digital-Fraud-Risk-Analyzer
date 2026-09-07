import Link from "next/link";
import { ShieldHalf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar({ variant = "public" }: { variant?: "public" | "app" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2">
        <ShieldHalf className="h-5 w-5 text-accent" />
        <div className="leading-tight">
          <div className="font-semibold text-ink">Veristate</div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted">
            AI-Powered Digital Fraud Risk Analyzer
          </div>
        </div>
      </Link>

        {variant === "public" ? (
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Create account</Button>
            </Link>
          </nav>
        ) : (
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/dashboard" className="px-3 py-2 text-ink-dim hover:text-ink">
              Dashboard
            </Link>
            <Link href="/history" className="px-3 py-2 text-ink-dim hover:text-ink">
              History
            </Link>
            <Link href="/" className="px-3 py-2 text-ink-dim hover:text-ink">
              Log out
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
