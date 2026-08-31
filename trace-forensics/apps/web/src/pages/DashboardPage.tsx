import React from 'react';
import { EmailDetail, CaseItem } from '../types';
import { PolarThreatRadar } from '../components/PolarThreatRadar';
import { GlobalThreatMap } from '../components/GlobalThreatMap';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  ShieldAlert, Flame, CheckCircle, Mail, ArrowUpRight, 
  Upload, Play, CheckSquare, Shield, AlertTriangle, UserCheck, ShieldCheck, Terminal
} from 'lucide-react';

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

  const actionItems = [
    { id: 'a1', title: 'Revoke and reset compromised user credentials', rel: 'Related: PayPal Phishing #p1', severity: 'CRITICAL', status: 'Pending SOC Approval' },
    { id: 'a2', title: 'Block bulletproof MTA IP range (194.26.29.0/24) on border firewall', rel: 'Related: CEO BEC Fraud #p2', severity: 'CRITICAL', status: 'Action Queued' },
    { id: 'a3', title: 'Isolate finance workstation finance.lead@victim-corp.com', rel: 'Related: CEO BEC Fraud', severity: 'HIGH', status: 'In Progress' },
    { id: 'a4', title: 'Enforce strict DMARC p=reject alignment on corporate MX gateways', rel: 'Related: Domain Spoofing', severity: 'MEDIUM', status: 'Policy Review' },
    { id: 'a5', title: 'Submit malicious URL to Google SafeBrowsing & Microsoft Defender API', rel: 'Related: Credential Harvester', severity: 'HIGH', status: 'Dispatched' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                Cyber SOC Command Center
              </span>
              <span className="text-xs text-slate-400 font-mono">SIH 2026 Problem Statement PS 26106</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Email Threat Intelligence & Forensic Radar
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Multi-hop relay route reconstruction, cryptographic verification, autonomous correlation, and polar radar threat analytics.
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

      {/* Metric Counters Bar (from Reference Design 1 & 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">Total Ingested Artifacts</p>
            <p className="text-3xl font-black text-white mt-1 font-mono">{emails.length}</p>
            <span className="text-[11px] text-cyan-400 font-mono">RFC 5322 Ingestion Active</span>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-red-500/30 bg-red-950/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-red-400 uppercase font-mono tracking-wider">Confirmed Phish / BEC</p>
            <p className="text-3xl font-black text-red-400 mt-1 font-mono">{criticalCount}</p>
            <span className="text-[11px] text-red-400/80 font-mono">High-Severity Spoofing</span>
          </div>
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-orange-500/30 bg-orange-950/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-400 uppercase font-mono tracking-wider">Active Incident Cases</p>
            <p className="text-3xl font-black text-orange-400 mt-1 font-mono">{cases.length}</p>
            <span className="text-[11px] text-orange-400/80 font-mono">SOC Forensic Escalations</span>
          </div>
          <div className="p-3 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400 uppercase font-mono tracking-wider">Cryptographically Verified</p>
            <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{legitCount}</p>
            <span className="text-[11px] text-emerald-400/80 font-mono">SPF & DKIM Validated</span>
          </div>
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Center Stage: Polar Threat Radar + Action Items (Reference Design 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Polar Threat Radar (2 Cols) */}
        <div className="lg:col-span-2">
          <PolarThreatRadar
            onSelectIncident={(subject) => {
              const matched = emails.find(e => e.subject.toLowerCase().includes(subject.toLowerCase().slice(0, 10)));
              if (matched) onSelectEmail(matched.id);
              onNavigate('analysis');
            }}
          />
        </div>

        {/* Action Items List (1 Col - Reference Design 1) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                  SOC Action Items ({actionItems.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Real-time Triage</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-900/80 hover:bg-slate-800/80 rounded-xl border border-slate-800/80 space-y-2 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    }`}>
                      {item.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.status}</span>
                  </div>

                  <p className="text-slate-200 font-semibold text-[11px] leading-snug">{item.title}</p>
                  <p className="text-[10px] text-slate-500">{item.rel}</p>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onNavigate('analysis')}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => alert(`Executed remediation action: ${item.title}`)}
                      className="px-3 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold"
                    >
                      Execute Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('cases')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs font-bold transition text-center block mt-2"
          >
            Open All Investigation Cases &rarr;
          </button>
        </div>
      </div>

      {/* Global Geolocation Map & MITRE ATT&CK Matrix (Reference Designs 4 & 6) */}
      <GlobalThreatMap />

      {/* 1-Click SIH Hackathon Demo Fixtures */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              1-Click SIH Hackathon Demo Fixtures (Pre-Loaded Live Datasets)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Instant Dossier Evaluation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emails.map((eml) => (
            <div
              key={eml.id}
              onClick={() => { onSelectEmail(eml.id); onNavigate('analysis'); }}
              className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <ThreatBadge level={eml.classification} />
                  <span className="font-mono text-xs font-bold text-cyan-400">Score: {eml.risk_score}/100</span>
                </div>
                <h3 className="font-bold text-sm text-slate-100 line-clamp-2 mb-1 group-hover:text-cyan-300 transition">{eml.subject}</h3>
                <p className="text-xs text-slate-400 font-mono truncate">From: {eml.from_display || eml.from_address}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold font-mono">
                <span>Inspect Forensic Dossier</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
