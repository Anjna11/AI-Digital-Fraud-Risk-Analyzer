"use client";

import { RiskLevel } from "@/types/analysis";
import { riskStyles } from "@/lib/risk-styles";
import { cn } from "@/lib/utils";

interface RiskScoreProps {
  score: number; // 0–100
  level: RiskLevel;
  size?: "sm" | "lg";
  className?: string;
}

// Semi-circular gauge, 180deg sweep, needle-less — the arc itself fills
// proportionally to the score, in the risk color. Track behind stays neutral.
export function RiskScore({ score, level, size = "lg", className }: RiskScoreProps) {
  const style = riskStyles[level];
  const dim = size === "lg" ? 180 : 120;
  const stroke = size === "lg" ? 14 : 10;
  const radius = dim / 2 - stroke;
  const circumference = Math.PI * radius; // half circumference (180deg arc)
  const filled = (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={dim}
        height={dim / 2 + stroke}
        viewBox={`0 0 ${dim} ${dim / 2 + stroke}`}
        role="img"
        aria-label={`Risk score ${score} out of 100, ${style.label}`}
      >
        <path
          d={`M ${stroke} ${dim / 2} A ${radius} ${radius} 0 0 1 ${dim - stroke} ${dim / 2}`}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke} ${dim / 2} A ${radius} ${radius} 0 0 1 ${dim - stroke} ${dim / 2}`}
          fill="none"
          stroke={style.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.8s ease-out" }}
        />
      </svg>
      <div className="-mt-2 text-center">
        <div
          className={cn(
            "font-mono font-semibold tabular-nums",
            size === "lg" ? "text-4xl" : "text-2xl"
          )}
          style={{ color: style.color }}
        >
          {score}
          <span className="text-base font-normal text-muted">/100</span>
        </div>
      </div>
    </div>
  );
}
