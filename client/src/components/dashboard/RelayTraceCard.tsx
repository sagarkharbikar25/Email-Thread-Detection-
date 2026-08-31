"use client";

import React from "react";
import { RelayHop } from "../../types/forensics";

interface RelayTraceCardProps {
  hops: RelayHop[];
  onHopSelect?: (hop: RelayHop) => void;
}

export function RelayTraceCard({ hops, onHopSelect }: RelayTraceCardProps) {
  const borderSeverity = {
    error: "border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
    warning: "border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    primary: "border-indigo-500/60 shadow-[0_0_10px_rgba(99,102,241,0.2)]",
    neutral: "border-[#464554] shadow-sm",
  };

  return (
    <div className="col-span-12 lg:col-span-4 card-base flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-4">
        <span>RELAY TRACE</span>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          4 Hops Detected
        </span>
      </div>

      <div className="flex-1 flex items-center justify-between relative px-2 py-3">
        {/* Continuous gradient line behind nodes */}
        <div className="absolute top-[32px] left-8 right-8 h-[2px] bg-gradient-to-r from-red-500 via-amber-500 via-indigo-500 to-slate-600 opacity-60 z-0" />

        {hops.map((hop, index) => {
          const isLast = index === hops.length - 1;

          return (
            <React.Fragment key={hop.id}>
              {/* Hop Node */}
              <div
                onClick={() => onHopSelect?.(hop)}
                className="flex flex-col items-center relative z-10 w-16 text-center cursor-pointer group"
              >
                <div
                  className={`w-11 h-11 rounded-full bg-[#142032] border-2 flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-110 overflow-hidden ${
                    borderSeverity[hop.severity]
                  }`}
                >
                  {hop.isRecipient ? (
                    <span className="material-symbols-outlined text-indigo-400 text-lg">
                      person
                    </span>
                  ) : hop.flagUrl ? (
                    <img
                      src={hop.flagUrl}
                      alt={`${hop.location} flag`}
                      className="w-5 h-3.5 object-cover rounded-xs opacity-90"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[#908fa0] text-sm">
                      router
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-bold text-[#d7e3fb] truncate max-w-full group-hover:text-indigo-300 transition-colors">
                  {hop.location}
                </span>
                <span className="text-[9px] font-mono text-[#908fa0] truncate max-w-full">
                  {hop.ip}
                </span>
                <span className="text-[8px] text-[#908fa0]/70 truncate mt-0.5">
                  {hop.timestamp.replace("May 24, ", "")}
                </span>
              </div>

              {/* Arrow */}
              {!isLast && (
                <span className="material-symbols-outlined text-[#464554] text-xs relative z-10 -mt-6">
                  arrow_forward
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
