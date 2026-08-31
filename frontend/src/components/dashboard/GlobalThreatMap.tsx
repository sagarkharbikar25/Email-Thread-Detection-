import React, { useState } from 'react';
import { Globe, ShieldAlert, Cpu, MapPin, Radio, Activity } from 'lucide-react';

interface ThreatBeacon {
  id: string;
  country: string;
  city: string;
  ip: string;
  type: string;
  status: 'CRITICAL' | 'HIGH' | 'LEGITIMATE';
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  details: string;
}

const BEACONS: ThreatBeacon[] = [
  { id: 'b1', country: 'Germany', city: 'Frankfurt', ip: '185.220.101.5', type: 'Tor Exit Relay Node', status: 'CRITICAL', x: 51, y: 32, details: 'PayPal Phishing Origin (Zwiebelfreunde e.V.)' },
  { id: 'b2', country: 'Russia', city: 'Moscow', ip: '194.26.29.112', type: 'Bulletproof Fast-Flux Host', status: 'CRITICAL', x: 62, y: 26, details: 'CEO BEC Wire Fraud Campaign (Hostkey B.V.)' },
  { id: 'b3', country: 'United States', city: 'Mountain View', ip: '142.250.190.46', type: 'Authenticated Google/GitHub MTA', status: 'LEGITIMATE', x: 22, y: 36, details: 'Valid SPF/DKIM Signed Transmission' },
  { id: 'b4', country: 'India', city: 'New Delhi', ip: '164.100.14.22', type: 'Target Ingest Gateway', status: 'HIGH', x: 70, y: 44, details: 'Corporate Victim Inbound MX (NIC Gateway)' },
  { id: 'b5', country: 'United Kingdom', city: 'London', ip: '51.140.22.8', type: 'Secondary Hop Relay', status: 'HIGH', x: 48, y: 30, details: 'Mimecast Secure Email Ingest Node' }
];

export const GlobalThreatMap: React.FC = () => {
  const [selectedBeacon, setSelectedBeacon] = useState<ThreatBeacon | null>(BEACONS[0]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
              Global Threat Origin Geolocation & MITRE ATT&CK Matrix
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Real-time Origin IP Mapping & Autonomous Transmission Route Tracking
            </p>
          </div>
        </div>

        {/* Global Incident Stats */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Active Threat Beacons</span>
            <span className="text-lg font-black text-red-400">{BEACONS.filter(b => b.status === 'CRITICAL').length} Critical Nodes</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[10px] uppercase">Monitored ASNs</span>
            <span className="text-lg font-black text-cyan-400">14 Autonomous Systems</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: MITRE ATT&CK Tactics Funnel (from Reference Design 6) */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Darktrace Threat Funnel</span>
            
            {/* Funnel Bars */}
            <div className="space-y-1.5 pt-1">
              <div className="bg-cyan-950/60 border border-cyan-500/30 p-2 rounded-lg flex justify-between items-center text-cyan-300">
                <span>Inbound Events</span>
                <span className="font-bold">111,694</span>
              </div>
              <div className="bg-indigo-950/60 border border-indigo-500/30 p-2 rounded-lg flex justify-between items-center text-indigo-300 ml-2">
                <span>SPF/DKIM Breaches</span>
                <span className="font-bold">7,583</span>
              </div>
              <div className="bg-amber-950/60 border border-amber-500/30 p-2 rounded-lg flex justify-between items-center text-amber-300 ml-4">
                <span>Investigated Incidents</span>
                <span className="font-bold">14</span>
              </div>
              <div className="bg-red-950/80 border border-red-500/50 p-2 rounded-lg flex justify-between items-center text-red-400 ml-6 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                <span>Confirmed Spoofs</span>
                <span className="font-bold">3 High Severity</span>
              </div>
            </div>
          </div>

          {/* Mitre Tactic Cards */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 block">Initial Access</span>
              <span className="text-red-400 font-bold">T1566 Phishing</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 block">Defense Evasion</span>
              <span className="text-amber-400 font-bold">T1036 Masquerade</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 block">Command & Control</span>
              <span className="text-orange-400 font-bold">T1090 Tor Proxy</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 block">Impact / BEC</span>
              <span className="text-purple-400 font-bold">T1565 Data Fraud</span>
            </div>
          </div>
        </div>

        {/* Center/Right: SVG Dark Geolocation Map */}
        <div className="lg:col-span-3 relative glass-panel rounded-2xl overflow-hidden min-h-[360px] bg-[#070b16] border border-slate-800 p-4 flex flex-col justify-between">
          {/* Subtle Grid Map Canvas */}
          <div className="relative w-full h-[300px] flex items-center justify-center">
            {/* World Map Outline SVG */}
            <svg viewBox="0 0 1000 500" className="w-full h-full opacity-40">
              {/* North America */}
              <path d="M150,80 Q250,60 300,120 Q280,220 180,240 Q120,180 150,80 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {/* South America */}
              <path d="M280,260 Q340,280 320,420 Q260,400 240,300 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {/* Europe */}
              <path d="M480,70 Q560,60 540,150 Q480,180 460,110 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {/* Africa */}
              <path d="M470,180 Q560,180 540,360 Q460,340 440,220 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {/* Asia */}
              <path d="M560,60 Q820,70 800,240 Q620,260 560,160 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {/* Australia */}
              <path d="M760,320 Q840,330 820,410 Q740,400 750,330 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            </svg>

            {/* Pulsing Threat Beacons */}
            {BEACONS.map((b) => {
              const isSelected = selectedBeacon?.id === b.id;
              const isCrit = b.status === 'CRITICAL';
              const isLegit = b.status === 'LEGITIMATE';
              const color = isCrit ? '#ef4444' : isLegit ? '#10b981' : '#f59e0b';

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBeacon(b)}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                >
                  {/* Outer Ripple */}
                  {isCrit && (
                    <span
                      className="absolute inset-0 -m-3 rounded-full animate-ping opacity-75"
                      style={{ backgroundColor: color }}
                    />
                  )}

                  {/* Hexagonal Beacon Core */}
                  <div
                    className={`w-6 h-6 rounded-lg rotate-45 flex items-center justify-center shadow-lg transition-transform ${
                      isSelected ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 15px ${color}80`
                    }}
                  >
                    <div className="w-2.5 h-2.5 bg-[#070b16] rounded-sm -rotate-45" />
                  </div>

                  {/* Floating Tag */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-7 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-white pointer-events-none z-30 shadow-xl">
                    {b.city}, {b.country} ({b.ip})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Beacon Inspector Footer */}
          {selectedBeacon && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedBeacon.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">{selectedBeacon.city}, {selectedBeacon.country}</span>
                  <span className="text-slate-400 block text-[11px]">IP: <span className="text-cyan-400">{selectedBeacon.ip}</span> • {selectedBeacon.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                  selectedBeacon.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {selectedBeacon.status}
                </span>
                <span className="text-slate-300 text-[11px] max-w-xs truncate">{selectedBeacon.details}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
