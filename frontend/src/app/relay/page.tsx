"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from 'next/dynamic';
import { MOCK_INVESTIGATIONS_LIST, MOCK_INVESTIGATION } from "../../constants/mockData";

const MapWrapper = dynamic(() => import("../../components/common/MapWrapper"), { ssr: false });

export default function RelayTracePage() {
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
          <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Network Infrastructure</p>
          <h1 className="mt-2 text-3xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-indigo-500">route</span>
            SMTP Relay Trace & GeoLocation
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

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-6 pb-10">
        {!emailDetails || isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
            <p className="font-mono text-sm text-indigo-300">Tracing SMTP Routing Infrastructure...</p>
          </div>
        ) : (
          <>
            {/* Left: Detailed Timeline */}
            <div className="flex-1 rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6 flex flex-col">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-[#1D293B] pb-4">
                <span className="material-symbols-outlined text-indigo-400">timeline</span>
                Relay Hop Timeline
              </h2>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {emailDetails.hops && emailDetails.hops.length > 0 ? (
                  emailDetails.hops.map((hop: any, idx: number) => (
                    <div key={idx} className="relative flex gap-4">
                      {/* Timeline Line */}
                      {idx !== emailDetails.hops.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-[#1D293B]"></div>
                      )}
                      
                      {/* Node Circle */}
                      <div className="z-10 mt-1 flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          hop.hop_type === 'origin' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                          hop.hop_type === 'final' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' :
                          'bg-indigo-500/20 text-indigo-400 border border-indigo-500'
                        }`}>
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-[#1a2333] border border-[#2d3a50] p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white break-all pr-4">{hop.by_host || 'Unknown Host'}</h3>
                          <span className="text-xs text-slate-400 whitespace-nowrap font-mono">{new Date(hop.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-xs font-mono">
                          <div>
                            <span className="text-slate-500 block mb-0.5">IP Address</span>
                            <span className="text-indigo-300">{hop.ip_address || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-0.5">Protocol</span>
                            <span className="text-slate-300">{hop.with_protocol || 'SMTP'}</span>
                          </div>
                          <div className="col-span-2 mt-1">
                            <span className="text-slate-500 block mb-0.5">Received From</span>
                            <span className="text-slate-400 break-all">{hop.from_host || 'N/A'}</span>
                          </div>
                          {hop.geo_data && hop.geo_data.country && (
                            <div className="col-span-2 mt-1 flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit border border-emerald-500/20">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {hop.geo_data.city ? `${hop.geo_data.city}, ` : ''}{hop.geo_data.country}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No SMTP hops found in headers.</p>
                )}
              </div>
            </div>

            {/* Right: GeoMap Visualization */}
            <div className="flex-1 rounded-2xl border border-[#1D293B] bg-[#0D1726] overflow-hidden relative min-h-[400px]">
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-xs text-[#908fa0] font-semibold tracking-wider bg-[#070C16]/85 px-3 py-2 rounded-md backdrop-blur-md border border-[#1D293B]">
                <span className="material-symbols-outlined text-indigo-400">public</span>
                GLOBAL GEOLOCATION ROUTE
              </div>

              {/* Real Interactive Leaflet Map */}
              <div className="absolute inset-0 z-0">
                <MapWrapper hops={emailDetails.hops || []} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
