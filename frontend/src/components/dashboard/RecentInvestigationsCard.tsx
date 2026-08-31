"use client";

import React, { useState } from "react";
import { RecentInvestigationItem } from "../../types/forensics";

interface RecentInvestigationsCardProps {
  investigations: RecentInvestigationItem[];
  selectedId?: string;
  onSelectInvestigation?: (item: RecentInvestigationItem) => void;
  onViewAll?: () => void;
}

export function RecentInvestigationsCard({
  investigations,
  selectedId = "TRC-1024",
  onSelectInvestigation,
  onViewAll,
}: RecentInvestigationsCardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = investigations.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.classification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="col-span-12 lg:col-span-9 card-base p-0 flex flex-col overflow-hidden border-[#1D293B]">
      {/* Header with Search */}
      <div className="p-3.5 border-b border-[#1D293B] flex items-center justify-between bg-[#09111F]">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#908fa0] font-semibold tracking-wider">
            RECENT INVESTIGATIONS
          </span>
          <span className="text-[10px] font-mono text-[#908fa0] bg-[#142032] px-2 py-0.5 rounded border border-[#1D293B]">
            {filtered.length} Records
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-xs text-[#908fa0]">
              search
            </span>
            <input
              type="text"
              placeholder="Filter cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#142032] border border-[#1D293B] text-[#d7e3fb] text-xs rounded pl-7 pr-2.5 py-1 focus:outline-none focus:border-indigo-500 w-40 placeholder:text-[#464554]"
            />
          </div>

          <button
            onClick={onViewAll}
            className="text-xs text-[#8083ff] hover:text-[#c0c1ff] font-medium flex items-center gap-1 transition-colors"
          >
            <span>All Cases</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="text-[#908fa0] bg-[#070C16] border-b border-[#1D293B] font-semibold">
            <tr>
              <th className="px-4 py-2.5">ID</th>
              <th className="px-4 py-2.5">Subject</th>
              <th className="px-4 py-2.5">From</th>
              <th className="px-4 py-2.5 text-center">Risk Score</th>
              <th className="px-4 py-2.5">Classification</th>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D293B]/60">
            {filtered.map((item) => {
              const isSelected = item.id === selectedId;
              const isCritical = item.riskScore >= 80;
              const isWarning = item.riskScore >= 60 && item.riskScore < 80;

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectInvestigation?.(item)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-500/10 hover:bg-indigo-500/15"
                      : "hover:bg-[#142032]/80"
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-[#8083ff] flex items-center gap-1.5">
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff]"></span>
                    )}
                    {item.id}
                  </td>
                  <td
                    className={`px-4 py-3 truncate max-w-[220px] font-medium ${
                      isCritical
                        ? "text-red-400 font-semibold"
                        : isWarning
                        ? "text-amber-300"
                        : "text-[#d7e3fb]"
                    }`}
                  >
                    {item.subject}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#908fa0] truncate max-w-[200px]">
                    {item.from}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-mono font-extrabold px-2 py-0.5 rounded text-[11px] ${
                        isCritical
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : isWarning
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {item.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        isCritical
                          ? "text-red-400"
                          : isWarning
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {item.classification}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#908fa0] text-[11px] font-mono">
                    {item.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
