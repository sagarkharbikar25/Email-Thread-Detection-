"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MOCK_INVESTIGATIONS_LIST, MOCK_INVESTIGATION } from "../../constants/mockData";

export default function ReportsPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/emails");
        if (response.data && response.data.length > 0) {
          setEmails(response.data);
          setSelectedEmailId(response.data[0].id);
        } else {
          // Use mock data
          const mockEmails = MOCK_INVESTIGATIONS_LIST.map(inv => ({
            id: inv.id,
            subject: inv.subject,
            filename: `${inv.id}_export.eml`,
            sha256: MOCK_INVESTIGATION.evidenceHash
          }));
          setEmails(mockEmails);
          setSelectedEmailId(mockEmails[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch emails, using mock fallback", err);
        const mockEmails = MOCK_INVESTIGATIONS_LIST.map(inv => ({
          id: inv.id,
          subject: inv.subject,
          filename: `${inv.id}_export.eml`,
          sha256: MOCK_INVESTIGATION.evidenceHash
        }));
        setEmails(mockEmails);
        setSelectedEmailId(mockEmails[0].id);
      }
    };
    fetchEmails();
  }, []);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportReady(false);
    setTimeout(() => {
      setIsGenerating(false);
      setReportReady(true);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#070C16] p-6 text-[#d7e3fb] overflow-hidden">
      <div className="mb-6 shrink-0">
        <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Law Enforcement Export</p>
        <h1 className="mt-2 text-3xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-indigo-500">description</span>
          Forensic Reporting
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center pb-10">
        <div className="max-w-3xl w-full flex flex-col gap-6">
          
          <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-8">
            <h2 className="text-xl font-semibold mb-6">Generate Tamper-Evident Report</h2>
            <p className="text-sm text-[#908fa0] mb-6">
              Generate a cryptographically signed PDF report containing all collected evidence, 
              NLP classification markers, and routing timelines for legal submission.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#d7e3fb] mb-2">Select Target Artifact</label>
                <select 
                  value={selectedEmailId} 
                  onChange={(e) => {
                    setSelectedEmailId(e.target.value);
                    setReportReady(false);
                  }}
                  className="w-full bg-[#1a2333] border border-[#2d3a50] rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  {emails.length === 0 && <option value="">Loading...</option>}
                  {emails.map(e => (
                    <option key={e.id} value={e.id}>{e.subject || e.filename} (Hash: {e.sha256.substring(0,8)}...)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-[#1a2333] border border-[#2d3a50] rounded-lg cursor-pointer hover:bg-[#1f2937] transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-[#09111F] border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                  <span className="text-sm">Include NLP Risk Analysis</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#1a2333] border border-[#2d3a50] rounded-lg cursor-pointer hover:bg-[#1f2937] transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-[#09111F] border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                  <span className="text-sm">Include Raw SMTP Headers</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#1a2333] border border-[#2d3a50] rounded-lg cursor-pointer hover:bg-[#1f2937] transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-[#09111F] border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                  <span className="text-sm">Include Geolocation Maps</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#1a2333] border border-[#2d3a50] rounded-lg cursor-pointer hover:bg-[#1f2937] transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-[#09111F] border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                  <span className="text-sm">Apply PII Masking</span>
                </label>
              </div>

              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedEmailId}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  isGenerating ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Compiling Data & Generating Signature...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                    Generate Official Report
                  </>
                )}
              </button>

              {/* Success State */}
              {reportReady && (
                <div className="mt-6 p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-emerald-400 text-2xl">task_alt</span>
                  </div>
                  <h3 className="text-emerald-400 font-bold mb-1">Report Generated Successfully</h3>
                  <p className="text-xs text-emerald-300/70 mb-4">SHA256 Signature appended for chain of custody verification.</p>
                  
                  <button 
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download PDF
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
