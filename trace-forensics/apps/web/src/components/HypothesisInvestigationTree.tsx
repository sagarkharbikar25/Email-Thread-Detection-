import React, { useState } from 'react';
import { GitFork, CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck, FileSearch, Sparkles } from 'lucide-react';

interface HypothesisNode {
  id: string;
  hypothesis: string;
  plan: string;
  actionQuery: string;
  result: string;
  verdict: string;
  status: 'CONFIRMED' | 'REFUTED' | 'SUSPICIOUS';
}

const SAMPLE_HYPOTHESES: HypothesisNode[] = [
  {
    id: 'h1',
    hypothesis: 'Hypothesis: Sender Domain is Spoofed (DMARC Policy Violation)',
    plan: 'Validation Plan: DNS TXT Query for _dmarc.paypal.com',
    actionQuery: 'dig TXT _dmarc.paypal.com +short',
    result: 'Action Result: "v=DMARC1; p=reject; rua=mailto:d@rua.ag.paypal.com"',
    verdict: 'Analysis: Origin IP (185.220.101.5) fails SPF and DKIM alignment, triggering strict DMARC rejection.',
    status: 'CONFIRMED'
  },
  {
    id: 'h2',
    hypothesis: 'Hypothesis: Origin Host is Tor Anonymization Exit Relay',
    plan: 'Validation Plan: Query Onionoo & Tor Project Consensus List',
    actionQuery: 'curl -s https://onionoo.torproject.org/details?lookup=185.220.101.5',
    result: 'Action Result: Relay Fingerprint matches active German Tor Exit Node (Zwiebelfreunde e.V.)',
    verdict: 'Analysis: Attacker leveraged Tor routing to obscure geographical origin of SMTP injection.',
    status: 'CONFIRMED'
  },
  {
    id: 'h3',
    hypothesis: 'Hypothesis: Embedded Hyperlinks Lead to Credential Harvester',
    plan: 'Validation Plan: Threat Intelligence URL Sandbox & DOM Scan',
    actionQuery: 'scan_target: http://185.220.101.5/paypal-login-secure/verify.php',
    result: 'Action Result: HTTP 200 with fraudulent PayPal CSS login clone form collecting credentials',
    verdict: 'Analysis: Confirmed active credential harvesting infrastructure hosted on bare IP.',
    status: 'CONFIRMED'
  }
];

export const HypothesisInvestigationTree: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<HypothesisNode>(SAMPLE_HYPOTHESES[0]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
              Hypothesis & Forensic Triage Tree
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Automated Reasoning & Evidence Verification Workflow (SIH Reference PS 26106)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Forensic Co-Pilot Active
          </span>
        </div>
      </div>

      {/* Interactive Flowchart Chain */}
      <div className="space-y-4">
        {SAMPLE_HYPOTHESES.map((node, idx) => {
          const isSelected = selectedNode.id === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`glass-panel p-4 rounded-xl border transition cursor-pointer ${
                isSelected ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-xs">
                {/* Step 1: Hypothesis */}
                <div className="flex-1 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">
                    Stage 1 • Hypothesis
                  </span>
                  <p className="text-slate-200 font-semibold">{node.hypothesis}</p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 hidden lg:block flex-shrink-0" />

                {/* Step 2: Validation Plan */}
                <div className="flex-1 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block mb-1">
                    Stage 2 • Validation Plan
                  </span>
                  <p className="text-slate-300">{node.plan}</p>
                  <code className="text-[10px] text-slate-500 block mt-1">{node.actionQuery}</code>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 hidden lg:block flex-shrink-0" />

                {/* Step 3: Action Result & Verdict */}
                <div className="flex-1 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">
                      Stage 3 • Action Result
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                      {node.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{node.result}</p>
                </div>
              </div>

              {/* Expanded Verdict for Selected Hypothesis */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-cyan-500/30 flex items-start gap-2.5 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-cyan-400 font-bold uppercase block text-[10px]">Forensic Conclusion Verdict</span>
                    <p className="text-slate-200">{node.verdict}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
