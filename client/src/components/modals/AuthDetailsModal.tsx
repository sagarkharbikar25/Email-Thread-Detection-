"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { AuthenticationResult } from "../../types/forensics";

interface AuthDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  authType: "spf" | "dkim" | "dmarc" | null;
  authResults: AuthenticationResult;
}

export function AuthDetailsModal({
  isOpen,
  onClose,
  authType,
  authResults,
}: AuthDetailsModalProps) {
  if (!authType) return null;

  const config = {
    spf: {
      title: "SPF (Sender Policy Framework) Diagnostic",
      rfc: "RFC 7208",
      data: authResults.spf,
      dnsLookup: "v=spf1 include:_spf.google.com ~all",
      observedSender: "203.0.113.5 (sg-mail-out.paypa1.com)",
      envelopeFrom: "accounts@paypa1-security.com",
    },
    dkim: {
      title: "DKIM (DomainKeys Identified Mail) Cryptographic Verification",
      rfc: "RFC 6376",
      data: authResults.dkim,
      dnsLookup: "default._domainkey.paypa1-security.com",
      observedSender: "rsa-sha256 signature algorithm",
      envelopeFrom: "d=paypa1-security.com; s=default",
    },
    dmarc: {
      title: "DMARC Policy & Alignment Analysis",
      rfc: "RFC 7489",
      data: authResults.dmarc,
      dnsLookup: "_dmarc.paypa1-security.com -> v=DMARC1; p=quarantine; pct=100",
      observedSender: "Strict Header From alignment required",
      envelopeFrom: "From: accounts@paypa1-security.com",
    },
  }[authType];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      subtitle={`Protocol Standard: ${config.rfc}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <span className="material-symbols-outlined text-red-400 text-2xl mt-0.5">
            cancel
          </span>
          <div>
            <h4 className="text-sm font-bold text-red-400 uppercase tracking-wide">
              {config.data.status} - {config.data.reason}
            </h4>
            <p className="text-xs text-[#d7e3fb] mt-1 leading-relaxed">
              {config.data.details}
            </p>
          </div>
        </div>

        {/* Diagnostic Metadata Table */}
        <div className="bg-[#09111F] rounded-lg border border-[#1D293B] p-4 space-y-3 text-xs">
          <div className="grid grid-cols-[140px_1fr] gap-2">
            <span className="text-[#908fa0] font-medium">DNS Record Queried:</span>
            <span className="font-mono text-[11px] text-[#c0c1ff] truncate">
              {config.dnsLookup}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-2">
            <span className="text-[#908fa0] font-medium">Observed Parameters:</span>
            <span className="font-mono text-[11px] text-[#d7e3fb]">
              {config.observedSender}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-2">
            <span className="text-[#908fa0] font-medium">Header Envelope:</span>
            <span className="font-mono text-[11px] text-[#d7e3fb]">
              {config.envelopeFrom}
            </span>
          </div>
        </div>

        {/* Remediation Note */}
        <div className="bg-[#142032] p-3 rounded-lg border border-[#1D293B] text-xs text-[#c7c4d7]">
          <span className="text-amber-400 font-bold">SOC Analyst Recommendation:</span>{" "}
          Block domain sender at email gateway and quarantine any existing delivered messages.
        </div>
      </div>
    </Modal>
  );
}
