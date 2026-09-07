import Link from "next/link";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { Button } from "@/components/ui/button";
import { ScanDemo } from "@/components/landing/scan-demo";
import { RiskScore } from "@/components/risk-score/risk-score";
import { RiskBadge } from "@/components/risk-badge/risk-badge";
import {
  Link2,
  MessageSquare,
  QrCode,
  ClipboardList,
  ScanSearch,
  FileCheck,
  Info,
} from "lucide-react";

const analysisTypes = [
  {
    href: "/analyze/url",
    Icon: Link2,
    title: "Website / URL",
    description: "Check a link before you open it or enter any information.",
  },
  {
    href: "/analyze/message",
    Icon: MessageSquare,
    title: "Message / Text",
    description: "Paste an SMS, email, or chat message that feels off.",
  },
  {
    href: "/analyze/qr",
    Icon: QrCode,
    title: "QR Code",
    description: "Upload a QR code before scanning it with a payment app.",
  },
];

const steps = [
  {
    Icon: ClipboardList,
    title: "Submit what you received",
    description: "Paste a link, a message, or upload a QR code image.",
  },
  {
    Icon: ScanSearch,
    title: "We check it against known patterns",
    description:
      "Domain structure, wording, and destination are checked against indicators seen in past fraud attempts.",
  },
  {
    Icon: FileCheck,
    title: "You get a risk assessment",
    description:
      "A score, plain-language reasons, and a recommendation — so you can decide what to do next.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Check before you trust.
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-dim">
              Veristate analyzes suspicious links, messages, and QR codes and
              gives you a plain-language risk assessment — before you click,
              reply, or pay.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">Create free account</Button>
              </Link>
              <Link href="/analyze/url">
                <Button size="lg" variant="outline">Try a URL check</Button>
              </Link>
            </div>
          </div>

          <ScanDemo />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-bg-elevated">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-sm font-medium uppercase tracking-wide text-accent">
            How it works
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {steps.map(({ Icon, title, description }, i) => (
              <div key={title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="mt-4 font-mono text-xs text-muted">
                  Step {i + 1}
                </div>
                <div className="mt-1 font-medium text-ink">{title}</div>
                <p className="mt-1.5 text-sm text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported analysis types */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-sm font-medium uppercase tracking-wide text-accent">
          What you can check
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {analysisTypes.map(({ href, Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border border-border bg-surface p-6 transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              <Icon className="h-6 w-6 text-accent" />
              <div className="mt-4 font-medium text-ink">{title}</div>
              <p className="mt-1.5 text-sm text-muted">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Example analysis */}
      <section className="border-t border-border bg-bg-elevated">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-sm font-medium uppercase tracking-wide text-accent">
            Example risk analysis
          </h2>
          <div className="mt-6 grid gap-8 rounded-lg border border-border bg-surface p-8 sm:grid-cols-[auto_1fr] sm:items-center">
            <RiskScore score={87} level="critical" />
            <div>
              <div className="font-mono text-sm text-ink-dim">
                amazon-offer-claim.xyz/reward
              </div>
              <div className="mt-2">
                <RiskBadge level="critical" />
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-ink-dim">
                <li>· Domain mimics a well-known brand but isn&apos;t official</li>
                <li>· Unusual top-level domain rarely used by retailers</li>
                <li>· Page structure designed to look like a reward claim</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Safety framing */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-start gap-4 rounded-lg border border-border bg-surface p-6">
          <Info className="mt-0.5 h-5 w-5 flex-none text-accent" />
          <p className="text-sm text-ink-dim">
            Veristate provides a <strong className="text-ink">risk assessment</strong>,
            not a guarantee. A low score means fewer known warning signs were
            found — it doesn&apos;t certify something is safe. A high score means
            multiple indicators associated with fraud attempts were detected.
            Always apply your own judgment before sharing information or making
            a payment.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Get a second opinion before you act.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-dim">
            Free to start. No card required.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Create free account</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
