"use client";

import React from "react";
import { RelayHop } from "../../types/forensics";
import MapWrapper from "../common/MapWrapper";

interface GeolocationMapCardProps {
  hops: RelayHop[];
  onInfoClick?: () => void;
}

export function GeolocationMapCard({
  hops,
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

      <div className="flex-1 relative w-full h-full min-h-[160px] overflow-hidden">
        {/* Real Interactive Leaflet Map */}
        <MapWrapper hops={hops || []} />
      </div>
    </div>
  );
}
