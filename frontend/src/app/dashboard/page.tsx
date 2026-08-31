"use client";

import React, { useState } from "react";
import {
  Sidebar,
  Header,
  RiskScoreCard,
  ClassificationCard,
  ThreatLevelCard,
  AnalysisTimeCard,
  EvidenceHashCard,
  AuthenticationCard,
  RelayTraceCard,
  GeolocationMapCard,
  ThreatSignalsCard,
  ThreatGraphCard,
  EmailSummaryCard,
  RecentInvestigationsCard,
  QuickActionsCard,
  HeadersModal,
  AuthDetailsModal,
  IngestModal,
  ThreatSignalsModal,
  ThreatGraphModal,
} from "../../components";
import { PolarThreatRadar } from "../../components/dashboard/PolarThreatRadar";
import { GlobalThreatMap } from "../../components/dashboard/GlobalThreatMap";
import { MOCK_INVESTIGATION, MOCK_INVESTIGATIONS_LIST } from "../../constants/mockData";
import { RecentInvestigationItem } from "../../types/forensics";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentInvestigation, setCurrentInvestigation] = useState(MOCK_INVESTIGATION);
  const [investigationsList, setInvestigationsList] = useState(MOCK_INVESTIGATIONS_LIST);

  const [isHeadersModalOpen, setIsHeadersModalOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isThreatSignalsModalOpen, setIsThreatSignalsModalOpen] = useState(false);
  const [isThreatGraphModalOpen, setIsThreatGraphModalOpen] = useState(false);
  const [selectedAuthType, setSelectedAuthType] = useState<"spf" | "dkim" | "dmarc" | null>(null);

  const handleSelectInvestigation = (item: RecentInvestigationItem) => {
    setCurrentInvestigation((prev) => ({
      ...prev,
      id: item.id,
      caseNumber: item.id,
      subject: item.subject,
      from: item.from,
      riskScore: item.riskScore,
      riskCategory: item.riskScore >= 80 ? "critical" : item.riskScore >= 60 ? "high" : "medium",
      classification: item.classification,
      classificationName:
        item.classification === "BEC"
          ? "Business Email Compromise"
          : item.classification === "Phishing"
            ? "Credential Phishing Attack"
            : "Suspicious Activity",
      threatLevel: item.riskScore >= 80 ? "CRITICAL" : item.riskScore >= 60 ? "HIGH" : "MEDIUM",
      status: item.status,
    }));
  };

  const handleIngestNewEmail = (content: File | string) => {
    const newId = `TRC-${Math.floor(1025 + Math.random() * 900)}`;
    const newItem: RecentInvestigationItem = {
      id: newId,
      subject: typeof content === "string" ? "Ingested Artifact: User Submitted" : (content as File).name,
      from: "analyst-upload@gateway.local",
      riskScore: 84,
      classification: "BEC",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "Completed",
    };

    setInvestigationsList((prev) => [newItem, ...prev]);
    handleSelectInvestigation(newItem);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportEvidence = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentInvestigation, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentInvestigation.caseNumber}_forensic_evidence.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#070C16] text-[#d7e3fb] select-none">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenIngest={() => setIsIngestModalOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070C16]">
        <Header
          investigation={currentInvestigation}
          onExportReport={handleExportPDF}
          onExportEvidence={handleExportEvidence}
        />

        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#070C16]">
          <div className="grid grid-cols-12 gap-4 max-w-[1600px] mx-auto pb-6">
            <div className="col-span-12 lg:col-span-8">
              <PolarThreatRadar onSelectIncident={(subject) => console.log(subject)} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <GlobalThreatMap />
            </div>

            <RiskScoreCard
              score={currentInvestigation.riskScore}
              category={currentInvestigation.riskCategory}
            />

            <ClassificationCard
              classification={currentInvestigation.classification}
              fullName={currentInvestigation.classificationName}
              confidence={currentInvestigation.confidence}
            />

            <ThreatLevelCard
              level={currentInvestigation.threatLevel}
              description={currentInvestigation.threatDescription}
            />

            <AnalysisTimeCard
              duration={currentInvestigation.analysisTime}
              status="Completed"
              timestamp={currentInvestigation.analysisDate}
            />

            <EvidenceHashCard
              hash={currentInvestigation.evidenceHash}
              algorithm={currentInvestigation.hashAlgorithm}
            />

            <AuthenticationCard
              authResults={currentInvestigation.authResults}
              onViewDetails={(type) => setSelectedAuthType(type)}
            />

            <RelayTraceCard hops={currentInvestigation.relayHops} />

            <GeolocationMapCard hops={currentInvestigation.relayHops} />

            <ThreatSignalsCard
              signals={currentInvestigation.threatSignals}
              onViewAll={() => setIsThreatSignalsModalOpen(true)}
            />

            <ThreatGraphCard
              onViewFullGraph={() => setIsThreatGraphModalOpen(true)}
            />

            <EmailSummaryCard
              investigation={currentInvestigation}
              onViewHeaders={() => setIsHeadersModalOpen(true)}
            />

            <RecentInvestigationsCard
              investigations={investigationsList}
              selectedId={currentInvestigation.caseNumber}
              onSelectInvestigation={handleSelectInvestigation}
              onViewAll={() => setActiveTab("cases")}
            />

            <QuickActionsCard
              onIngestClick={() => setIsIngestModalOpen(true)}
              onSearchClick={() => setActiveTab("analysis")}
              onCreateCaseClick={() => setActiveTab("cases")}
            />
          </div>
        </main>
      </div>

      <HeadersModal
        isOpen={isHeadersModalOpen}
        onClose={() => setIsHeadersModalOpen(false)}
        rawHeaders={currentInvestigation.rawHeaders}
        caseId={currentInvestigation.caseNumber}
      />

      <AuthDetailsModal
        isOpen={selectedAuthType !== null}
        onClose={() => setSelectedAuthType(null)}
        authType={selectedAuthType}
        authResults={currentInvestigation.authResults}
      />

      <IngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onAnalyze={handleIngestNewEmail}
      />

      <ThreatSignalsModal
        isOpen={isThreatSignalsModalOpen}
        onClose={() => setIsThreatSignalsModalOpen(false)}
        signals={currentInvestigation.threatSignals}
      />

      <ThreatGraphModal
        isOpen={isThreatGraphModalOpen}
        onClose={() => setIsThreatGraphModalOpen(false)}
      />
    </div>
  );
}
