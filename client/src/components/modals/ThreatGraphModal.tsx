"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";

interface ThreatGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThreatGraphModal({ isOpen, onClose }: ThreatGraphModalProps) {
  const [activeEntity, setActiveEntity] = useState<string | null>("Email: TRC-1024");

  const entityDetails: Record<
    string,
    { title: string; type: string; risk: string; details: string[] }
  > = {
    "Email: TRC-1024": {
      title: "Root Email Artifact #TRC-1024",
      type: "MIME Envelope",
      risk: "CRITICAL (91/100)",
      details: [
        "From: accounts@paypa1-security.com",
        "To: user@gov.in",
        "Subject: Urgent: Verify Your Account Information",
        "Attachments: 1 malicious PDF payload (invoice.pdf.exe)",
      ],
    },
    "Domain: paypa1-security.com": {
      title: "paypa1-security.com",
      type: "Spoofed Domain / Typosquat",
      risk: "HIGH (88/100)",
      details: [
        "Age: 12 days old (Created May 12, 2025)",
        "Registrar: NameCheap, Inc. (Privacy Protected)",
        "DNS Name Servers: ns1.cloudns.net, ns2.cloudns.net",
        "Status: Active lookalike domain impersonating paypal.com",
      ],
    },
    "IP: 103.21.244.18": {
      title: "103.21.244.18 (Mumbai Relay)",
      type: "Intermediate Mail Gateway",
      risk: "MEDIUM (64/100)",
      details: [
        "ISP: Cloudflare / Local AS13335",
        "Location: Mumbai, Maharashtra, India",
        "Open Ports: 25 (SMTP), 80 (HTTP), 443 (HTTPS)",
        "Reputation: Flagged in 2 threat feeds for SMTP tunneling",
      ],
    },
    "URL: login-secure.com": {
      title: "login-secure.com/auth/verify",
      type: "Credential Harvester URL",
      risk: "CRITICAL (95/100)",
      details: [
        "Target: Phishing portal imitating PayPal login prompt",
        "SSL Issuer: Let's Encrypt Free DV Certificate",
        "Payload: JavaScript keylogger & OTP interceptor",
      ],
    },
  };

  const currentInfo = activeEntity ? entityDetails[activeEntity] : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interactive Threat Infrastructure Graph"
      subtitle="Entity-Relationship Graph Mapping Forensic Artifacts & Attacker Infrastructure"
      maxWidth="4xl"
    >
      <div className="grid grid-cols-12 gap-4">
        {/* Left Interactive Canvas */}
        <div className="col-span-8 bg-[#070C16] border border-[#1D293B] rounded-lg p-6 min-h-[360px] relative flex items-center justify-center overflow-hidden">
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#6366F1 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* SVG Vectors */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
          >
            <line
              x1="50%"
              y1="20%"
              x2="25%"
              y2="50%"
              stroke="#ef4444"
              strokeWidth="2"
            />
            <line
              x1="50%"
              y1="20%"
              x2="50%"
              y2="50%"
              stroke="#6366F1"
              strokeWidth="2"
            />
            <line
              x1="50%"
              y1="20%"
              x2="75%"
              y2="50%"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <line
              x1="25%"
              y1="50%"
              x2="25%"
              y2="80%"
              stroke="#464554"
              strokeDasharray="4 4"
              strokeWidth="2"
            />
            <line
              x1="50%"
              y1="50%"
              x2="50%"
              y2="80%"
              stroke="#464554"
              strokeDasharray="4 4"
              strokeWidth="2"
            />
            <line
              x1="75%"
              y1="50%"
              x2="75%"
              y2="80%"
              stroke="#464554"
              strokeDasharray="4 4"
              strokeWidth="2"
            />
          </svg>

