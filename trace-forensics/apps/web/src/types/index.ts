export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LEGITIMATE' | 'INFO';

export interface RiskSignal {
  signal_id: string;
  category: string;
  severity: ThreatLevel;
  weight: number;
  title: string;
  description: string;
  evidence?: string;
}

export interface TransmissionHop {
  hop_order: number;
  from_host?: string;
  by_host?: string;
  with_protocol?: string;
  for_address?: string;
  timestamp?: string;
  ip_address?: string;
  hop_type: string;
  geo_data?: {
    country_code?: string;
    country_name?: string;
    city?: string;
    isp?: string;
    asn?: string;
    is_tor?: boolean;
    is_vpn?: boolean;
    is_proxy?: boolean;
    abuse_score?: number;
  };
}

export interface AuthResults {
  spf_result: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'NONE';
  spf_domain?: string;
  spf_alignment?: string;
  dkim_result: 'PASS' | 'FAIL' | 'NONE';
  dkim_domain?: string;
  dkim_selector?: string;
  dkim_alignment?: string;
  dmarc_result: 'PASS' | 'FAIL' | 'NONE';
  dmarc_policy?: string;
  details?: Record<string, any>;
}

export interface AttachmentItem {
  filename: string;
  content_type: string;
  size_bytes: number;
  sha256: string;
  suspicious?: boolean;
  reasons?: string[];
}

export interface ThreatGraphNode {
  id: string;
  type: string;
  data: {
    label: string;
    threat_level: ThreatLevel;
    category: string;
    [key: string]: any;
  };
  position: { x: number; y: number };
}

export interface ThreatGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: string;
}

export interface ThreatGraphData {
  nodes: ThreatGraphNode[];
  edges: ThreatGraphEdge[];
  total_nodes?: number;
  total_edges?: number;
}

export interface EmailDetail {
  id: string;
  sha256: string;
  filename: string;
  file_size_bytes: number;
  raw_message_id?: string;
  subject: string;
  from_address: string;
  from_display?: string;
  to_addresses: string[];
  cc_addresses?: string[];
  reply_to?: string;
  return_path?: string;
  date_header?: string;
  analysis_status: string;
  risk_score: number;
  classification: string;
  created_at: string;
  authentication?: AuthResults;
  hops: TransmissionHop[];
  signals: RiskSignal[];
  attachments?: AttachmentItem[];
  urls?: Array<{ url: string; domain: string; suspicious: boolean }>;
  origin_assessment?: string;
  origin_confidence?: number;
  graph_data?: ThreatGraphData;
}

export interface CaseItem {
  id: string;
  case_number: string;
  title: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'ARCHIVED';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  email_count?: number;
  evidence_count?: number;
}

export interface EvidenceItem {
  id: string;
  evidence_id: string;
  case_id: string;
  email_id?: string;
  filename: string;
  sha256: string;
  file_size: number;
  evidence_type: string;
  integrity_status: string;
  uploaded_at: string;
  chain_events?: Array<{
    id: string;
    action: string;
    actor_name: string;
    timestamp: string;
    note?: string;
  }>;
}
