"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze?: (file: File | string) => void;
}

export function IngestModal({ isOpen, onClose, onAnalyze }: IngestModalProps) {
  const [rawText, setRawText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onAnalyze?.(rawText);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ingest Forensic Email Artifact"
      subtitle="Upload .eml, .msg or paste raw RFC822 mail headers for analysis"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              const file = e.dataTransfer.files[0];
              const reader = new FileReader();
              reader.onload = (event) => {
                setRawText(event.target?.result as string);
              };
              reader.readAsText(file);
            }
          }}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-[#1D293B] bg-[#09111F] hover:border-[#464554]"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-500/30">
            <span className="material-symbols-outlined text-2xl">upload_file</span>
          </div>
          <span className="text-sm font-semibold text-[#d7e3fb] mb-1">
            Drag & drop email file here, or browse
          </span>
          <span className="text-xs text-[#908fa0]">
            Supports .EML, .MSG, .MBOX, .TXT up to 50MB
          </span>
          <input
            type="file"
            accept=".eml,.msg,.txt,.mbox"
            className="hidden"
            id="file-upload"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  setRawText(event.target?.result as string);
                };
                reader.readAsText(file);
              }
            }}
          />
          <label
            htmlFor="file-upload"
            className="mt-3 px-3 py-1.5 bg-[#142032] hover:bg-[#1e2a3d] text-[#c0c1ff] border border-indigo-500/30 rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            Select Local File
          </label>
        </div>

        {/* Or Paste Raw Headers */}
        <div>
          <label className="block text-xs font-semibold text-[#908fa0] uppercase tracking-wider mb-2">
            Or Paste Raw RFC822 Headers / Mail Text:
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            placeholder="Received: from mail.attacker.com (1.2.3.4)...&#10;From: spoofy@domain.com&#10;Subject: Urgent..."
            className="w-full bg-[#070C16] border border-[#1D293B] rounded-lg p-3 font-mono text-xs text-[#d7e3fb] focus:outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#142032] hover:bg-[#1e2a3d] text-[#c7c4d7] rounded-md text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={analyzing || !rawText.trim()}
            className="px-5 py-2 bg-[#6366F1] hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                <span>Extracting Telemetry...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">
                  analytics
                </span>
                <span>Run Forensic Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
