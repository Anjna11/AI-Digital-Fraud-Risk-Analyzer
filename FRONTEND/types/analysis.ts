export type RiskLevel = "safe" | "medium" | "high" | "critical";

export type AnalysisType = "url" | "message" | "qr";

export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  input: string;
  riskScore: number; // 0–100
  riskLevel: RiskLevel;
  scamCategory?: string;
  reasons: string[];
  recommendations: string[];
  timestamp: string; // ISO string
}

export interface HistoryItem {
  id: string;
  type: AnalysisType;
  inputPreview: string;
  riskScore: number;
  riskLevel: RiskLevel;
  date: string; // ISO string
}

export interface DashboardSummary {
  totalAnalyses: number;
  highRiskCount: number;
  safeCount: number;
  recent: HistoryItem[];
}

export const riskLevelFromScore = (score: number): RiskLevel => {
  if (score >= 85) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "safe";
};

export const riskLevelLabel: Record<RiskLevel, string> = {
  safe: "Safe",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical Risk",
};
