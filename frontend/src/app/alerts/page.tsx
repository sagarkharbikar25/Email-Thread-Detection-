"use client";

import React from "react";
import { MOCK_INVESTIGATIONS_LIST } from "../../constants/mockData";

export default function AlertsPage() {
  return (
    <div className="flex flex-col h-full bg-[#070C16] p-6 text-[#d7e3fb]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Notification Center</p>
          <h1 className="mt-2 text-3xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-rose-500">notifications_active</span>
            System Alerts
          </h1>
        </div>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Mark All as Read
        </button>
      </div>

      <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto custom-scrollbar flex-1 -mx-6 px-6 space-y-3">
          {/* Real-time high priority alert */}
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex gap-4 items-start relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-rose-400 text-xl">gpp_maybe</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-white">Critical Threat Detected</h3>
                <span className="text-xs font-mono text-rose-400">Just now</span>
              </div>
              <p className="text-sm text-rose-300/80 mb-2">High-confidence Business Email Compromise (BEC) attempt detected targeting user@gov.in.</p>
              <div className="flex gap-3">
                <button className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded hover:bg-rose-600 transition">Investigate Now</button>
                <button className="text-xs font-medium text-rose-400 hover:text-rose-300">Dismiss</button>
              </div>
            </div>
          </div>

          {/* Historical alerts from MOCK_INVESTIGATIONS_LIST */}
          {MOCK_INVESTIGATIONS_LIST.map((inv, idx) => (
            <div key={inv.id} className="bg-[#1a2333] border border-[#2d3a50] p-4 rounded-xl flex gap-4 items-start hover:border-indigo-500/50 transition">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                inv.riskScore > 80 ? 'bg-orange-500/20' : 'bg-yellow-500/20'
              }`}>
                <span className={`material-symbols-outlined text-xl ${
                  inv.riskScore > 80 ? 'text-orange-400' : 'text-yellow-400'
                }`}>
                  {inv.riskScore > 80 ? 'warning' : 'info'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-white">New Case Opened: {inv.id}</h3>
                  <span className="text-xs font-mono text-slate-400">{inv.date}</span>
                </div>
                <p className="text-sm text-slate-400 mb-2">
                  Suspicious email "{inv.subject}" from <span className="font-mono text-indigo-300">{inv.from}</span> flagged for analysis.
                </p>
                <div className="flex gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 border border-[#2d3a50] px-2 py-0.5 rounded">{inv.classification}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 border border-[#2d3a50] px-2 py-0.5 rounded">Risk: {inv.riskScore}</span>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
