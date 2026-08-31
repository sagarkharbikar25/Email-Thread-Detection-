import React from "react";

interface ClassificationCardProps {
  classification: string;
  fullName: string;
  confidence: string;
  onInfoClick?: () => void;
}

export function ClassificationCard({
  classification,
  fullName,
  confidence,
  onInfoClick,
}: ClassificationCardProps) {
  return (
    <div className="col-span-12 sm:col-span-6 lg:col-span-3 card-base flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-2">
        <span>CLASSIFICATION</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="ML-driven forensic attack classification"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 text-center py-2">
        <span className="text-3xl font-extrabold text-red-400 mb-1 tracking-tight">
          {classification}
        </span>
        <span className="text-xs text-[#d7e3fb] font-medium mb-3">
          {fullName}
        </span>
        <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded text-[10px] uppercase tracking-wider font-mono font-semibold">
          {confidence}
        </span>
      </div>
    </div>
  );
}
