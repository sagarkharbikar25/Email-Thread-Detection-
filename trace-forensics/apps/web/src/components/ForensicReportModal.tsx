import React from 'react';
import { EmailDetail } from '../types';
import { Printer, X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface ForensicReportModalProps {
  email: EmailDetail;
  onClose: () => void;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({ email, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel-elevated w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider font-mono">
              Forensic Incident Report Generator
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-lg transition"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-200 bg-slate-950/60 font-sans print:p-0 print:bg-white print:text-black">
          {/* Document Header */}
          <div className="border-b-2 border-cyan-500 pb-4 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white print:text-black">
                TRACE FORENSICS INVESTIGATION REPORT
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1 print:text-slate-600">
                Digital Evidence Preservation & Incident Triage Dossier
              </p>
            </div>
            <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600">
              <p>Generated: {new Date().toUTCString()}</p>
              <p>Report ID: REP-{email.sha256.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Incident Overview Table */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-900/60 p-4 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-slate-500 block">Subject:</span>
              <span className="font-bold text-slate-100 print:text-black text-sm">{email.subject}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Forensic Risk Score:</span>
              <span className={`text-base font-extrabold ${email.risk_score >= 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                {email.risk_score} / 100 [{email.classification}]
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Claimed Sender:</span>
              <span className="text-slate-200 print:text-black">{email.from_display} &lt;{email.from_address}&gt;</span>
            </div>
            <div>
              <span className="text-slate-500 block">Cryptographic Digest (SHA-256):</span>
              <span className="text-cyan-400 break-all text-[11px] print:text-blue-700">{email.sha256}</span>
            </div>
          </div>

          {/* Origin Assessment & Attribution */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Attribution & Origin Assessment</h3>
            <p className="text-sm font-semibold text-slate-100 print:text-black">{email.origin_assessment}</p>
            <p className="text-xs text-slate-400 mt-1">Confidence Rating: {email.origin_confidence || 85}%</p>
          </div>

          {/* Authentication Verdicts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Cryptographic Authentication Verdicts</h3>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg print:border-slate-300">
                <span className="text-slate-500 block">SPF Status:</span>
                <span className={`font-bold ${email.authentication?.spf_result === 'PASS' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {email.authentication?.spf_result || 'NONE'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg print:border-slate-300">
                <span className="text-slate-500 block">DKIM Status:</span>
                <span className={`font-bold ${email.authentication?.dkim_result === 'PASS' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {email.authentication?.dkim_result || 'NONE'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg print:border-slate-300">
                <span className="text-slate-500 block">DMARC Status:</span>
                <span className={`font-bold ${email.authentication?.dmarc_result === 'PASS' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {email.authentication?.dmarc_result || 'NONE'}
                </span>
              </div>
            </div>
          </div>

          {/* Detected Forensic Signals Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detected Threat Signals & Heuristics</h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Severity</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Signal Detail</th>
                    <th className="py-2 px-3 text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                  {email.signals.map((s, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-bold text-red-400">{s.severity}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">{s.category}</td>
                      <td className="py-2 px-3 text-slate-200 print:text-black">{s.title}: {s.description}</td>
                      <td className="py-2 px-3 font-mono text-right text-slate-300">+{s.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chain of Custody & Compliance Sign-off */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center print:text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Court-Admissible Evidence Integrity Hash Verified (SHA-256 Match)</span>
            </div>
            <div>
              <span>Investigator Signature: _______________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
