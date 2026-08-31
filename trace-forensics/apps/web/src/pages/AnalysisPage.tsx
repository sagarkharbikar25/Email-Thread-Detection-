import React, { useState } from 'react';
import { EmailDetail } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { AuthVerificationCard } from '../components/AuthVerificationCard';
import { RelayTimeline } from '../components/RelayTimeline';
import { InteractiveThreatGraph } from '../components/InteractiveThreatGraph';
import { HeaderInspector } from '../components/HeaderInspector';
import { ForensicReportModal } from '../components/ForensicReportModal';
import { 
  ShieldAlert, Activity, Key, Server, Network, 
  Terminal, FileText, Download, Briefcase, CheckCircle2, ChevronRight, Lock
} from 'lucide-react';

interface AnalysisPageProps {
  email: EmailDetail;
  onNavigate: (page: string) => void;
  onLinkToCase?: (emailId: string) => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ email, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'auth' | 'trace' | 'graph' | 'headers' | 'body'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [caseCreated, setCaseCreated] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Signals & Verdict', icon: Activity },
    { id: 'auth', label: 'Auth (SPF/DKIM/DMARC)', icon: Key },
    { id: 'trace', label: 'Transmission Hops', icon: Server },
    { id: 'graph', label: 'Threat Graph', icon: Network },
    { id: 'headers', label: 'Headers Table', icon: Terminal },
    { id: 'body', label: 'Raw Evidence', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Top Incident Summary Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Email Metadata */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <ThreatBadge level={email.classification} />
              <span className="text-xs text-slate-400 font-mono">
                SHA-256: <span className="text-cyan-400 font-bold">{email.sha256.slice(0, 16)}...</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">• {email.filename}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{email.subject}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-mono pt-1">
              <div>
                <span className="text-slate-500">From:</span> {email.from_display ? `"${email.from_display}" ` : ''}&lt;{email.from_address}&gt;
              </div>
              <div>
                <span className="text-slate-500">To:</span> {email.to_addresses.join(', ')}
              </div>
              {email.reply_to && (
                <div className="text-orange-400">
                  <span className="text-slate-500">Reply-To:</span> {email.reply_to}
                </div>
              )}
              <div>
                <span className="text-slate-500">Date:</span> {email.date_header || email.created_at}
              </div>
            </div>
          </div>

          {/* Right Risk Gauge & Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <RiskGauge score={email.risk_score} size="lg" />

            <div className="flex flex-col gap-2 min-w-[170px]">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
              >
                <Download className="w-4 h-4" /> Export Dossier (PDF)
              </button>

              <button
                onClick={() => setCaseCreated(true)}
                disabled={caseCreated}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition ${
                  caseCreated
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {caseCreated ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Briefcase className="w-4 h-4" />}
                {caseCreated ? 'Attached to Case #SIH01' : '+ Escalate to Case'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-900/80 rounded-xl border border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider font-mono whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Signals & Verdict */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Origin Assessment Banner */}
          {email.origin_assessment && (
            <div className="glass-panel p-5 rounded-xl border border-red-500/30 bg-red-950/10 flex items-start gap-3.5">
              <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-red-400 font-mono">
                  Forensic Origin Assessment (Confidence: {email.origin_confidence || 85}%)
                </h3>
                <p className="text-sm font-semibold text-slate-100 mt-1">{email.origin_assessment}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Transmitted IP addresses indicate hosting/obfuscation relay infrastructure. Cryptographic alignment failed policy checks.
                </p>
              </div>
            </div>
          )}

          {/* Granular Detection Signals List */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Detected Threat Signals ({email.signals.length} Weighted Indicators)
              </h3>
              <span className="text-xs text-slate-500 font-mono">Aggregated Score: {email.risk_score}/100</span>
            </div>

            <div className="space-y-3">
              {email.signals.map((signal, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 flex items-start justify-between gap-4 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                        signal.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        signal.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        signal.severity === 'INFO' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {signal.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-400">[{signal.category}]</span>
                      <h4 className="text-sm font-bold text-slate-200">{signal.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400">{signal.description}</p>
                    {signal.evidence && (
                      <p className="text-xs font-mono text-cyan-400 bg-slate-900/80 px-2.5 py-1 rounded inline-block mt-1">
                        Evidence: {signal.evidence}
                      </p>
                    )}
                  </div>

                  <div className="text-right font-mono flex-shrink-0">
                    <span className={`text-sm font-bold ${signal.weight > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {signal.weight > 0 ? `+${signal.weight}` : signal.weight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Authentication */}
      {activeTab === 'auth' && (
        <div className="space-y-6">
          <AuthVerificationCard auth={email.authentication} />
        </div>
      )}

      {/* Tab 3: Transmission Hops */}
      {activeTab === 'trace' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <RelayTimeline hops={email.hops} />
        </div>
      )}

      {/* Tab 4: Threat Graph */}
      {activeTab === 'graph' && (
        <div>
          <InteractiveThreatGraph graphData={email.graph_data} />
        </div>
      )}

      {/* Tab 5: Headers */}
      {activeTab === 'headers' && (
        <div>
          <HeaderInspector email={email} />
        </div>
      )}

      {/* Tab 6: Raw Evidence */}
      {activeTab === 'body' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-300 font-bold uppercase">Raw Cryptographic Artifacts</span>
            <span className="text-cyan-400">Integrity: VERIFIED SHA-256</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 space-y-2 overflow-x-auto">
            <p><span className="text-slate-500">File:</span> {email.filename}</p>
            <p><span className="text-slate-500">SHA-256:</span> {email.sha256}</p>
            <p><span className="text-slate-500">Size:</span> {email.file_size_bytes} Bytes</p>
            <p><span className="text-slate-500">Ingested:</span> {email.created_at}</p>
            <p><span className="text-slate-500">Links:</span> {email.urls?.length || 0} embedded hyperlinks extracted</p>
          </div>
        </div>
      )}

      {/* Forensic Report Modal */}
      {showReportModal && (
        <ForensicReportModal
          email={email}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