          {/* Nodes */}
          {/* Email Root */}
          <button
            onClick={() => setActiveEntity("Email: TRC-1024")}
            className={`absolute top-[10%] left-[50%] -translate-x-1/2 flex flex-col items-center p-2 rounded-xl transition-all ${
              activeEntity === "Email: TRC-1024"
                ? "ring-2 ring-red-500 bg-red-500/10 scale-105"
                : "hover:scale-105"
            }`}
          >
            <div className="w-12 h-12 rounded-full border-2 border-red-500 bg-[#142032] flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <span className="material-symbols-outlined text-2xl">mail</span>
            </div>
            <span className="text-xs font-bold text-[#d7e3fb] mt-1">TRC-1024</span>
          </button>

          {/* Domain Node */}
          <button
            onClick={() => setActiveEntity("Domain: paypa1-security.com")}
            className={`absolute top-[42%] left-[25%] -translate-x-1/2 flex flex-col items-center p-2 rounded-xl transition-all ${
              activeEntity === "Domain: paypa1-security.com"
                ? "ring-2 ring-emerald-500 bg-emerald-500/10 scale-105"
                : "hover:scale-105"
            }`}
          >
            <div className="w-11 h-11 rounded-full border-2 border-emerald-500 bg-[#142032] flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-xl">language</span>
            </div>
            <span className="text-[11px] font-bold text-[#d7e3fb] mt-1">Domain</span>
          </button>

          {/* IP Node */}
          <button
            onClick={() => setActiveEntity("IP: 103.21.244.18")}
            className={`absolute top-[42%] left-[50%] -translate-x-1/2 flex flex-col items-center p-2 rounded-xl transition-all ${
              activeEntity === "IP: 103.21.244.18"
                ? "ring-2 ring-indigo-500 bg-indigo-500/10 scale-105"
                : "hover:scale-105"
            }`}
          >
            <div className="w-11 h-11 rounded-full border-2 border-indigo-500 bg-[#142032] flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-xl">dns</span>
            </div>
            <span className="text-[11px] font-bold text-[#d7e3fb] mt-1">Relay IP</span>
          </button>

          {/* URL Node */}
          <button
            onClick={() => setActiveEntity("URL: login-secure.com")}
            className={`absolute top-[42%] left-[75%] -translate-x-1/2 flex flex-col items-center p-2 rounded-xl transition-all ${
              activeEntity === "URL: login-secure.com"
                ? "ring-2 ring-amber-500 bg-amber-500/10 scale-105"
                : "hover:scale-105"
            }`}
          >
            <div className="w-11 h-11 rounded-full border-2 border-amber-500 bg-[#142032] flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-xl">link</span>
            </div>
            <span className="text-[11px] font-bold text-[#d7e3fb] mt-1">Target URL</span>
          </button>
        </div>

        {/* Right Entity Inspector Panel */}
        <div className="col-span-4 bg-[#09111F] border border-[#1D293B] rounded-lg p-4 flex flex-col justify-between text-xs">
          {currentInfo ? (
            <div>
              <div className="pb-3 border-b border-[#1D293B] mb-3">
                <span className="text-[10px] uppercase font-mono text-[#908fa0]">
                  {currentInfo.type}
                </span>
                <h4 className="text-sm font-bold text-[#d7e3fb] mt-0.5">
                  {currentInfo.title}
                </h4>
                <span className="inline-block mt-1 font-mono font-bold text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                  {currentInfo.risk}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#908fa0]">
                  Forensic Attributes:
                </span>
                <ul className="space-y-1.5 text-[#c7c4d7]">
                  {currentInfo.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-mono text-[10px]">
                      <span className="text-indigo-400">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#908fa0] my-auto">
              Click any node in the graph to inspect forensic attributes.
            </div>
          )}

          <div className="pt-3 border-t border-[#1D293B] mt-4">
            <button
              onClick={() => alert("Artifact exported to IOC feed.")}
              className="w-full py-1.5 bg-[#142032] hover:bg-[#1e2a3d] border border-[#1D293B] text-[#d7e3fb] rounded text-xs font-semibold transition-colors"
            >
              Export Node IOC
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
