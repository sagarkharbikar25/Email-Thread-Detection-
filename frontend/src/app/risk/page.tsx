"use client";

import React from "react";
import { MOCK_INVESTIGATION } from "../../constants/mockData";

export default function RiskAssessmentPage() {
  return (
    <div className="flex flex-col h-full bg-[#070C16] p-6 text-[#d7e3fb] overflow-y-auto custom-scrollbar">
      <div className="mb-6 shrink-0">
        <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Automated Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-rose-500">warning</span>
          Risk Assessment & Remediation
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
        {/* Left Column: XAI Summary */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-rose-500/30 bg-[#0D1726] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-rose-400">
              <span className="material-symbols-outlined">auto_awesome</span>
              Explainable AI (XAI) Attack Summary
            </h2>
            
            <div className="bg-[#1a2333] border border-[#2d3a50] rounded-xl p-5 space-y-4 text-sm leading-relaxed text-[#c7c4d7]">
              <p>
                <strong className="text-white">Attack Vector Identified:</strong> The artifact <span className="font-mono text-indigo-400">{MOCK_INVESTIGATION.id}</span> is a highly sophisticated <strong>{MOCK_INVESTIGATION.classificationName}</strong> attempt.
              </p>
              <p>
                <strong className="text-white">Execution Chain:</strong> The attacker spoofed the trusted domain <code>paypa1-security.com</code>. The email bypassed SPF alignment because the originating IP (<code>203.0.113.5</code> located in Singapore) is not authorized in the domain's TXT records. DKIM signatures were also invalid due to a payload hash mismatch.
              </p>
              <p>
                <strong className="text-white">Payload Analysis:</strong> Natural Language Processing (NLP) models detected extreme urgency heuristics (Confidence: 95%) designed to force the user into immediate action. The embedded hyperlink redirects through an open redirector to a known credential harvesting endpoint.
              </p>
              
              <div className="mt-4 flex gap-3">
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex-1">
                  <p className="text-xs text-rose-400 uppercase tracking-wider font-bold mb-1">Calculated Risk</p>
                  <p className="text-2xl font-black text-rose-500">{MOCK_INVESTIGATION.riskScore}/100</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex-1">
                  <p className="text-xs text-orange-400 uppercase tracking-wider font-bold mb-1">Threat Level</p>
                  <p className="text-xl font-bold text-orange-500 mt-1">{MOCK_INVESTIGATION.threatLevel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400">radar</span>
              Triggered Heuristics
            </h2>
            <div className="space-y-3">
              {MOCK_INVESTIGATION.threatSignals.map((signal) => (
                <div key={signal.id} className="flex items-start justify-between bg-[#1a2333] border border-[#2d3a50] p-4 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{signal.label}</h3>
                    <p className="text-xs text-slate-400 mt-1">{signal.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ${
                    signal.severity === "critical" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  }`}>
                    {signal.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Playbooks */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6 flex-1">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">shield_with_heart</span>
              Automated Remediation Playbooks
            </h2>
            <p className="text-sm text-slate-400 mb-6">Execute 1-click mitigation strategies across your security infrastructure to contain this threat.</p>
            
            <div className="space-y-4">
              {/* Playbook 1 */}
              <div className="bg-[#1a2333] border border-[#2d3a50] p-5 rounded-xl transition hover:border-indigo-500/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <span className="material-symbols-outlined">gavel</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Firewall Enforcement</h3>
                      <p className="text-xs text-slate-400">Block origin IP across all perimeter firewalls</p>
                    </div>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded shadow-[0_0_15px_rgba(99,102,241,0.3)] transition">
                    Execute
                  </button>
                </div>
                <div className="bg-[#09111F] rounded p-2 text-xs font-mono text-slate-300">
                  <span className="text-indigo-400">Target:</span> 203.0.113.5 (Singapore)
                </div>
              </div>

              {/* Playbook 2 */}
              <div className="bg-[#1a2333] border border-[#2d3a50] p-5 rounded-xl transition hover:border-emerald-500/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <span className="material-symbols-outlined">mail_lock</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Tenant Quarantine</h3>
                      <p className="text-xs text-slate-400">Purge identical emails from all user inboxes</p>
                    </div>
                  </div>
                  <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] transition">
                    Execute
                  </button>
                </div>
                <div className="bg-[#09111F] rounded p-2 text-xs font-mono text-slate-300">
                  <span className="text-emerald-400">Hash:</span> 8f4a2d9b91bc731a5e4299de...
                </div>
              </div>

              {/* Playbook 3 */}
              <div className="bg-[#1a2333] border border-[#2d3a50] p-5 rounded-xl transition hover:border-orange-500/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <span className="material-symbols-outlined">password</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Identity Protection</h3>
                      <p className="text-xs text-slate-400">Force password reset for targeted user</p>
                    </div>
                  </div>
                  <button className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded shadow-[0_0_15px_rgba(249,115,22,0.3)] transition">
                    Execute
                  </button>
                </div>
                <div className="bg-[#09111F] rounded p-2 text-xs font-mono text-slate-300">
                  <span className="text-orange-400">User:</span> user@gov.in
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
