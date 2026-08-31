"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MOCK_INVESTIGATIONS_LIST, MOCK_INVESTIGATION } from "../../constants/mockData";

export default function AuthenticationPage() {
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
          <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Protocol Analysis</p>
          <h1 className="mt-2 text-3xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-indigo-500">verified_user</span>
            Authentication & Headers
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
            <p className="font-mono text-sm text-indigo-300">Analyzing Cryptographic Signatures...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* SPF CARD */}
              <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 border-b border-[#1D293B] pb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">dns</span>
                    SPF
                  </h2>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    emailDetails.authentication?.spf_result === 'pass' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    emailDetails.authentication?.spf_result === 'fail' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    emailDetails.authentication?.spf_result === 'softfail' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {(emailDetails.authentication?.spf_result || 'UNKNOWN').toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 space-y-4 text-sm">
                  <div>
                    <span className="block text-xs text-[#908fa0] mb-1">Authenticated Domain</span>
                    <span className="font-mono text-indigo-300 break-all">{emailDetails.authentication?.spf_domain || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#908fa0] mb-1">Header Alignment</span>
                    <div className="flex items-center gap-2">
                      {emailDetails.authentication?.spf_alignment ? (
                        <><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span> Aligned</>
                      ) : (
                        <><span className="material-symbols-outlined text-red-400 text-sm">cancel</span> Misaligned</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* DKIM CARD */}
              <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 border-b border-[#1D293B] pb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">key</span>
                    DKIM
                  </h2>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    emailDetails.authentication?.dkim_result === 'pass' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    emailDetails.authentication?.dkim_result === 'fail' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {(emailDetails.authentication?.dkim_result || 'UNKNOWN').toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 space-y-4 text-sm">
                  <div>
                    <span className="block text-xs text-[#908fa0] mb-1">Signing Domain (d=)</span>
                    <span className="font-mono text-indigo-300 break-all">{emailDetails.authentication?.dkim_domain || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#908fa0] mb-1">Selector (s=)</span>
                    <span className="font-mono text-slate-300 break-all">{emailDetails.authentication?.dkim_selector || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#908fa0] mb-1">Header Alignment</span>
                    <div className="flex items-center gap-2">
                      {emailDetails.authentication?.dkim_alignment ? (
                        <><span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span> Aligned</>
                      ) : (
                        <><span className="material-symbols-outlined text-red-400 text-sm">cancel</span> Misaligned</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* DMARC CARD */}
              <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 border-b border-[#1D293B] pb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">gpp_maybe</span>
                    DMARC
                  </h2>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    emailDetails.authentication?.dmarc_result === 'pass' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    emailDetails.authentication?.dmarc_result === 'fail' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {(emailDetails.authentication?.dmarc_result || 'UNKNOWN').toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 space-y-4 text-sm">
                  <div>
                    <span className="block text-xs text-[#908fa0] mb-1">Published Policy (p=)</span>
                    <span className="font-mono text-slate-300 font-bold uppercase">{emailDetails.authentication?.dmarc_policy || 'NONE'}</span>
                  </div>
                  <div className="bg-[#1a2333] p-3 rounded border border-[#2d3a50]">
                    <span className="block text-xs text-[#908fa0] mb-2">Policy Enforcement Outcome</span>
                    {emailDetails.authentication?.dmarc_result === 'fail' && emailDetails.authentication?.dmarc_policy === 'reject' ? (
                      <p className="text-red-400 text-xs">Email should be <strong>rejected</strong> by the receiving MTA due to DMARC failure.</p>
                    ) : emailDetails.authentication?.dmarc_result === 'fail' && emailDetails.authentication?.dmarc_policy === 'quarantine' ? (
                      <p className="text-orange-400 text-xs">Email should be sent to <strong>spam/quarantine</strong>.</p>
                    ) : emailDetails.authentication?.dmarc_result === 'fail' ? (
                      <p className="text-yellow-400 text-xs">DMARC failed, but policy is p=none. Email was delivered.</p>
                    ) : (
                      <p className="text-emerald-400 text-xs">Authentication passed successfully.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RAW HEADERS / JSON DUMP (Placeholder) */}
            <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6 mt-2">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">data_object</span>
                    Authentication Details JSON
                 </h2>
              </div>
              <div className="bg-black p-4 rounded-lg overflow-x-auto border border-[#1D293B]">
                <pre className="text-xs font-mono text-slate-400">
                  {JSON.stringify(emailDetails.authentication, null, 2)}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
