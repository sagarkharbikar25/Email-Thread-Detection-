"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the Leaflet map so it only loads on the client side (prevents SSR window errors)
const LeafletMap = dynamic(
  () => import('./LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#09111F]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-2"></div>
        <span className="text-xs text-indigo-300 font-mono tracking-widest">LOADING MAP...</span>
      </div>
    )
  }
);

interface MapWrapperProps {
  hops: any[];
}

export default function MapWrapper({ hops }: MapWrapperProps) {
  return <LeafletMap hops={hops} />;
}
