import React from 'react';
import { TransmissionHop } from '../types';
import { Server, ArrowDown, MapPin, Globe, ShieldAlert, Cpu } from 'lucide-react';

interface RelayTimelineProps {
  hops: TransmissionHop[];
}

export const RelayTimeline: React.FC<RelayTimelineProps> = ({ hops }) => {
  if (!hops || hops.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl text-center text-slate-400">
        No transmission hops detected in Received headers.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          MTA Relay Chain ({hops.length} Transmission Hops)
        </h3>
        <span className="text-xs text-slate-500 font-mono">Earliest Origin &rarr; Destination MX</span>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
        {hops.map((hop, idx) => {
          const isOrigin = hop.hop_order === 1 || hop.hop_type === 'ORIGIN';
          const isDest = idx === hops.length - 1 || hop.hop_type === 'DESTINATION';
          const geo = hop.geo_data;

          return (
            <div key={idx} className="relative group">
              {/* Timeline marker node */}
              <div className={`absolute -left-[33px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono ${
                isOrigin
                  ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : isDest
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-cyan-500 text-cyan-300'
              }`}>
                {hop.hop_order}
              </div>

              {/* Hop Card */}
              <div className={`glass-panel p-4 rounded-xl border transition ${
                isOrigin ? 'border-red-500/30 bg-red-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase font-mono ${
                      isOrigin
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isDest
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {hop.hop_type}
                    </span>
                    <span className="text-sm font-semibold text-slate-200 font-mono">
                      {hop.by_host || hop.from_host || `Relay Server #${hop.hop_order}`}
                    </span>
                  </div>

                  {hop.timestamp && (
                    <span className="text-xs text-slate-400 font-mono">
                      {hop.timestamp}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Received By / With:</span>
                    <span className="text-slate-300 font-mono">{hop.by_host || 'Unknown MTA'} ({hop.with_protocol || 'SMTP'})</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Sender IP Address:</span>
                    <span className="text-cyan-400 font-mono font-semibold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {hop.ip_address || 'Unspecified Private Header'}
                    </span>
                  </div>
                </div>

                {/* GeoIP Intelligence Badges */}
                {geo && geo.country_name && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {geo.city ? `${geo.city}, ` : ''}{geo.country_name} ({geo.country_code})
                    </span>

                    {geo.isp && (
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
                        <Cpu className="w-3 h-3 text-purple-400" />
                        {geo.isp} {geo.asn ? `[${geo.asn}]` : ''}
                      </span>
                    )}

                    {geo.is_tor && (
                      <span className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                        <ShieldAlert className="w-3 h-3" /> Tor Exit Node
                      </span>
                    )}

                    {geo.is_vpn && (
                      <span className="flex items-center gap-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded font-bold uppercase">
                        Commercial VPN
                      </span>
                    )}

                    {geo.abuse_score !== undefined && geo.abuse_score > 0 && (
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        geo.abuse_score > 50 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        Abuse Score: {geo.abuse_score}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
