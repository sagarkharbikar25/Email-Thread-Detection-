"use client";

import React, { useState } from "react";

export default function SettingsPage() {
  const [piiSettings, setPiiSettings] = useState({
    maskSSN: true,
    maskCreditCards: true,
    maskPasswords: true,
    maskPhoneNumbers: false,
    maskAddresses: false,
  });

  const [retentionDays, setRetentionDays] = useState(90);

  const toggleSetting = (key: keyof typeof piiSettings) => {
    setPiiSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#070C16] p-6 text-[#d7e3fb] overflow-hidden">
      <div className="mb-6 shrink-0">
        <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Compliance & Administration</p>
        <h1 className="mt-2 text-3xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-indigo-500">admin_panel_settings</span>
          Privacy Controls
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center pb-10">
        <div className="max-w-4xl w-full flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: PII Masking */}
          <div className="flex-1 rounded-2xl border border-[#1D293B] bg-[#0D1726] p-8">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400">security</span>
              PII Masking Engine
            </h2>
            <p className="text-sm text-[#908fa0] mb-8 pb-4 border-b border-[#1D293B]">
              Configure which Personally Identifiable Information (PII) is automatically redacted from raw emails 
              during ingest to comply with GDPR and CCPA.
            </p>

            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-4 bg-[#1a2333] border border-[#2d3a50] rounded-lg">
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">Social Security Numbers (SSN)</h3>
                  <p className="text-xs text-slate-400">Masks 9-digit SSNs (e.g., ***-**-1234)</p>
                </div>
                <button 
                  onClick={() => toggleSetting('maskSSN')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${piiSettings.maskSSN ? 'bg-indigo-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${piiSettings.maskSSN ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a2333] border border-[#2d3a50] rounded-lg">
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">Credit Card Numbers</h3>
                  <p className="text-xs text-slate-400">Masks 16-digit PANs (e.g., **** **** **** 4242)</p>
                </div>
                <button 
                  onClick={() => toggleSetting('maskCreditCards')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${piiSettings.maskCreditCards ? 'bg-indigo-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${piiSettings.maskCreditCards ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a2333] border border-[#2d3a50] rounded-lg">
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">Cleartext Passwords</h3>
                  <p className="text-xs text-slate-400">Detects and redacts leaked passwords in payload.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('maskPasswords')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${piiSettings.maskPasswords ? 'bg-indigo-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${piiSettings.maskPasswords ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a2333] border border-[#2d3a50] rounded-lg">
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">Phone Numbers</h3>
                  <p className="text-xs text-slate-400">Masks international phone numbers in text.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('maskPhoneNumbers')}
                  className={`w-12 h-6 rounded-full relative transition-colors ${piiSettings.maskPhoneNumbers ? 'bg-indigo-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${piiSettings.maskPhoneNumbers ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Data Retention & Audit */}
          <div className="w-full lg:w-[400px] flex flex-col gap-6">
            
            <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400">inventory_2</span>
                Data Retention
              </h2>
              <p className="text-xs text-[#908fa0] mb-6">Set the automatic purge cycle for stored .eml artifacts.</p>

              <div className="bg-[#1a2333] border border-[#2d3a50] p-4 rounded-lg flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Keep evidence for:</span>
                  <span className="text-indigo-400">{retentionDays} Days</span>
                </div>
                <input 
                  type="range" 
                  min="30" max="365" step="30"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>30</span>
                  <span>180</span>
                  <span>365</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-[#0D1726] p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined text-red-400">delete_forever</span>
                Danger Zone
              </h2>
              <p className="text-xs text-[#908fa0] mb-6">These actions are permanent and heavily audited.</p>
              
              <button className="w-full py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                Purge All Evidence Now
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
