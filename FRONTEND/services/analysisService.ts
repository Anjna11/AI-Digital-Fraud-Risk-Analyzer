import {
  AnalysisResult,
  DashboardSummary,
  HistoryItem,
} from "@/types/analysis";
import { mockHistory, mockResults } from "@/lib/mock-data/results";

// Analysis goes directly to the Python AI service.
// Spring Boot is reserved for authentication/JWT, not fraud inference.
const AI_SERVICE_URL = (
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "http://localhost:8001"
).replace(/\/+$/, "");

const delay = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms));

async function postAnalysis(
  endpoint: "url" | "message" | "qr",
  value: string
): Promise<AnalysisResult> {
  const response = await fetch(`${AI_SERVICE_URL}/analyze/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail =
      body?.detail ??
      body?.message ??
      `Analysis failed (${response.status}). Please try again.`;
    throw new Error(
      response.status === 503
        ? `${detail} Check that the Python AI service and trained model files are available.`
        : detail
    );
  }

  const result = (await response.json()) as AnalysisResult;

  if (
    typeof result.riskScore !== "number" ||
    typeof result.riskLevel !== "string" ||
    !Array.isArray(result.reasons) ||
    !Array.isArray(result.recommendations)
  ) {
    throw new Error("The Python AI service returned an unexpected response.");
  }

  // Python currently returns no database ID because analysis is no longer
  // persisted through Spring Boot. Provide a client-side ID for result UI.
  return {
    ...result,
    id: result.id || globalThis.crypto.randomUUID(),
    timestamp: result.timestamp || new Date().toISOString(),
  };
}

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  return postAnalysis("url", url);
}

export async function analyzeMessage(message: string): Promise<AnalysisResult> {
  return postAnalysis("message", message);
}

export async function analyzeQr(imageDataUrl: string): Promise<AnalysisResult> {
  return postAnalysis("qr", imageDataUrl);
}

// These sections remain demo data until history/report APIs are implemented
// independently of Spring Boot.
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
