"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/emails");
        const list = response.data;
        
        const mappedList: RecentInvestigationItem[] = list.map((item: any) => ({
          id: item.id,
          subject: item.subject,
          from: item.from_display,
          riskScore: item.risk_score || 0,
          classification: item.classification || "Unknown",
          date: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          status: item.analysis_status === "COMPLETED" ? "Completed" : "Analyzing",
        }));
        
        if (mappedList.length > 0) {
          setInvestigationsList(mappedList);
          await loadInvestigationDetails(mappedList[0].id, mappedList[0]);
        }
      } catch (err) {
        console.error("Failed to fetch API, falling back to mock data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const loadInvestigationDetails = async (id: string, fallbackItem?: RecentInvestigationItem) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/emails/${id}`);
      const data = response.data;

      // Calculate logic for mapped values
      const score = data.risk_score || 0;
      const category = score >= 80 ? "critical" : score >= 60 ? "high" : score >= 40 ? "medium" : "low";

      // Authentication formatting
      const auth = data.authentication || {};
      
      setCurrentInvestigation({
        id: data.id,
        caseNumber: data.id,
        subject: data.subject,
        from: data.from_display || data.from_address,
        to: (data.to_addresses || []).join(", "),
        date: new Date(data.created_at).toLocaleString(),
        receivedPath: [], // we can populate from data.hops
        messageId: data.raw_message_id,
        attachmentsCount: data.attachments?.length || 0,
        linksCount: data.urls?.length || 0,
        rawHeaders: "Raw headers are available via backend API /raw",
        riskScore: score,
        riskCategory: category as any,
        classification: data.classification || "Unknown",
        classificationName: data.classification,
        confidence: data.origin_confidence ? `${data.origin_confidence}%` : "95%",
        threatLevel: score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : "MEDIUM",
        threatDescription: data.origin_assessment || "No threat description available",
        analysisTime: "4.2 sec",
        analysisDate: new Date(data.created_at).toLocaleString(),
        evidenceHash: data.sha256,
        hashAlgorithm: "SHA-256",
        authResults: {
          spf: { status: auth.spf_result || "NONE", reason: auth.spf_alignment || "" },
          dkim: { status: auth.dkim_result || "NONE", reason: auth.dkim_alignment || "" },
          dmarc: { status: auth.dmarc_result || "NONE", reason: auth.dmarc_policy || "" },
        },
        relayHops: (data.hops || []).map((h: any, i: number) => ({
          id: i,
          location: h.geo_data?.city || h.by_host,
          countryCode: h.geo_data?.country || "UN",
          flagUrl: "https://flagcdn.com/w20/un.png",
          ip: h.ip_address || h.by_host,
          timestamp: h.timestamp || "",
          severity: "neutral",
        })),
        threatSignals: (data.signals || []).map((s: any) => ({
          id: s.name || s.title,
          label: s.title || s.name,
          percentage: s.confidence_score ? Math.round(s.confidence_score * 100) : 100,
          severity: s.severity.toLowerCase(),
          description: s.description,
        })),
        status: data.analysis_status === "COMPLETED" ? "Completed" : "Analyzing",
      });
    } catch (err) {
      console.error("Failed to load details, using mock", err);
      if (fallbackItem) {
        // Just use partial update like before
        setCurrentInvestigation((prev) => ({
          ...prev,
          id: fallbackItem.id,
          caseNumber: fallbackItem.id,
          subject: fallbackItem.subject,
          from: fallbackItem.from,
          riskScore: fallbackItem.riskScore,
          classification: fallbackItem.classification,
          status: fallbackItem.status,
        }));
      }
    }
  };

  const handleSelectInvestigation = (item: RecentInvestigationItem) => {
    loadInvestigationDetails(item.id, item);
  };

  const handleIngestNewEmail = async (content: File | string) => {
    if (typeof content === "string") {
      alert("Text ingestion not supported yet, please upload a .eml file");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("file", content);
      
      const response = await axios.post("http://localhost:8000/api/v1/emails/upload?sync_mode=true", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      const data = response.data;
      
      const newItem: RecentInvestigationItem = {
        id: data.email_id,
        subject: data.filename,
        from: "User Upload",
        riskScore: data.risk_score || 0,
        classification: data.classification || "Unknown",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        status: data.status === "COMPLETED" ? "Completed" : "Analyzing",
      };

      setInvestigationsList((prev) => [newItem, ...prev]);
      handleSelectInvestigation(newItem);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload email to backend.");
    }
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
    <>
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
    </>
  );
}
