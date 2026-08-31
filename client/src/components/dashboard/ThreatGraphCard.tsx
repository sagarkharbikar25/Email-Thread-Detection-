"use client";

import React from "react";

interface ThreatGraphCardProps {
  onViewFullGraph?: () => void;
  onInfoClick?: () => void;
}

export function ThreatGraphCard({
  onViewFullGraph,
  onInfoClick,
}: ThreatGraphCardProps) {
  return (
    <div className="col-span-12 lg:col-span-5 card-base flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-2 relative z-10">
        <span>THREAT GRAPH</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Relational topology between attacker infrastructure nodes"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      {/* Graph Visual Canvas */}
      <div className="flex-1 flex items-center justify-center relative min-h-[220px] py-2">
        {/* Connecting Lines SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none", zIndex: 0 }}
        >
          {/* From Root (Email) to Level 1 */}
          <line
            x1="50%"
            y1="18%"
            x2="22%"
            y2="48%"
            stroke="#464554"
            strokeWidth="1.5"
          />
          <line
            x1="50%"
            y1="18%"
            x2="50%"
            y2="48%"
            stroke="#464554"
            strokeWidth="1.5"
          />
          <line
            x1="50%"
            y1="18%"
            x2="78%"
            y2="48%"
            stroke="#464554"
            strokeWidth="1.5"
          />

          {/* From Level 1 to Level 2 (Dashed Lines) */}
          <line
            x1="22%"
            y1="56%"
            x2="22%"
            y2="80%"
            stroke="#464554"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1="50%"
            y1="56%"
            x2="50%"
            y2="80%"
            stroke="#464554"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1="78%"
            y1="56%"
            x2="78%"
            y2="80%"
            stroke="#464554"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>

        {/* Level 0: Root Email Node */}
        <div className="absolute top-[6%] left-[50%] -translate-x-1/2 flex flex-col items-center z-10 group cursor-pointer">
          <div className="w-10 h-10 rounded-full border-2 border-red-500 bg-[#142032] flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">mail</span>
          </div>
          <span className="text-[10px] font-bold text-[#d7e3fb] mt-1">Email</span>
          <span className="text-[8px] font-mono text-[#908fa0]">(TRC-1024)</span>
        </div>

        {/* Level 1 Node: Domain */}
        <div className="absolute top-[42%] left-[22%] -translate-x-1/2 flex flex-col items-center z-10 group cursor-pointer">
          <div className="w-9 h-9 rounded-full border border-emerald-500 bg-[#142032] flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            <span className="material-symbols-outlined text-[16px]">language</span>
          </div>
          <span className="text-[10px] font-bold text-[#d7e3fb] mt-1">Domain</span>
          <span className="text-[8px] font-mono text-red-400 max-w-[100px] truncate">
            paypa1-security.com
          </span>
        </div>

        {/* Level 1 Node: IP */}
        <div className="absolute top-[42%] left-[50%] -translate-x-1/2 flex flex-col items-center z-10 group cursor-pointer">
          <div className="w-9 h-9 rounded-full border border-indigo-500 bg-[#142032] flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(99,102,241,0.2)]">
            <span className="material-symbols-outlined text-[16px]">dns</span>
          </div>
          <span className="text-[10px] font-bold text-[#d7e3fb] mt-1">IP Address</span>
          <span className="text-[8px] font-mono text-[#908fa0]">103.21.244.18</span>
        </div>

        {/* Level 1 Node: URL */}
        <div className="absolute top-[42%] left-[78%] -translate-x-1/2 flex flex-col items-center z-10 group cursor-pointer">
          <div className="w-9 h-9 rounded-full border border-amber-500 bg-[#142032] flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            <span className="material-symbols-outlined text-[16px]">link</span>
          </div>
          <span className="text-[10px] font-bold text-[#d7e3fb] mt-1">URL Target</span>
          <span className="text-[8px] font-mono text-amber-400 max-w-[90px] truncate">
            login-secure.com
          </span>
        </div>

        {/* Level 2 Node: WHOIS */}
        <div className="absolute top-[76%] left-[22%] -translate-x-1/2 flex flex-col items-center z-10">
          <div className="w-7 h-7 rounded-full border border-amber-500/80 bg-[#142032] flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[13px]">policy</span>
          </div>
          <span className="text-[9px] font-semibold text-[#d7e3fb] mt-0.5">WHOIS</span>
          <span className="text-[8px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded font-mono mt-0.5">
            12 days old
          </span>
        </div>

        {/* Level 2 Node: ASN */}
        <div className="absolute top-[76%] left-[50%] -translate-x-1/2 flex flex-col items-center z-10">
          <div className="w-7 h-7 rounded-full border border-[#464554] bg-[#142032] flex items-center justify-center text-[#908fa0]">
            <span className="material-symbols-outlined text-[13px]">corporate_fare</span>
          </div>
          <span className="text-[9px] font-semibold text-[#d7e3fb] mt-0.5">ASN</span>
          <span className="text-[8px] text-[#908fa0] font-mono">AS13335 (Cloudflare)</span>
        </div>

        {/* Level 2 Node: Location */}
        <div className="absolute top-[76%] left-[78%] -translate-x-1/2 flex flex-col items-center z-10">
          <div className="w-7 h-7 rounded-full border border-amber-500/80 bg-[#142032] flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[13px]">location_on</span>
          </div>
          <span className="text-[9px] font-semibold text-[#d7e3fb] mt-0.5">Location</span>
          <span className="text-[8px] text-[#908fa0]">Mumbai, IN</span>
        </div>
      </div>

      {/* Action Footer */}
      <button
        onClick={onViewFullGraph}
        className="mt-2 text-xs text-[#8083ff] hover:text-[#c0c1ff] font-medium flex items-center gap-1 hover:underline w-fit relative z-10 transition-colors"
      >
        <span>View Full Interactive Graph</span>
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  );
}
