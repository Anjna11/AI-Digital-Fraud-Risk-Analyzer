import {
  AnalysisResult,
  DashboardSummary,
  HistoryItem,
} from "@/types/analysis";
import { mockHistory, mockResults } from "@/lib/mock-data/results";

const delay = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms));

async function postAnalysis(endpoint: "url" | "message" | "qr", value: string): Promise<AnalysisResult> {
  const response = await fetch(`http://localhost:8080/api/analyze/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ??
      body?.message ??
      `Analysis failed (${response.status}). Please try again.`
    );
  }

  return response.json();
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
