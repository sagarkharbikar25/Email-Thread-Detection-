"use client";

import React from "react";
import { ThreatSignal } from "../../types/forensics";

interface ThreatSignalsCardProps {
  signals: ThreatSignal[];
  onViewAll?: () => void;
  onInfoClick?: () => void;
}

export function ThreatSignalsCard({
  signals,
  onViewAll,
  onInfoClick,
}: ThreatSignalsCardProps) {
  return (
    <div className="col-span-12 lg:col-span-3 card-base flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-3">
        <span>THREAT SIGNALS</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Weighted heuristic signals triggered by analysis engines"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      <div className="space-y-2.5 flex-1">
        {signals.map((signal) => {
          const isCritical = signal.percentage >= 80;
          const isHigh = signal.percentage >= 65 && signal.percentage < 80;

          const barColor = isCritical
            ? "bg-red-500"
            : isHigh
            ? "bg-orange-500"
            : "bg-amber-500";

          const textColor = isCritical
            ? "text-red-400"
            : isHigh
            ? "text-orange-400"
            : "text-amber-400";

          return (
            <div key={signal.id} className="group">
              <div className="flex justify-between text-[11px] mb-1 font-medium">
                <span className="text-[#c7c4d7] group-hover:text-[#d7e3fb] transition-colors">
                  {signal.label}
                </span>
                <span className={`font-mono font-bold ${textColor}`}>
                  {signal.percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#1D293B] rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-700`}
                  style={{ width: `${signal.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewAll}
        className="mt-3 text-xs text-[#8083ff] hover:text-[#c0c1ff] font-medium flex items-center gap-1 hover:underline w-fit transition-colors"
      >
        <span>View All Signals</span>
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  );
}
