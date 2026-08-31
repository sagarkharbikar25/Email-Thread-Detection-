import React from 'react';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 'md', showLabel = true }) => {
  const getTheme = (s: number) => {
    if (s >= 80) return { color: '#ef4444', label: 'CRITICAL', bg: 'rgba(239, 68, 68, 0.15)', glow: 'cyber-glow-red' };
    if (s >= 60) return { color: '#f97316', label: 'HIGH RISK', bg: 'rgba(249, 115, 22, 0.15)', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' };
    if (s >= 40) return { color: '#eab308', label: 'SUSPICIOUS', bg: 'rgba(234, 179, 8, 0.15)', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]' };
    if (s >= 20) return { color: '#38bdf8', label: 'LOW RISK', bg: 'rgba(56, 189, 248, 0.15)', glow: 'cyber-glow-cyan' };
    return { color: '#10b981', label: 'LEGITIMATE', bg: 'rgba(16, 185, 129, 0.15)', glow: 'cyber-glow-green' };
  };

  const theme = getTheme(score);
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const radius = size === 'lg' ? 58 : size === 'md' ? 44 : 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative flex items-center justify-center rounded-full ${theme.glow}`} style={{ background: theme.bg }}>
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="rgba(30, 41, 59, 0.8)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={theme.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-bold font-mono tracking-tight ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-base'}`} style={{ color: theme.color }}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">/100</span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <span className="text-xs font-bold tracking-wider px-2 py-0.5 rounded uppercase" style={{ color: theme.color, backgroundColor: theme.bg }}>
            {theme.label}
          </span>
        </div>
      )}
    </div>
  );
};
