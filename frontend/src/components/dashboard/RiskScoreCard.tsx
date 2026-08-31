import React from "react";
import { RiskSeverity } from "../../types/forensics";

interface RiskScoreCardProps {
  score: number;
  category: RiskSeverity;
  onInfoClick?: () => void;
}

export function RiskScoreCard({
  score,
  category,
  onInfoClick,
}: RiskScoreCardProps) {
  // SVG calculation
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32
  const offset = circumference - (circumference * Math.min(score, 100)) / 100;

  const colorConfig: Record<
    RiskSeverity,
    { stroke: string; text: string; bgGlow: string }
  > = {
    critical: {
      stroke: "#ef4444",
      text: "text-red-500",
      bgGlow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    },
    high: {
      stroke: "#f97316",
      text: "text-orange-500",
      bgGlow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]",
    },
    medium: {
      stroke: "#f59e0b",
      text: "text-amber-500",
      bgGlow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    },
    low: {
      stroke: "#3b82f6",
      text: "text-blue-500",
      bgGlow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    },
    safe: {
      stroke: "#10b981",
      text: "text-emerald-500",
      bgGlow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
  };

  const config = colorConfig[category] || colorConfig.critical;

  return (
    <div className={`col-span-12 sm:col-span-6 lg:col-span-2 card-base flex flex-col justify-between ${config.bgGlow}`}>
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-2">
        <span>RISK SCORE</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Weighted heuristic aggregate forensic threat score"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-2 flex-1">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke="#1D293B"
              strokeWidth="8"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke={config.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="8"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${config.text} leading-none tracking-tight`}>
              {score}
            </span>
            <span className="text-[10px] text-[#908fa0] font-mono mt-0.5">/ 100</span>
          </div>
        </div>

        <span className={`${config.text} text-xs font-bold mt-2 uppercase tracking-wider`}>
          {category}
        </span>
      </div>
    </div>
  );
}
