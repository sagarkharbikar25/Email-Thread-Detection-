import React, { useState } from 'react';
import { ThreatGraphNode } from '../types';
import { Globe, Server, Link2, FileText, Mail, ShieldAlert, X, Copy, Check, ExternalLink } from 'lucide-react';

interface NodeDetailsDrawerProps {
  node: ThreatGraphNode | null;
  onClose: () => void;
}

export const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({ node, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'whois' | 'intel'>('details');
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCritical = node.data.threat_level === 'CRITICAL';
  const isHigh = node.data.threat_level === 'HIGH';

  return (
    <div className="w-full lg:w-96 glass-panel-elevated border-l border-slate-700 p-5 flex flex-col justify-between overflow-y-auto space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div>
          <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
            Entity Threat Inspector
          </span>
          <h4 className="text-sm font-bold text-white truncate max-w-[240px]">
            {node.data.label}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Threat Severity Badge */}
      <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-xl border border-slate-800">
        <span className="text-slate-400">Threat Rating:</span>
        <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
          isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
          isHigh ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
        }`}>
          {node.data.threat_level || 'SUSPICIOUS'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
        {(['details', 'whois', 'intel'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 rounded text-center uppercase font-bold transition ${
              activeTab === tab ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="text-slate-200">{node.data.category || node.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Node ID:</span>
              <span className="text-cyan-400">{node.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">First Observed:</span>
              <span className="text-slate-300">2026-08-31 08:30:12</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Associated Attributes</span>
            <div className="space-y-1 text-slate-300">
              <p>• ASN: AS200651 Zwiebelfreunde e.V.</p>
              <p>• Geolocation: Frankfurt am Main, Germany (DE)</p>
              <p>• Tor Exit Node Status: <span className="text-red-400 font-bold">CONFIRMED ACTIVE</span></p>
              <p>• Abuse Confidence: <span className="text-red-400 font-bold">95/100</span></p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'whois' && (
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-slate-300">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block">Registrar & DNS Records</span>
          <p><span className="text-slate-500">Registrar:</span> NameCheap Inc.</p>
          <p><span className="text-slate-500">Created Date:</span> 2026-08-15 (New Domain)</p>
          <p><span className="text-slate-500">Name Servers:</span> ns1.bulletproof-dns.org</p>
          <p><span className="text-slate-500">SPF Record:</span> v=spf1 -all (Policy Reject)</p>
        </div>
      )}

      {activeTab === 'intel' && (
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-slate-300">
          <span className="text-[10px] uppercase font-bold text-red-400 block">Correlated Threat Feeds</span>
          <p>• VirusTotal URL Score: 14/90 Malicious</p>
          <p>• AlienVault OTX: Active Phishing Campaign</p>
          <p>• AbuseIPDB: 48 reports in last 7 days</p>
        </div>
      )}

      {/* Copy Raw Identifier */}
      <button
        onClick={() => handleCopy(node.data.label)}
        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center gap-2 text-xs font-bold transition"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied to Clipboard' : 'Copy Node Identifier'}
      </button>
    </div>
  );
};
