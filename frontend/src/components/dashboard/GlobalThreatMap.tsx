import React, { useState } from 'react';
import { Globe, ShieldAlert, Cpu, MapPin, Radio, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapWrapper = dynamic(() => import('../common/MapWrapper'), { ssr: false });

interface ThreatBeacon {
  id: string;
  country: string;
  city: string;
  ip: string;
  type: string;
  status: 'CRITICAL' | 'HIGH' | 'LEGITIMATE';
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  lat: number;
  lng: number;
  details: string;
}

const BEACONS: ThreatBeacon[] = [
  { id: 'b1', country: 'Germany', city: 'Frankfurt', ip: '185.220.101.5', type: 'Tor Exit Relay Node', status: 'CRITICAL', x: 51, y: 32, lat: 50.1109, lng: 8.6821, details: 'PayPal Phishing Origin (Zwiebelfreunde e.V.)' },
  { id: 'b2', country: 'Russia', city: 'Moscow', ip: '194.26.29.112', type: 'Bulletproof Fast-Flux Host', status: 'CRITICAL', x: 62, y: 26, lat: 55.7558, lng: 37.6173, details: 'CEO BEC Wire Fraud Campaign (Hostkey B.V.)' },
  { id: 'b3', country: 'United States', city: 'Mountain View', ip: '142.250.190.46', type: 'Authenticated Google/GitHub MTA', status: 'LEGITIMATE', x: 22, y: 36, lat: 37.3861, lng: -122.0839, details: 'Valid SPF/DKIM Signed Transmission' },
  { id: 'b4', country: 'India', city: 'New Delhi', ip: '164.100.14.22', type: 'Target Ingest Gateway', status: 'HIGH', x: 70, y: 44, lat: 28.6139, lng: 77.2090, details: 'Corporate Victim Inbound MX (NIC Gateway)' },
  { id: 'b5', country: 'United Kingdom', city: 'London', ip: '51.140.22.8', type: 'Secondary Hop Relay', status: 'HIGH', x: 48, y: 30, lat: 51.5074, lng: -0.1278, details: 'Mimecast Secure Email Ingest Node' }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: MITRE ATT&CK Tactics Funnel */}
        <div className="space-y-4 font-mono">
          <div className="p-3 xl:p-4 bg-slate-900/90 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-3 text-center">Darktrace Threat Funnel</span>
            
            {/* Funnel Bars */}
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-full bg-cyan-950/40 border border-cyan-500/20 p-2 rounded-lg text-cyan-300 text-center transition-all hover:bg-cyan-900/40">
                <div className="text-[8px] xl:text-[9px] uppercase tracking-widest opacity-80 mb-0.5 truncate">Inbound Events</div>
                <div className="font-black text-sm xl:text-base">111,694</div>
              </div>
              <div className="w-[95%] bg-indigo-950/40 border border-indigo-500/20 p-2 rounded-lg text-indigo-300 text-center transition-all hover:bg-indigo-900/40">
                <div className="text-[8px] xl:text-[9px] uppercase tracking-widest opacity-80 mb-0.5 truncate">SPF/DKIM Breaches</div>
                <div className="font-black text-sm xl:text-base">7,583</div>
              </div>
              <div className="w-[90%] bg-amber-950/40 border border-amber-500/20 p-2 rounded-lg text-amber-300 text-center transition-all hover:bg-amber-900/40">
                <div className="text-[8px] xl:text-[9px] uppercase tracking-widest opacity-80 mb-0.5 truncate">Investigated</div>
                <div className="font-black text-sm xl:text-base">14</div>
              </div>
              <div className="w-[85%] bg-red-950/50 border border-red-500/40 p-2 rounded-lg text-red-400 text-center shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all hover:bg-red-900/50">
                <div className="text-[8px] xl:text-[9px] uppercase tracking-widest opacity-80 mb-0.5 truncate">Confirmed Spoofs</div>
                <div className="font-black text-sm xl:text-base">3 High</div>
              </div>
            </div>
          </div>

          {/* Mitre Tactic Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 flex flex-col gap-1.5 justify-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">Initial Access</span>
              <span className="text-red-400 font-bold text-[9px] bg-red-400/10 px-1.5 py-0.5 rounded self-start truncate max-w-full">T1566 Phishing</span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 flex flex-col gap-1.5 justify-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">Defense Evasion</span>
              <span className="text-amber-400 font-bold text-[9px] bg-amber-400/10 px-1.5 py-0.5 rounded self-start truncate max-w-full">T1036 Masquerade</span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 flex flex-col gap-1.5 justify-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">Cmd & Control</span>
              <span className="text-orange-400 font-bold text-[9px] bg-orange-400/10 px-1.5 py-0.5 rounded self-start truncate max-w-full">T1090 Tor Proxy</span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 flex flex-col gap-1.5 justify-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">Impact / BEC</span>
              <span className="text-purple-400 font-bold text-[9px] bg-purple-400/10 px-1.5 py-0.5 rounded self-start truncate max-w-full">T1565 Data Fraud</span>
            </div>
          </div>
        </div>

        {/* Center/Right: SVG Dark Geolocation Map */}
        <div className="lg:col-span-2 relative glass-panel rounded-2xl overflow-hidden min-h-[360px] bg-[#070b16] border border-slate-800 p-4 flex flex-col justify-between">
          {/* Real Interactive Leaflet Map */}
          <div className="relative w-full h-[300px] rounded-xl overflow-hidden border border-[#1e293b]">
            <MapWrapper hops={BEACONS.map(b => ({
              ip_address: b.ip,
              hop_type: b.status === 'CRITICAL' ? 'origin' : b.status === 'LEGITIMATE' ? 'final' : 'intermediate',
              by_host: b.type,
              geo_data: {
                city: b.city,
                country: b.country,
                latitude: b.lat,
                longitude: b.lng
              }
            }))} />
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
