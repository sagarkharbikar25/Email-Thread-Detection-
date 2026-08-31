import React, { useState } from 'react';
import { EvidenceItem } from '../types';
import { api } from '../services/api';
import { Lock, ShieldCheck, CheckCircle, RefreshCw, Key, FileCode } from 'lucide-react';

interface EvidencePageProps {
  evidenceList: EvidenceItem[];
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ evidenceList }) => {
  const [items, setItems] = useState<EvidenceItem[]>(evidenceList);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerify = async (evId: string) => {
    setVerifyingId(evId);
    try {
      await api.verifyEvidence(evId);
      setTimeout(() => {
        setItems(prev => prev.map(item => item.id === evId ? { ...item, integrity_status: 'VERIFIED' } : item));
        setVerifyingId(null);
      }, 700);
    } catch (_) {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Lock className="w-6 h-6 text-cyan-400" />
          Digital Evidence Locker & Chain of Custody
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Cryptographically signed evidence ledger preserving raw .eml artifacts with SHA-256 tamper-evident verification.
        </p>
      </div>

      {/* Evidence Items */}
      <div className="space-y-4">
        {items.map((ev) => (
          <div key={ev.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-0.5 rounded">
                    {ev.evidence_id}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {ev.integrity_status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">[{ev.evidence_type}]</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{ev.filename}</h3>
                <p className="text-xs font-mono text-cyan-400/90 break-all bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  SHA-256: {ev.sha256}
                </p>
              </div>

              <button
                onClick={() => handleVerify(ev.id)}
                disabled={verifyingId === ev.id}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold font-mono rounded-xl border border-slate-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === ev.id ? 'animate-spin' : ''}`} />
                {verifyingId === ev.id ? 'Verifying...' : 'Verify Cryptographic Hash'}
              </button>
            </div>

            {/* Chain of Custody Timeline */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                Chain of Custody Audit Ledger
              </span>

              <div className="space-y-2 text-xs font-mono">
                {ev.chain_events?.map((evLog, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-cyan-400 font-bold">{evLog.action}</span>
                      <span className="text-slate-400">• By {evLog.actor_name}</span>
                      {evLog.note && <span className="text-slate-500 hidden sm:inline">({evLog.note})</span>}
                    </div>
                    <span className="text-[11px] text-slate-500">{new Date(evLog.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
