import React, { useState, useEffect } from 'react';
import { api, DEMO_EMAILS, DEMO_CASES, DEMO_EVIDENCE } from './services/api';
import { EmailDetail, CaseItem, EvidenceItem } from './types';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { CasesPage } from './pages/CasesPage';
import { EvidencePage } from './pages/EvidencePage';

export function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [emails, setEmails] = useState<EmailDetail[]>(DEMO_EMAILS);
  const [cases, setCases] = useState<CaseItem[]>(DEMO_CASES);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(DEMO_EVIDENCE);
  const [selectedEmailId, setSelectedEmailId] = useState<string>(DEMO_EMAILS[0].id);

  // Load data on mount from live FastAPI or fallback
  useEffect(() => {
    async function loadData() {
      const liveEmails = await api.getEmails();
      if (liveEmails.length > 0) {
        setEmails(liveEmails);
        setSelectedEmailId(liveEmails[0].id);
      }
      const liveCases = await api.getCases();
      if (liveCases.length > 0) setCases(liveCases);

      const liveEvidence = await api.getEvidence();
      if (liveEvidence.length > 0) setEvidence(liveEvidence);
    }
    loadData();
  }, []);

  const activeEmail = emails.find(e => e.id === selectedEmailId) || emails[0];

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
  };

  const handleUploadSuccess = async (emailId: string) => {
    const updatedEmails = await api.getEmails();
    setEmails(updatedEmails);
    setSelectedEmailId(emailId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSelectEmail={handleSelectEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && (
          <DashboardPage
            emails={emails}
            cases={cases}
            onSelectEmail={handleSelectEmail}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'upload' && (
          <UploadPage
            onUploadSuccess={handleUploadSuccess}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'analysis' && (
          <AnalysisPage
            email={activeEmail}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'cases' && (
          <CasesPage
            cases={cases}
            emails={emails}
            onSelectEmail={handleSelectEmail}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'evidence' && (
          <EvidencePage
            evidenceList={evidence}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500 font-mono">
        <p>TRACE Forensics Platform • SIH 2026 Problem Statement PS 26106 • Built for SOC & Cyber Investigation Teams</p>
      </footer>
    </div>
  );
}

export default App;
