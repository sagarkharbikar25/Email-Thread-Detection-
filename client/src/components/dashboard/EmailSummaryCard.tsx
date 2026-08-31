"use client";

import React from "react";
import { InvestigationSummary } from "../../types/forensics";

interface EmailSummaryCardProps {
  investigation: InvestigationSummary;
  onViewHeaders?: () => void;
  onInfoClick?: () => void;
}

export function EmailSummaryCard({
  investigation,
  onViewHeaders,
  onInfoClick,
}: EmailSummaryCardProps) {
  return (
    <div className="col-span-12 lg:col-span-4 card-base flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-3">
        <span>EMAIL SUMMARY</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Forensic metadata parsed from RFC822 email envelope"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      {/* Metadata Table Rows */}
      <div className="flex-1 space-y-2 text-xs">
        <div className="grid grid-cols-[75px_1fr] gap-2 items-baseline">
          <span className="text-[#908fa0] font-medium">From:</span>
          <span className="font-mono text-[11px] text-[#d7e3fb] truncate bg-[#09111F] px-1.5 py-0.5 rounded border border-[#1D293B]">
            {investigation.from}
          </span>
        </div>

        <div className="grid grid-cols-[75px_1fr] gap-2 items-baseline">
          <span className="text-[#908fa0] font-medium">To:</span>
          <span className="font-mono text-[11px] text-[#c7c4d7] truncate bg-[#09111F] px-1.5 py-0.5 rounded border border-[#1D293B]">
            {investigation.to}
          </span>
        </div>

        <div className="grid grid-cols-[75px_1fr] gap-2 items-baseline">
          <span className="text-[#908fa0] font-medium">Date:</span>
          <span className="text-[#d7e3fb] text-[11px] font-medium">
            {investigation.date}
          </span>
        </div>

        <div className="grid grid-cols-[75px_1fr] gap-2 items-baseline">
          <span className="text-[#908fa0] font-medium">Subject:</span>
          <span className="text-red-400 font-semibold text-[11px] truncate">
            {investigation.subject}
          </span>
        </div>

        <div className="grid grid-cols-[75px_1fr] gap-2 items-start">
          <span className="text-[#908fa0] font-medium pt-0.5">Received:</span>
          <div className="flex flex-col text-[10px] font-mono text-[#908fa0] bg-[#09111F] p-1.5 rounded border border-[#1D293B] space-y-0.5">
            {investigation.receivedPath.map((path, idx) => (
              <span key={idx} className="truncate">
                {path}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[75px_1fr] gap-2 items-baseline">
          <span className="text-[#908fa0] font-medium">Message ID:</span>
          <span className="font-mono text-[10px] text-[#908fa0] truncate">
            {investigation.messageId}
          </span>
        </div>

        {/* Badges row */}
        <div className="grid grid-cols-[75px_1fr] gap-2 items-center border-t border-[#1D293B] pt-2.5 mt-2">
          <span className="text-[#908fa0] font-medium">Payloads:</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-[10px] font-mono flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[12px]">attach_file</span>
              {investigation.attachmentsCount} Attachment
            </span>
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[10px] font-mono flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[12px]">link</span>
              {investigation.linksCount} URLs
            </span>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={onViewHeaders}
        className="mt-3 text-xs text-[#8083ff] hover:text-[#c0c1ff] font-medium flex items-center gap-1 hover:underline w-fit transition-colors"
      >
        <span>View Full RFC822 Headers</span>
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  );
}
