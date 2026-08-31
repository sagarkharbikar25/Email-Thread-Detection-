"use client";

import React, { useState } from "react";
import { InvestigationSummary } from "../../types/forensics";

interface HeaderProps {
  investigation: InvestigationSummary;
  onExportReport?: () => void;
  onExportEvidence?: () => void;
}

export function Header({
  investigation,
  onExportReport,
  onExportEvidence,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-[72px] flex-shrink-0 bg-[#070C16] border-b border-[#1D293B] flex items-center justify-between px-6 z-20">
      {/* Title & Metadata */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#d7e3fb] tracking-tight flex items-center gap-2">
            Investigation #{investigation.caseNumber}
          </h2>
          <span className="status-badge-completed">
            {investigation.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#908fa0] mt-1 font-normal">
          <span className="truncate max-w-[340px]">
            Subject:{" "}
            <span className="text-red-400 font-medium">{investigation.subject}</span>
          </span>
          <span className="text-[#464554]">•</span>
          <span className="truncate max-w-[300px] font-mono text-[11px]">
            From: <span className="text-[#c7c4d7]">{investigation.from}</span>
          </span>
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExportReport}
          className="px-3.5 py-1.5 rounded bg-[#1D293B] text-[#d7e3fb] text-xs font-medium flex items-center gap-2 hover:bg-[#293548] transition-colors border border-[#464554]/50 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px] text-[#c0c1ff]">
            description
          </span>
          <span>Download PDF Report</span>
          <span className="material-symbols-outlined text-[14px] text-[#908fa0]">
            expand_more
          </span>
        </button>

        <button
          onClick={onExportEvidence}
          className="px-4 py-1.5 rounded bg-[#6366F1] text-white text-xs font-medium flex items-center gap-2 hover:bg-[#5254db] transition-all shadow-md shadow-indigo-600/20"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Export Evidence</span>
          <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>

        <div className="flex items-center gap-2.5 ml-3 border-l border-[#1D293B] pl-4">
          <button
            onClick={handleShare}
            title={copied ? "Link Copied!" : "Share Investigation"}
            className="p-1.5 rounded text-[#908fa0] hover:text-[#d7e3fb] hover:bg-[#1D293B] transition-colors relative"
          >
            <span className="material-symbols-outlined text-[20px]">
              {copied ? "check" : "share"}
            </span>
          </button>

          <button
            title="System Notifications"
            className="p-1.5 rounded text-[#908fa0] hover:text-[#d7e3fb] hover:bg-[#1D293B] transition-colors relative"
          >
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
            <span className="absolute 1.5 1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#070C16]"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 ml-1 pl-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-[#1D293B] flex items-center justify-center border border-indigo-500/30 text-xs font-bold text-[#c0c1ff] group-hover:border-indigo-400 transition-colors">
              AS
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#d7e3fb] leading-tight">
                Analyst
              </span>
              <span className="text-[10px] text-[#908fa0] leading-tight">
                Security Team
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
