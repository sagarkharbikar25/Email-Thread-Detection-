import React from "react";

interface AnalysisTimeCardProps {
  duration: string;
  status: string;
  timestamp: string;
  onInfoClick?: () => void;
}

export function AnalysisTimeCard({
  duration,
  status,
  timestamp,
  onInfoClick,
}: AnalysisTimeCardProps) {
  return (
    <div className="col-span-12 sm:col-span-6 lg:col-span-2 card-base flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-2">
        <span>ANALYSIS TIME</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Analysis processing pipeline latency"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      <div className="flex flex-col justify-center flex-1 py-1">
        <div className="flex items-center gap-2 text-[#c0c1ff] mb-2">
          <span className="material-symbols-outlined text-indigo-400 text-xl">
            schedule
          </span>
          <span className="text-2xl font-bold tracking-tight text-[#d7e3fb]">
            {duration}
          </span>
        </div>
        <span className="text-xs text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          {status}
        </span>
        <span className="text-[10px] text-[#908fa0] font-mono">{timestamp}</span>
      </div>
    </div>
  );
}
