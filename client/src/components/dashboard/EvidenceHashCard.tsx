"use client";

import React, { useState } from "react";

interface EvidenceHashCardProps {
  hash: string;
  algorithm?: string;
  onInfoClick?: () => void;
}

export function EvidenceHashCard({
  hash,
  algorithm = "SHA-256",
  onInfoClick,
}: EvidenceHashCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedHash = `${hash.slice(0, 10)}...${hash.slice(-4)}`;

  return (
    <div className="col-span-12 sm:col-span-6 lg:col-span-2 card-base flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#908fa0] font-semibold tracking-wider mb-2">
        <span>EVIDENCE HASH</span>
        <button
          onClick={onInfoClick}
          className="text-[#908fa0] hover:text-[#d7e3fb] transition-colors"
          title="Cryptographic chain of custody integrity hash"
        >
          <span className="material-symbols-outlined text-[14px]">info</span>
        </button>
      </div>

      <div className="flex flex-col justify-center flex-1 py-1">
        <button
          onClick={handleCopy}
          className="group flex items-center justify-between font-mono text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors mb-1 text-left"
          title="Click to copy full SHA-256 hash"
        >
          <span className="truncate">{truncatedHash}</span>
          <span className="material-symbols-outlined text-[14px] opacity-60 group-hover:opacity-100 ml-1">
            {copied ? "check" : "content_copy"}
          </span>
        </button>

        <span className="text-[10px] text-[#908fa0] font-mono mb-2">
          {algorithm} {copied && <span className="text-emerald-400">(Copied!)</span>}
        </span>

        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
          <span className="material-symbols-outlined text-[15px]">
            verified
          </span>
          <span>Integrity Verified</span>
        </div>
      </div>
    </div>
  );
}
