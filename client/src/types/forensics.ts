export type RiskSeverity = "critical" | "high" | "medium" | "low" | "safe";
export type AuthStatus = "PASS" | "FAIL" | "NEUTRAL" | "NONE";
export type InvestigationStatus = "Completed" | "Analyzing" | "Pending" | "Flagged";

export interface AuthenticationResult {
  spf: {
    status: AuthStatus;
    reason: string;
    details?: string;
  };
  dkim: {
    status: AuthStatus;
    reason: string;
    details?: string;
  };
  dmarc: {
    status: AuthStatus;
    reason: string;
    details?: string;
  };
}

export interface RelayHop {
  id: number;
  location: string;
  countryCode: string;
  flagUrl: string;
  ip: string;
  timestamp: string;
  isRecipient?: boolean;
  severity: "error" | "warning" | "primary" | "neutral";
  coordinates?: [number, number];
}

export interface ThreatSignal {
  id: string;
  label: string;
  percentage: number;
  severity: RiskSeverity;
  description?: string;
}

export interface ThreatGraphNode {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  type: "root" | "domain" | "ip" | "url" | "whois" | "asn" | "location";
  severity: RiskSeverity;
  highlight?: string;
}

export interface InvestigationSummary {
  id: string;
  caseNumber: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  receivedPath: string[];
  messageId: string;
  attachmentsCount: number;
  linksCount: number;
  rawHeaders: string;
  riskScore: number;
  riskCategory: RiskSeverity;
  classification: string;
  classificationName: string;
  confidence: string;
  threatLevel: string;
  threatDescription: string;
  analysisTime: string;
  analysisDate: string;
  evidenceHash: string;
  hashAlgorithm: string;
  authResults: AuthenticationResult;
  relayHops: RelayHop[];
  threatSignals: ThreatSignal[];
  status: InvestigationStatus;
}

export interface RecentInvestigationItem {
  id: string;
  subject: string;
  from: string;
  riskScore: number;
  classification: string;
  date: string;
  status: InvestigationStatus;
}
