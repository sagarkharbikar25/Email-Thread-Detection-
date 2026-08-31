"use client";

import React from "react";
import { AuthenticationResult } from "../../types/forensics";

interface AuthenticationCardProps {
  authResults: AuthenticationResult;
  onViewDetails?: (type: "spf" | "dkim" | "dmarc") => void;
  onInfoClick?: () => void;
}

export function AuthenticationCard({
  authResults,
  onViewDetails,
  onInfoClick,
}: AuthenticationCardProps) {
  const protocols: Array<{
    key: "spf" | "dkim" | "dmarc";
    label: string;
    data: { status: string; reason: string; details?: string };
  }> = [
    { key: "spf", label: "SPF", data: authResults.spf },
    { key: "dkim", label: "DKIM", data: authResults.dkim },
    { key: "dmarc", label: "DMARC", data: authResults.dmarc },
  ];

  return (
    <div className="col-span-12 lg:col-span-3 card-base flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-3">
        <span>AUTHENTICATION RESULTS</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Email sender cryptographic authentication protocols"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 flex-1">
        {protocols.map(({ key, label, data }) => {
          const isFail = data.status === "FAIL";
          const isPass = data.status === "PASS";

          return (
            <div
              key={key}
              className="bg-[#09111F] border border-[#1D293B] rounded p-2.5 flex flex-col items-center text-center justify-between hover:border-[#464554] transition-colors"
            >
              <span className="text-xs font-bold tracking-wide text-[#d7e3fb] mb-1">
                {label}
              </span>

              <div
                className={`flex items-center gap-1 my-1 font-extrabold text-xs ${
                  isFail
                    ? "text-red-400"
                    : isPass
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isFail ? "cancel" : isPass ? "check_circle" : "warning"}
                </span>
                <span>{data.status}</span>
              </div>

              <p className="text-[9px] text-[#908fa0] mb-2 leading-tight flex-1 line-clamp-3">
                {data.reason}
              </p>

              <button
                onClick={() => onViewDetails?.(key)}
                className="text-[10px] font-medium bg-[#1e2a3d] text-[#c7c4d7] hover:text-white px-2 py-1 rounded w-full hover:bg-indigo-600/30 hover:border-indigo-500/40 border border-transparent transition-all"
              >
                View Details
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
