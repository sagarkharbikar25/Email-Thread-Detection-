"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG/HTML glowing circular markers with Material Icons
const createMaterialIcon = (color: string, iconName: string, size: number = 32, iconSize: number = 18) => `
  <div style="
    width: ${size}px;
    height: ${size}px;
    background: rgba(11, 17, 32, 0.9);
    border: 2px solid ${color};
    border-radius: 50%;
    box-shadow: 0 0 15px ${color}80, inset 0 0 8px ${color}40;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${color};
    backdrop-filter: blur(4px);
    transition: transform 0.3s;
  ">
    <span class="material-symbols-outlined" style="font-size: ${iconSize}px;">${iconName}</span>
  </div>
`;

const originIcon = new L.DivIcon({
  html: createMaterialIcon('#ef4444', 'emergency', 32, 18), // Red
  className: 'custom-leaflet-icon-darktrace',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const destIcon = new L.DivIcon({
  html: createMaterialIcon('#10b981', 'dns', 32, 18), // Green
  className: 'custom-leaflet-icon-darktrace',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const intermediateIcon = new L.DivIcon({
  html: createMaterialIcon('#f59e0b', 'router', 28, 16), // Amber/Yellow
  className: 'custom-leaflet-icon-darktrace',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

interface LeafletMapProps {
  hops: any[];
}

export default function LeafletMap({ hops }: LeafletMapProps) {
  // Extract valid coordinates from hops
  const validHops = hops.filter(h => h.geo_data && h.geo_data.latitude && h.geo_data.longitude);
  
  const positions: [number, number][] = validHops.map(h => [h.geo_data.latitude, h.geo_data.longitude]);
  
  // Default to global view if no hops, otherwise focus on the center of the path
  const center: [number, number] = positions.length > 0 ? positions[Math.floor(positions.length / 2)] : [20, 0];
  const zoom = positions.length > 0 ? 3 : 2;

  // Additional Global Styles for Custom Tooltip & Animation
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-popup-content-wrapper {
        background: #0b1120 !important;
        border: 1px solid #1e293b !important;
        border-radius: 12px !important;
        color: white !important;
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.8) !important;
        padding: 0 !important;
      }
      .leaflet-popup-tip {
        background: #0b1120 !important;
        border: 1px solid #1e293b !important;
      }
      .leaflet-popup-content {
        margin: 0 !important;
      }
      .darktrace-tooltip {
        padding: 12px 16px;
        min-width: 220px;
      }
      .map-tiles-dark-filter {
        filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) grayscale(80%);
      }
      @keyframes pulse-glow {
        0% { filter: drop-shadow(0 0 5px currentColor); transform: rotate(45deg) scale(0.95); }
        100% { filter: drop-shadow(0 0 20px currentColor); transform: rotate(45deg) scale(1.1); }
      }
      @keyframes flow-animation {
        to {
          stroke-dashoffset: -20;
        }
      }
      .animated-flow-line {
        animation: flow-animation 0.5s linear infinite;
        filter: drop-shadow(0 0 6px #06b6d4);
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      style={{ height: '100%', width: '100%', zIndex: 10, background: '#0f172a' }} // Darker ocean
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles-dark-filter"
      />
      
      {/* Draw lines between hops */}
      {positions.length > 1 && (
        <Polyline 
          positions={positions} 
          color="#06b6d4" // Bright Cyan
          weight={2} 
          opacity={0.8} 
          dashArray="10, 10" 
          className="animated-flow-line"
        />
      )}

      {/* Plot markers */}
      {validHops.map((hop, idx) => {
        let icon = intermediateIcon;
        let badgeColor = "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
        let badgeText = "RELAY NODE";

        if (hop.hop_type === 'origin') { 
          icon = originIcon; 
          badgeColor = "text-red-400 border-red-400/30 bg-red-400/10";
          badgeText = "CRITICAL ORIGIN";
        }
        if (hop.hop_type === 'final') { 
          icon = destIcon; 
          badgeColor = "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
          badgeText = "DESTINATION";
        }

        const locationString = (hop.geo_data.city && hop.geo_data.country) 
          ? `${hop.geo_data.city}, ${hop.geo_data.country}` 
          : (hop.geo_data.country || 'Unknown Location');

        return (
          <Marker 
            key={idx} 
            position={[hop.geo_data.latitude, hop.geo_data.longitude]} 
            icon={icon}
          >
            <Popup className="custom-popup">
              <div className="darktrace-tooltip font-sans">
                <div className="flex items-start gap-3 mb-3">
                  <div className="mt-1 w-6 h-6 rounded bg-[#1e293b] flex items-center justify-center border border-[#334155] shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-slate-300">my_location</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base tracking-wide leading-tight mb-1">{locationString}</h3>
                    <p className="font-mono text-xs text-indigo-300">
                      IP: {hop.ip_address} 
                      {hop.by_host ? <span className="text-slate-500"> • {hop.by_host}</span> : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                    {badgeText}
                  </span>
                  <span className="text-xs text-slate-400">SMTP Trace (Hop {idx + 1})</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
