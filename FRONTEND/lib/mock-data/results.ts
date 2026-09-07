import { AnalysisResult, HistoryItem } from "@/types/analysis";

export const mockResults: Record<string, AnalysisResult> = {
  "r-url-001": {
    id: "r-url-001",
    type: "url",
    input: "https://amazon-offer-claim.xyz/reward",
    riskScore: 87,
    riskLevel: "critical",
    scamCategory: "Brand impersonation",
    reasons: [
      "Domain mimics a well-known brand but is not an official domain",
      "Unusual top-level domain (.xyz) rarely used by legitimate retailers",
      "URL structure designed to look like a reward or claim page",
      "No verifiable SSL organization identity found",
    ],
    recommendations: [
      "Do not enter personal or banking information on this page",
      "Do not click any further links from this domain",
      "Report the message or source that shared this link",
    ],
    timestamp: "2026-07-29T09:14:00.000Z",
  },
  "r-msg-001": {
    id: "r-msg-001",
    type: "message",
    input:
      "Congratulations! You have won ₹50,000. Click this link immediately to claim your reward.",
    riskScore: 74,
    riskLevel: "high",
    scamCategory: "Lottery / reward scam",
    reasons: [
      "Uses urgency language ('immediately') to pressure quick action",
      "Promises an unsolicited monetary reward",
      "Contains a link shortener commonly used to hide destinations",
      "No prior context of entering a contest or lottery",
    ],
    recommendations: [
      "Do not click the link in this message",
      "Do not reply with personal or bank details",
      "Verify directly with the organization through official channels",
    ],
    timestamp: "2026-07-28T18:42:00.000Z",
  },
  "r-qr-001": {
    id: "r-qr-001",
    type: "qr",
    input: "qr-scan-4821.png",
    riskScore: 78,
    riskLevel: "high",
    scamCategory: "Payment redirection",
    reasons: [
      "QR code encodes a payment request to an unfamiliar UPI handle",
      "Destination does not match the merchant context provided",
      "Payment amount is pre-filled and non-editable",
    ],
    recommendations: [
      "Do not complete this payment",
      "Confirm the payee identity directly with the merchant",
      "Scan only QR codes displayed at verified payment counters",
    ],
    timestamp: "2026-07-27T12:05:00.000Z",
  },
  "r-msg-002": {
    id: "r-msg-002",
    type: "message",
    input:
      "Your bank statement for June is now available. Log in to your net banking portal to view it.",
    riskScore: 18,
    riskLevel: "safe",
    scamCategory: undefined,
    reasons: [
      "No links included in the message",
      "No request for credentials, OTP, or payment",
      "Language matches standard account notification patterns",
    ],
    recommendations: [
      "Still verify by logging in directly through your bank's official app or site",
      "Never share OTPs even if a follow-up call claims to be your bank",
    ],
    timestamp: "2026-07-26T08:00:00.000Z",
  },
};

export const mockHistory: HistoryItem[] = [
  {
    id: "r-url-001",
    type: "url",
    inputPreview: "amazon-offer-claim.xyz/reward",
    riskScore: 87,
    riskLevel: "critical",
    date: "2026-07-29T09:14:00.000Z",
  },
  {
    id: "r-qr-001",
    type: "qr",
    inputPreview: "Unknown QR — payment request",
    riskScore: 78,
    riskLevel: "high",
    date: "2026-07-27T12:05:00.000Z",
  },
  {
    id: "r-msg-001",
    type: "message",
    inputPreview: "Congratulations! You have won ₹50,000...",
    riskScore: 74,
    riskLevel: "high",
    date: "2026-07-28T18:42:00.000Z",
  },
  {
    id: "r-msg-002",
    type: "message",
    inputPreview: "Your bank statement for June is now available...",
    riskScore: 18,
    riskLevel: "safe",
    date: "2026-07-26T08:00:00.000Z",
  },
];
