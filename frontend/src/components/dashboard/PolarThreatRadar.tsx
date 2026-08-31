import React, { useState } from 'react';
import { Radar, Eye, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LEGITIMATE';

interface IncidentPing {
  id: string;
  angle: number; // in degrees (0 - 360)
  radius: number; // 0 to 1 (normalized distance from center)
  severity: ThreatLevel;
  type: string;
  subject: string;
  timestamp: string;
  entitiesCount: number;
}

const SAMPLE_PINGS: IncidentPing[] = [
  { id: 'p1', angle: 45, radius: 0.85, severity: 'CRITICAL', type: 'Phishing Credential Harvester', subject: 'PayPal Account Suspended', timestamp: '2026-08-31 08:30:12', entitiesCount: 4 },
  { id: 'p2', angle: 120, radius: 0.72, severity: 'CRITICAL', type: 'Executive BEC Wire Fraud', subject: 'Urgent Vendor Settlement ($84.5k)', timestamp: '2026-08-31 07:15:10', entitiesCount: 3 },
  { id: 'p3', angle: 210, radius: 0.35, severity: 'LEGITIMATE', type: 'Authenticated Notice', subject: 'GitHub SSH Key Revocation Alert', timestamp: '2026-08-31 06:00:15', entitiesCount: 1 },
  { id: 'p4', angle: 160, radius: 0.65, severity: 'HIGH', type: 'Display Name Spoofing', subject: 'Microsoft 365 Password Expiry', timestamp: '2026-08-31 04:20:00', entitiesCount: 2 },
  { id: 'p5', angle: 290, radius: 0.50, severity: 'MEDIUM', type: 'Suspicious Relay Hop', subject: 'Invoice Receipt INV-9901', timestamp: '2026-08-30 22:11:45', entitiesCount: 2 },
  { id: 'p6', angle: 330, radius: 0.80, severity: 'CRITICAL', type: 'Malware Dropper Attachment', subject: 'Scanned Contract Document.iso', timestamp: '2026-08-30 18:45:30', entitiesCount: 5 },
  { id: 'p7', angle: 80, radius: 0.40, severity: 'LOW', type: 'Internal Forward', subject: 'Weekly Team Sync Notes', timestamp: '2026-08-30 16:30:00', entitiesCount: 1 },
  { id: 'p8', angle: 240, radius: 0.78, severity: 'HIGH', type: 'Tor Anonymized Origin', subject: 'Corporate Banking Alert', timestamp: '2026-08-30 12:15:20', entitiesCount: 3 },
];

interface PolarThreatRadarProps {
  onSelectIncident?: (subject: string) => void;
}

export const PolarThreatRadar: React.FC<PolarThreatRadarProps> = ({ onSelectIncident }) => {
  const [timeRange, setTimeRange] = useState<'1 Day' | '1 Week' | '1 Month'>('1 Month');
  const [hoveredPing, setHoveredPing] = useState<IncidentPing | null>(null);

  const centerX = 200;
  const centerY = 200;
  const maxRadius = 160;

  const getSeverityColor = (sev: ThreatLevel) => {
    switch (sev) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#38bdf8';
      case 'LEGITIMATE': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
              Investigations Over Time (Threat Polar Radar)
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Low / Legit</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span> Critical</span>
          </div>
        </div>

        {/* Time Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono text-slate-400">
          {(['1 Day', '1 Week', '1 Month'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                timeRange === t ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Polar Coordinate Canvas */}
      <div className="relative flex items-center justify-center my-2 select-none">
        <svg width="400" height="400" className="overflow-visible">
          {/* Concentric Radar Rings */}
          {[0.25, 0.5, 0.75, 1].map((ratio, idx) => (
            <circle
              key={idx}
              cx={centerX}
              cy={centerY}
              r={maxRadius * ratio}
              fill="none"
              stroke="rgba(56, 189, 248, 0.15)"
              strokeWidth="1"
              strokeDasharray={idx === 3 ? 'none' : '3 3'}
            />
          ))}

          {/* Radial Crosshair Axes */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x2 = (centerX + maxRadius * Math.cos(rad)).toFixed(2);
            const y2 = (centerY + maxRadius * Math.sin(rad)).toFixed(2);
            const textX = (centerX + (maxRadius + 14) * Math.cos(rad)).toFixed(2);
            const textY = (centerY + (maxRadius + 14) * Math.sin(rad) + 4).toFixed(2);
            return (
              <g key={deg}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(56, 189, 248, 0.1)"
                  strokeWidth="1"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {deg}°
                </text>
              </g>
            );
          })}

          {/* Animated Sweeping Radar Scanner Cone */}
          <g className="origin-center" style={{ transformOrigin: `${centerX}px ${centerY}px` }}>
            <path
              d={`M ${centerX} ${centerY} L ${centerX + maxRadius} ${centerY} A ${maxRadius} ${maxRadius} 0 0 1 ${(centerX + maxRadius * Math.cos(Math.PI / 6)).toFixed(2)} ${(centerY + maxRadius * Math.sin(Math.PI / 6)).toFixed(2)} Z`}
              fill="url(#radar-sweep-gradient)"
              className="animate-spin"
              style={{ animationDuration: '6s', transformOrigin: `${centerX}px ${centerY}px` }}
            />
          </g>

          <defs>
            <linearGradient id="radar-sweep-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0.0)" />
            </linearGradient>
          </defs>

          {/* Center Point */}
          <circle cx={centerX} cy={centerY} r="4" fill="#38bdf8" className="shadow-[0_0_10px_#38bdf8]" />

          {/* Incident Threat Pings */}
          {SAMPLE_PINGS.map((ping) => {
            const rad = (ping.angle * Math.PI) / 180;
            const r = ping.radius * maxRadius;
            const px = (centerX + r * Math.cos(rad)).toFixed(2);
            const py = (centerY + r * Math.sin(rad)).toFixed(2);
            const color = getSeverityColor(ping.severity);
            const isHovered = hoveredPing?.id === ping.id;

            return (
              <g
                key={ping.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPing(ping)}
                onClick={() => onSelectIncident && onSelectIncident(ping.subject)}
              >
                {/* Ping Glow Ripple */}
                {ping.severity === 'CRITICAL' && (
                  <circle
                    cx={px}
                    cy={py}
                    r={isHovered ? '14' : '10'}
                    fill={color}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={px}
                  cy={py}
                  r={isHovered ? '9' : '6'}
                  fill={color}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-200"
                  style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
              </g>
            );
          })}
        </svg>

        {/* Hovered Ping Tooltip Card (Matching Reference Design 1) */}
        {hoveredPing && (
          <div
            className="absolute z-30 glass-panel-elevated p-3.5 rounded-xl border border-slate-700 shadow-2xl max-w-xs text-xs pointer-events-auto"
            style={{
              top: '20px',
              right: '20px',
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-white font-mono truncate">{hoveredPing.type}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono"
                style={{ backgroundColor: `${getSeverityColor(hoveredPing.severity)}25`, color: getSeverityColor(hoveredPing.severity) }}
              >
                {hoveredPing.severity}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-semibold mb-2">{hoveredPing.subject}</p>
            <div className="space-y-1 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>First Detected:</span>
                <span className="text-slate-200">{hoveredPing.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>Related Entities:</span>
                <span className="text-cyan-400 font-bold">{hoveredPing.entitiesCount} nodes</span>
              </div>
              <div className="flex justify-between">
                <span>Current Status:</span>
                <span className="text-amber-400 font-bold">Open Incident</span>
              </div>
            </div>

            <button
              onClick={() => onSelectIncident && onSelectIncident(hoveredPing.subject)}
              className="mt-3 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold font-mono text-[10px] uppercase flex items-center justify-center gap-1"
            >
              Investigate Incident <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Timeline Histogram Bar */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1.5">
          <span>100,000 Interactions Processed</span>
          <span className="text-cyan-400">+4.9k in last 24h</span>
        </div>
        <div className="flex items-end gap-1 h-6 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[40, 60, 45, 80, 65, 90, 75, 100, 85, 95, 70, 85, 90, 60, 80, 50, 75, 90, 100, 85, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t transition"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
          <span>12:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
        </div>
      </div>
    </div>
  );
};
