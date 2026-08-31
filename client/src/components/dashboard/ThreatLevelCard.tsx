import React from "react";

interface ThreatLevelCardProps {
  level: string;
  description: string;
  onInfoClick?: () => void;
}

export function ThreatLevelCard({
  level,
  description,
  onInfoClick,
}: ThreatLevelCardProps) {
  return (
    <div className="col-span-12 sm:col-span-6 lg:col-span-3 card-base flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-2">
        <span>THREAT LEVEL</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Automated triage urgency indicator"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
          <span className="material-symbols-outlined text-red-400 text-2xl animate-pulse">
            priority_high
          </span>
        </div>
        <span className="text-lg font-extrabold text-red-400 tracking-wider">
          {level}
        </span>
        <span className="text-xs text-[#908fa0] mt-1 font-medium">
          {description}
        </span>
      </div>
    </div>
  );
}
