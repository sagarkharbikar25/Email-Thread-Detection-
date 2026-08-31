"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";

interface HeadersModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawHeaders: string;
  caseId: string;
}

export function HeadersModal({
  isOpen,
  onClose,
  rawHeaders,
  caseId,
}: HeadersModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawHeaders);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raw RFC822 Forensic Headers"
      subtitle={`Artifact Header Stream for Case #${caseId}`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#09111F] p-3 rounded border border-[#1D293B]">
          <div className="flex items-center gap-2 text-xs text-[#908fa0]">
            <span className="material-symbols-outlined text-[16px] text-indigo-400">
              terminal
            </span>
            <span>Unmodified RFC5322 MIME stream (SHA-256 verified)</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? "check" : "content_copy"}
            </span>
            <span>{copied ? "Copied!" : "Copy Headers"}</span>
          </button>
        </div>

        {/* Code block */}
        <pre className="font-mono text-xs text-[#c7c4d7] bg-[#070C16] p-4 rounded-lg border border-[#1D293B] overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar max-h-[50vh]">
          {rawHeaders}
        </pre>
      </div>
    </Modal>
  );
}
