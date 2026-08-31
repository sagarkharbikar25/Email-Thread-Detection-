"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { ThreatSignal } from "../../types/forensics";

interface ThreatSignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signals: ThreatSignal[];
}

export function ThreatSignalsModal({
  isOpen,
  onClose,
  signals,
}: ThreatSignalsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="All Forensic Threat Signals"
      subtitle="Complete heuristic and machine learning signal telemetry breakdown"
      maxWidth="3xl"
    >
      <div className="space-y-3">
        {signals.map((signal) => {
          const isCritical = signal.percentage >= 80;
          const isHigh = signal.percentage >= 65 && signal.percentage < 80;

          const barColor = isCritical
            ? "bg-red-500"
            : isHigh
            ? "bg-orange-500"
            : "bg-amber-500";

          const textColor = isCritical
            ? "text-red-400"
            : isHigh
            ? "text-orange-400"
            : "text-amber-400";

          return (
            <div
              key={signal.id}
              className="p-3.5 bg-[#09111F] rounded-lg border border-[#1D293B] hover:border-[#464554] transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-[#d7e3fb]">
                  {signal.label}
                </span>
                <span className={`font-mono font-bold text-sm ${textColor}`}>
                  {signal.percentage}% Confidence
                </span>
              </div>
              <div className="h-2 w-full bg-[#142032] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${barColor} rounded-full`}
                  style={{ width: `${signal.percentage}%` }}
                />
              </div>
              <p className="text-xs text-[#908fa0] leading-relaxed">
                {signal.description}
              </p>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
