import React from 'react';
import { ThreatLevel } from '../types';

interface ThreatBadgeProps {
  level: ThreatLevel | string;
  className?: string;
}

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({ level, className = '' }) => {
  const norm = (level || 'INFO').toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'HIGH':
      case 'HIGH_RISK':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
      case 'SUSPICIOUS':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40';
      case 'LOW':
      case 'LOW_RISK':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/40';
      case 'LEGITIMATE':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStyle()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {norm.replace('_', ' ')}
    </span>
  );
};
