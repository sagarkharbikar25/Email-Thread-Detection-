import React, { useState } from 'react';
import { EmailDetail } from '../types';
import { Search, Copy, Check, Terminal } from 'lucide-react';

interface HeaderInspectorProps {
  email: EmailDetail;
}

export const HeaderInspector: React.FC<HeaderInspectorProps> = ({ email }) => {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const headersList = [
    { key: 'Message-ID', value: email.raw_message_id || 'N/A' },
    { key: 'From', value: `${email.from_display ? `"${email.from_display}" ` : ''}<${email.from_address}>` },
    { key: 'To', value: email.to_addresses.join(', ') },
    { key: 'Subject', value: email.subject },
    { key: 'Date', value: email.date_header || email.created_at },
    { key: 'Reply-To', value: email.reply_to || 'None (Defaults to From)' },
    { key: 'Return-Path', value: email.return_path || 'None' },
    { key: 'SPF-Status', value: email.authentication?.spf_result || 'NONE' },
    { key: 'DKIM-Status', value: email.authentication?.dkim_result || 'NONE' },
    { key: 'DMARC-Status', value: email.authentication?.dmarc_result || 'NONE' },
    { key: 'SHA-256 Digest', value: email.sha256 }
  ];

  const filteredHeaders = headersList.filter(
    h => h.key.toLowerCase().includes(search.toLowerCase()) || h.value.toLowerCase().includes(search.toLowerCase())
  );

  const rawHeadersText = headersList.map(h => `${h.key}: ${h.value}`).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(rawHeadersText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            RFC 5322 Headers Decomposition
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search header fields..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs rounded-lg font-mono transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy All'}
          </button>
        </div>
      </div>

      <div className="border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-4 w-44">Header Field</th>
              <th className="py-2.5 px-4">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {filteredHeaders.map((h, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-4 text-cyan-400 font-semibold align-top">{h.key}</td>
                <td className="py-2.5 px-4 text-slate-300 break-all">{h.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
