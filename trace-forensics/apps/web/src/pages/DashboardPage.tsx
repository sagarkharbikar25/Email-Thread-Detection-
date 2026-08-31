import React from 'react';
import { EmailDetail, CaseItem } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { ShieldAlert, AlertTriangle, CheckCircle, Flame, Mail, ArrowUpRight, Upload, Play } from 'lucide-react';

interface DashboardPageProps {
  emails: EmailDetail[];
  cases: CaseItem[];
  onSelectEmail: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ emails, cases, onSelectEmail, onNavigate }) => {
  const criticalCount = emails.filter(e => e.risk_score >= 80).length;
  const highCount = emails.filter(e => e.risk_score >= 60 && e.risk_score < 80).length;
  const legitCount = emails.filter(e => e.risk_score < 40).length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                Command Center v1.0
              </span>
              <span className="text-xs text-slate-400">SIH 2026 Problem Statement PS 26106</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Forensic Email Threat Intelligence Platform
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time header parsing, cryptographic SPF/DKIM verification, multi-hop relay trace, and interactive threat graph correlation.
            </p>
          </div>

          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition"
          >
            <Upload className="w-4 h-4" />
            + Ingest New .EML
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">Total Ingested</p>
            <p className="text-3xl font-black text-white mt-1 font-mono">{emails.length}</p>
            <span className="text-[11px] text-cyan-400">RFC 5322 Forensics Indexed</span>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-red-500/30 bg-red-950/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-red-400 uppercase font-mono tracking-wider">Critical Threats</p>
            <p className="text-3xl font-black text-red-400 mt-1 font-mono">{criticalCount}</p>
            <span className="text-[11px] text-red-400/80">Phishing / BEC Wire Fraud</span>
          </div>
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-orange-500/30 bg-orange-950/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-400 uppercase font-mono tracking-wider">Active Cases</p>
            <p className="text-3xl font-black text-orange-400 mt-1 font-mono">{cases.length}</p>
            <span className="text-[11px] text-orange-400/80">Under Investigation</span>
          </div>
          <div className="p-3 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400 uppercase font-mono tracking-wider">Verified Clean</p>
            <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{legitCount}</p>
            <span className="text-[11px] text-emerald-400/80">SPF/DKIM/DMARC Passed</span>
          </div>
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 1-Click SIH Presentation Sample Analyzer */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              1-Click SIH Hackathon Demo Fixtures
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Instant Evaluation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emails.map((eml) => (
            <div
              key={eml.id}
              onClick={() => { onSelectEmail(eml.id); onNavigate('analysis'); }}
              className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <ThreatBadge level={eml.classification} />
                  <span className="font-mono text-xs font-bold text-cyan-400">Score: {eml.risk_score}/100</span>
                </div>
                <h3 className="font-bold text-sm text-slate-100 line-clamp-2 mb-1">{eml.subject}</h3>
                <p className="text-xs text-slate-400 font-mono truncate">From: {eml.from_display || eml.from_address}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span>Inspect Forensic Dossier</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ingested Emails Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Recent Ingested Email Evidence
          </h2>
          <span className="text-xs text-slate-400 font-mono">Real-time Pipeline Triage</span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="py-3 px-4">Threat Level</th>
                <th className="py-3 px-4">Subject & Sender</th>
                <th className="py-3 px-4">Authentication</th>
                <th className="py-3 px-4">Origin Attribution</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {emails.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <ThreatBadge level={e.classification} />
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-200 truncate">{e.subject}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{e.from_display} &lt;{e.from_address}&gt;</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className={e.authentication?.spf_result === 'PASS' ? 'text-emerald-400' : 'text-red-400'}>
                      SPF:{e.authentication?.spf_result || 'NONE'}
                    </span>{' '}
                    |{' '}
                    <span className={e.authentication?.dkim_result === 'PASS' ? 'text-emerald-400' : 'text-red-400'}>
                      DKIM:{e.authentication?.dkim_result || 'NONE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-xs">
                    {e.origin_assessment || 'Analyzed transmission route'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => { onSelectEmail(e.id); onNavigate('analysis'); }}
                      className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg font-semibold transition text-xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
