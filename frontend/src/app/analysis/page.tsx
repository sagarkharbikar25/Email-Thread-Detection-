"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MOCK_INVESTIGATIONS_LIST, MOCK_INVESTIGATION } from "../../constants/mockData";

export default function AnalysisPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [emailDetails, setEmailDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/emails");
        if (response.data && response.data.length > 0) {
          setEmails(response.data);
          setSelectedEmailId(response.data[0].id);
        } else {
          setEmails(MOCK_INVESTIGATIONS_LIST);
          setSelectedEmailId(MOCK_INVESTIGATIONS_LIST[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch emails, using mock fallback", err);
        setEmails(MOCK_INVESTIGATIONS_LIST);
        setSelectedEmailId(MOCK_INVESTIGATIONS_LIST[0].id);
      }
    };
    fetchEmails();
  }, []);

  useEffect(() => {
    if (!selectedEmailId) return;
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/emails/${selectedEmailId}`);
        setEmailDetails(response.data);
      } catch (err) {
        console.error("Failed to fetch details, using mock fallback", err);
        setEmailDetails(MOCK_INVESTIGATION);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedEmailId]);

  return (
    <div className="flex flex-col h-full bg-[#070C16] p-6 text-[#d7e3fb] overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Deep Forensic Analysis</p>
          <h1 className="mt-2 text-3xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-indigo-500">analytics</span>
            NLP & Payload Engine
          </h1>
        </div>
        
        <div className="flex items-center gap-3 bg-[#0D1726] border border-[#1D293B] rounded-lg p-2">
          <span className="text-sm font-medium pl-2">Target Artifact:</span>
          <select 
            value={selectedEmailId} 
            onChange={(e) => setSelectedEmailId(e.target.value)}
            className="bg-[#1a2333] border border-[#2d3a50] rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 max-w-[300px] truncate"
          >
            {emails.length === 0 && <option value="">Loading...</option>}
            {emails.map(e => (
              <option key={e.id} value={e.id}>{e.subject || e.filename}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pb-10">
        {!emailDetails || isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
            <p className="font-mono text-sm text-indigo-300">Processing Natural Language & Payloads...</p>
          </div>
        ) : (
          <>
            {/* NLP Signals Section */}
            <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-[#1D293B] pb-4">
                <span className="material-symbols-outlined text-indigo-400">psychology</span>
                Linguistic & Behavioral Cues
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailDetails.signals && emailDetails.signals.length > 0 ? (
                  emailDetails.signals.map((sig: any, idx: number) => (
                    <div key={idx} className="bg-[#1a2333] border border-[#2d3a50] p-4 rounded-lg flex items-start gap-3">
                      {sig.severity === 'CRITICAL' ? (
                        <span className="material-symbols-outlined text-red-500 mt-1">warning</span>
                      ) : sig.severity === 'HIGH' ? (
                        <span className="material-symbols-outlined text-orange-500 mt-1">error</span>
                      ) : (
                        <span className="material-symbols-outlined text-yellow-500 mt-1">info</span>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm text-white">{sig.name}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30 border border-slate-700 text-slate-300">
                            CONF: {Math.round(sig.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-[#908fa0] leading-relaxed">{sig.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic col-span-2">No suspicious linguistic patterns detected.</p>
                )}
              </div>
            </div>

            {/* Payloads Section (URLs & Attachments) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Malicious URLs */}
              <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-[#1D293B] pb-4">
                  <span className="material-symbols-outlined text-red-400">link</span>
                  Extracted URLs
                </h2>
                <div className="space-y-3">
                  {emailDetails.urls && emailDetails.urls.length > 0 ? (
                    emailDetails.urls.map((urlObj: any, idx: number) => (
                      <div key={idx} className="bg-[#09111F] p-3 rounded-md border border-red-500/20 break-all font-mono text-xs text-red-300 flex justify-between items-center gap-2">
                        <span>{urlObj.url || urlObj}</span>
                        {urlObj.suspicious && (
                          <span className="shrink-0 px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-bold border border-red-500/30 uppercase tracking-wider">
                            Suspicious
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No URLs found in this email.</p>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-[#1D293B] pb-4">
                  <span className="material-symbols-outlined text-orange-400">attachment</span>
                  Attachment Payloads
                </h2>
                <div className="space-y-3">
                  {emailDetails.attachments && emailDetails.attachments.length > 0 ? (
                    emailDetails.attachments.map((att: any, idx: number) => (
                      <div key={idx} className="bg-[#09111F] p-4 rounded-md border border-orange-500/20 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm text-white truncate pr-4">{att.filename}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{(att.size_bytes / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="text-xs font-mono text-slate-500">SHA256: {att.sha256}</div>
                        <div className="flex gap-2 mt-2">
                          {att.is_suspicious ? (
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] border border-red-500/30">MALICIOUS</span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/30">CLEAN</span>
                          )}
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">{att.mime_type}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No attachments found in this email.</p>
                  )}
                </div>
              </div>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
}
