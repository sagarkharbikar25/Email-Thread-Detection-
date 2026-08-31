"use client";

import React from "react";
import { RelayHop } from "../../types/forensics";

interface GeolocationMapCardProps {
  hops: RelayHop[];
  onInfoClick?: () => void;
}

export function GeolocationMapCard({
  onInfoClick,
}: GeolocationMapCardProps) {
  return (
    <div className="col-span-12 lg:col-span-5 card-base p-0 overflow-hidden relative border-[#1D293B] flex flex-col min-h-[170px]">
      {/* Title Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 text-xs text-[#908fa0] font-semibold tracking-wider bg-[#0D1726]/85 px-2.5 py-1 rounded backdrop-blur-md border border-[#1D293B]">
        <span>GEOLOCATION MAP</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Geographical path hops mapped by IP telemetry"
        >
          <span className="material-symbols-outlined text-[13px]">info</span>
        </button>
      </div>

      <div className="flex-1 bg-[#09111F] relative w-full h-full min-h-[160px] overflow-hidden flex items-center justify-center">
        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#6366F1 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* SVG World Map / Continent Outlines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Approximate World Landmass Silhouette */}
          <path
            d="M150,120 Q180,90 240,110 T300,160 T350,180 T260,260 T180,240 Z"
            fill="#142032"
            stroke="#1D293B"
            strokeWidth="1"
          />
          <path
            d="M380,80 Q450,70 540,90 T640,120 T720,160 T680,250 T580,270 T480,240 T420,160 Z"
            fill="#142032"
            stroke="#1D293B"
            strokeWidth="1"
          />
          <path
            d="M450,190 Q500,210 520,270 T480,350 T440,320 T420,240 Z"
            fill="#142032"
            stroke="#1D293B"
            strokeWidth="1"
          />
          <path
            d="M660,260 Q720,250 750,300 T680,360 T640,310 Z"
            fill="#142032"
            stroke="#1D293B"
            strokeWidth="1"
          />
        </svg>

        {/* Dynamic Flight / Hop SVG Arcs */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 400"
          preserveAspectRatio="none"
          style={{ pointerEvents: "none" }}
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#8083ff" />
            </linearGradient>
          </defs>

          {/* Trace Arc 1: Singapore (600, 240) to Mumbai (520, 190) */}
          <path
            d="M 600 240 Q 560 200 520 190"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-pulse-glow"
          />

          {/* Trace Arc 2: Mumbai (520, 190) to Pune (535, 205) */}
          <path
            d="M 520 190 Q 528 198 535 205"
            fill="none"
            stroke="#8083ff"
            strokeWidth="2"
            strokeDasharray="2 2"
          />
        </svg>

        {/* Map Point 1: Singapore */}
        <div className="absolute top-[60%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
          <div className="relative flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-red-500/30 animate-ping absolute" />
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] border border-white/40" />
          </div>
          <span className="text-[10px] font-semibold text-red-300 mt-1 bg-[#070C16]/80 px-1 rounded backdrop-blur-xs">
            Singapore (203.0.113.5)
          </span>
        </div>

        {/* Map Point 2: Mumbai */}
        <div className="absolute top-[48%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500/30 animate-ping absolute" />
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b] border border-white/40" />
          </div>
          <span className="text-[10px] font-semibold text-amber-300 mt-1 bg-[#070C16]/80 px-1 rounded backdrop-blur-xs">
            Mumbai (103.21.244.18)
          </span>
        </div>

        {/* Map Point 3: Pune */}
        <div className="absolute top-[52%] left-[68%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
          <div className="w-2.5 h-2.5 bg-[#8083ff] rounded-full shadow-[0_0_10px_#8083ff] border border-white/40" />
          <span className="text-[9px] font-semibold text-indigo-300 mt-1 bg-[#070C16]/80 px-1 rounded backdrop-blur-xs">
            Pune
          </span>
        </div>
      </div>
    </div>
  );
}
