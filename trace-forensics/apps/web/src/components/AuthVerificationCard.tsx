import React from 'react';
import { AuthResults } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX, Key, Globe, FileCheck } from 'lucide-react';

interface AuthVerificationCardProps {
  auth?: AuthResults;
}

export const AuthVerificationCard: React.FC<AuthVerificationCardProps> = ({ auth }) => {
  if (!auth) {
    return (
      <div className="glass-panel p-6 rounded-xl text-center text-slate-400">
        No cryptographic authentication results found in email headers.
      </div>
    );
  }

  const getStatusBadge = (res: string) => {
    const upper = res.toUpperCase();
    if (upper === 'PASS') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-bold font-mono">
          <ShieldCheck className="w-4 h-4" /> PASS
        </span>
      );
    }
    if (upper === 'FAIL') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/40 text-red-400 rounded-lg text-xs font-bold font-mono shadow-[0_0_10px_rgba(239,68,68,0.25)]">
          <ShieldX className="w-4 h-4" /> FAIL
        </span>
      );
    }
    if (upper === 'SOFTFAIL' || upper === 'NEUTRAL') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/15 border border-orange-500/40 text-orange-400 rounded-lg text-xs font-bold font-mono">
          <ShieldAlert className="w-4 h-4" /> {upper}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-700/40 border border-slate-600 text-slate-400 rounded-lg text-xs font-bold font-mono">
        NONE
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* SPF Card */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-slate-200">SPF Verification</h4>
          </div>
          {getStatusBadge(auth.spf_result)}
        </div>
        <p className="text-xs text-slate-400 mb-3">Sender Policy Framework IP authorization</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Domain:</span>
            <span className="font-mono text-slate-300">{auth.spf_domain || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Alignment:</span>
            <span className="font-mono text-slate-300">{auth.spf_alignment || 'UNALIGNED'}</span>
          </div>
        </div>
      </div>

      {/* DKIM Card */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-slate-200">DKIM Signature</h4>
          </div>
          {getStatusBadge(auth.dkim_result)}
        </div>
        <p className="text-xs text-slate-400 mb-3">DomainKeys Identified Mail cryptographic signature</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Signing Domain:</span>
            <span className="font-mono text-slate-300">{auth.dkim_domain || 'None'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Selector (s=):</span>
            <span className="font-mono text-slate-300">{auth.dkim_selector || 'None'}</span>
          </div>
        </div>
      </div>

      {/* DMARC Card */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-slate-200">DMARC Policy</h4>
          </div>
          {getStatusBadge(auth.dmarc_result)}
        </div>
        <p className="text-xs text-slate-400 mb-3">Domain-based Message Authentication Reporting</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Policy (p=):</span>
            <span className="font-mono text-slate-300">{auth.dmarc_policy || 'none'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Compliance:</span>
            <span className={`font-mono ${auth.dmarc_result === 'PASS' ? 'text-emerald-400' : 'text-red-400'}`}>
              {auth.dmarc_result === 'PASS' ? 'COMPLIANT' : 'VIOLATION / REJECT'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
