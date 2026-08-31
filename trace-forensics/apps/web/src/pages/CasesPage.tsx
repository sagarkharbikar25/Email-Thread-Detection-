import React, { useState } from 'react';
import { CaseItem, EmailDetail } from '../types';
import { api } from '../services/api';
import { ThreatBadge } from '../components/ThreatBadge';
import { Briefcase, Plus, Search, CheckCircle2, Clock, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface CasesPageProps {
  cases: CaseItem[];
  emails: EmailDetail[];
  onSelectEmail: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const CasesPage: React.FC<CasesPageProps> = ({ cases, emails, onSelectEmail, onNavigate }) => {
  const [caseList, setCaseList] = useState<CaseItem[]>(cases);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('HIGH');

  const handleCreateCase = async () => {
    if (!newTitle) return;
    const created = await api.createCase({
      title: newTitle,
      description: newDesc,
      severity: newSeverity
    });
    setCaseList([created, ...caseList]);
    setShowNewModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            Forensic Incident Cases
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, triage, and collaborate on multi-source email phishing campaigns and BEC investigations.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> Create New Case
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {caseList.map((c) => (
          <div key={c.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-0.5 rounded">
                    {c.case_number}
                  </span>
                  <ThreatBadge level={c.severity} />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    Status: {c.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{c.title}</h3>
                <p className="text-xs text-slate-400 max-w-3xl">{c.description}</p>
              </div>

              <div className="text-right text-xs text-slate-500 font-mono">
                <p>Created: {new Date(c.created_at).toLocaleDateString()}</p>
                <p className="text-slate-400">Assigned: {c.assigned_to || 'SOC Analyst'}</p>
              </div>
            </div>

            {/* Linked Emails in Case */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                Attached Digital Evidence ({emails.length} Threat Artifacts)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {emails.slice(0, 2).map((eml) => (
                  <div
                    key={eml.id}
                    onClick={() => { onSelectEmail(eml.id); onNavigate('analysis'); }}
                    className="p-3 bg-slate-900/80 hover:bg-slate-800/80 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-200 truncate">{eml.subject}</p>
                      <p className="text-[11px] text-slate-500 font-mono">SHA-256: {eml.sha256.slice(0, 12)}...</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-elevated w-full max-w-md p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">Create Investigation Case</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Case Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operation PhishGuard: Executive BEC Spoof"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Investigation Scope / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe targeted hosts, suspect IP ranges, and incident timeline..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg"
              >
                Save & Open Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
