"use client";

import React from "react";

interface QuickActionsCardProps {
  onIngestClick?: () => void;
  onSearchClick?: () => void;
  onCreateCaseClick?: () => void;
}

export function QuickActionsCard({
  onIngestClick,
  onSearchClick,
  onCreateCaseClick,
}: QuickActionsCardProps) {
  return (
    <div className="col-span-12 lg:col-span-3 card-base flex flex-col p-4 justify-between">
      <div className="text-xs text-[#908fa0] font-semibold tracking-wider mb-3">
        QUICK ACTIONS
      </div>

      <div className="flex flex-col gap-2.5 flex-1 justify-center">
        {/* Ingest Action Button */}
        <button
          onClick={onIngestClick}
          className="flex items-center gap-3 w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-[#c0c1ff] border border-indigo-500/40 rounded-md py-2.5 px-4 transition-all text-xs font-semibold shadow-sm hover:border-indigo-400 group text-left"
        >
          <span className="material-symbols-outlined text-[18px] text-indigo-400 group-hover:scale-110 transition-transform">
            upload
          </span>
          <div className="flex flex-col">
            <span>Ingest New Email</span>
            <span className="text-[10px] text-[#908fa0] font-normal">
              Upload .EML, .MSG or raw headers
            </span>
          </div>
        </button>

        {/* Search Investigations */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-3 w-full bg-[#142032] hover:bg-[#1e2a3d] text-[#d7e3fb] border border-[#1D293B] hover:border-[#464554] rounded-md py-2.5 px-4 transition-all text-xs font-medium group text-left"
        >
          <span className="material-symbols-outlined text-[18px] text-[#908fa0] group-hover:text-[#d7e3fb] transition-colors">
            search
          </span>
          <div className="flex flex-col">
            <span>Search Investigations</span>
            <span className="text-[10px] text-[#908fa0] font-normal">
              Query IP, SHA-256 hash or domain
            </span>
          </div>
        </button>

        {/* Create Case */}
        <button
          onClick={onCreateCaseClick}
          className="flex items-center gap-3 w-full bg-[#142032] hover:bg-[#1e2a3d] text-[#d7e3fb] border border-[#1D293B] hover:border-[#464554] rounded-md py-2.5 px-4 transition-all text-xs font-medium group text-left"
        >
          <span className="material-symbols-outlined text-[18px] text-[#908fa0] group-hover:text-[#d7e3fb] transition-colors">
            create_new_folder
          </span>
          <div className="flex flex-col">
            <span>Create New Case</span>
            <span className="text-[10px] text-[#908fa0] font-normal">
              Bundle multiple forensic artifacts
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
