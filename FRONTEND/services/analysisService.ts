import {
  AnalysisResult,
  AnalysisType,
  DashboardSummary,
  HistoryItem,
  riskLevelFromScore,
} from "@/types/analysis";
import { mockHistory, mockResults } from "@/lib/mock-data/results";

const delay = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms));

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

/**
 * Very small heuristic scorer used ONLY to make the mock feel responsive
 * to what the user actually typed. This has no relationship to the real
 * AI scoring model that ai-service will eventually provide.
 */
function heuristicScore(input: string, type: AnalysisType): number {
  const text = input.toLowerCase();
  let score = 12;

  const urgencyWords = ["immediately", "urgent", "now", "claim", "winner", "won", "verify now"];
  const moneyWords = ["₹", "$", "reward", "prize", "refund", "payment", "lottery"];
  const suspiciousDomainHints = [".xyz", ".top", ".click", "bit.ly", "tinyurl", "-offer", "-claim"];

  urgencyWords.forEach((w) => { if (text.includes(w)) score += 12; });
  moneyWords.forEach((w) => { if (text.includes(w)) score += 10; });

  if (type === "url") {
    suspiciousDomainHints.forEach((w) => { if (text.includes(w)) score += 18; });
    if (!text.startsWith("https://")) score += 8;
  }

  if (type === "qr") {
    score += 35; // unknown destination by default until decoded
  }

  return Math.max(4, Math.min(96, score));
}

function buildReasons(type: AnalysisType, score: number, input: string): string[] {
  const reasons: string[] = [];
  const text = input.toLowerCase();

  if (type === "url") {
    if (!text.startsWith("https://")) reasons.push("Connection is not secured with HTTPS");
    if ([".xyz", ".top", ".click"].some((s) => text.includes(s)))
      reasons.push("Uses a top-level domain frequently associated with scam campaigns");
    if (text.includes("-offer") || text.includes("-claim"))
      reasons.push("URL structure mimics a reward or claim landing page");
    if (reasons.length === 0)
      reasons.push("Domain structure appears consistent with standard registration patterns");
  }

  if (type === "message") {
    if (["immediately", "urgent", "now"].some((w) => text.includes(w)))
      reasons.push("Uses urgency language to pressure quick action");
    if (["won", "winner", "prize", "reward", "lottery"].some((w) => text.includes(w)))
      reasons.push("References an unsolicited prize, reward, or lottery win");
    if (text.includes("http") || text.includes("click"))
      reasons.push("Contains a link paired with a call to click immediately");
    if (reasons.length === 0)
      reasons.push("No strong urgency, prize, or credential-harvesting language detected");
  }

  if (type === "qr") {
    reasons.push("Destination encoded in the QR could not be verified against a known merchant");
    if (score > 60) reasons.push("Payment amount appears pre-filled and non-editable");
  }

  return reasons;
}

function buildRecommendations(level: string): string[] {
  if (level === "critical" || level === "high") {
    return [
      "Do not enter personal, banking, or OTP details",
      "Do not proceed with any payment or link in this content",
      "Report or block the source that shared this",
    ];
  }
  if (level === "medium") {
    return [
      "Proceed cautiously and verify through an official channel before acting",
      "Avoid sharing sensitive information until the source is confirmed",
    ];
  }
  return [
    "No immediate action needed, but stay alert to follow-up requests",
    "Verify independently if this later asks for payment or credentials",
  ];
}

function toResult(type: AnalysisType, input: string): AnalysisResult {
  const riskScore = heuristicScore(input, type);
  const riskLevel = riskLevelFromScore(riskScore);
  return {
    id: nextId(`r-${type}`),
    type,
    input,
    riskScore,
    riskLevel,
    scamCategory:
      riskLevel === "safe"
        ? undefined
        : type === "url"
        ? "Brand impersonation"
        : type === "message"
        ? "Lottery / reward scam"
        : "Payment redirection",
    reasons: buildReasons(type, riskScore, input),
    recommendations: buildRecommendations(riskLevel),
    timestamp: new Date().toISOString(),
  };
}

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const response = await fetch("http://localhost:8080/api/analyze/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: url }),
  });
  return await response.json();
}

export async function analyzeMessage(message: string): Promise<AnalysisResult> {
  const response = await fetch("http://localhost:8080/api/analyze/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: message }),
  });
  return await response.json();
}

export async function analyzeQr(fileName: string): Promise<AnalysisResult> {
  const response = await fetch("http://localhost:8080/api/analyze/qr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: fileName }),
  });
  return await response.json();
}

export async function getHistory(): Promise<HistoryItem[]> {
  await delay(400);
  return mockHistory;
}

export async function getReport(id: string): Promise<AnalysisResult | null> {
  await delay(400);
  return mockResults[id] ?? null;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay(400);
  const highRiskCount = mockHistory.filter(
    (h) => h.riskLevel === "high" || h.riskLevel === "critical"
  ).length;
  const safeCount = mockHistory.filter((h) => h.riskLevel === "safe").length;
  return {
    totalAnalyses: mockHistory.length,
    highRiskCount,
    safeCount,
    recent: mockHistory.slice(0, 3),
  };
}
