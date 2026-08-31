"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MOCK_INVESTIGATIONS_LIST } from "../../constants/mockData";

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/cases");
        if (response.data && response.data.length > 0) {
          setCases(response.data);
        } else {
          // Map mock investigations to case format
          const mockCases = MOCK_INVESTIGATIONS_LIST.map(inv => ({
            id: inv.id,
            case_number: inv.id,
            title: inv.subject,
            severity: inv.riskScore > 80 ? "CRITICAL" : inv.riskScore > 60 ? "HIGH" : "MEDIUM",
            status: "OPEN",
            updated_at: new Date(inv.date).toISOString()
          }));
          setCases(mockCases);
        }
      } catch (err) {
        console.error("Failed to fetch cases, using mock fallback", err);
        const mockCases = MOCK_INVESTIGATIONS_LIST.map(inv => ({
          id: inv.id,
          case_number: inv.id,
          title: inv.subject,
          severity: inv.riskScore > 80 ? "CRITICAL" : inv.riskScore > 60 ? "HIGH" : "MEDIUM",
          status: "OPEN",
          updated_at: new Date(inv.date).toISOString()
        }));
        setCases(mockCases);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#070C16] p-6 text-[#d7e3fb]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Campaign Management</p>
          <h1 className="mt-2 text-3xl font-bold">Investigation Cases</h1>
        </div>
        <button className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create New Case
        </button>
      </div>

      <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6 flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-[#908fa0]">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">folder_open</span>
            <p>No investigation cases found.</p>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar flex-1 -mx-6 px-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#1D293B] text-[#908fa0]">
                  <th className="pb-3 font-medium">Case Number</th>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Severity</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Last Updated</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-b border-[#1D293B]/50 hover:bg-[#1a2333] transition-colors group">
                    <td className="py-4 font-mono text-xs text-indigo-400">{c.case_number}</td>
                    <td className="py-4 font-medium">{c.title}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        c.severity === "CRITICAL" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                        c.severity === "HIGH" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                        "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {c.severity}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${c.status === "OPEN" ? "bg-emerald-400" : "bg-slate-500"}`}></div>
                        {c.status}
                      </div>
                    </td>
                    <td className="py-4 text-[#908fa0] text-xs">
                      {new Date(c.updated_at).toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-indigo-500/10 transition-colors">
                        View Graph
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
