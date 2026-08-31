import { InvestigationSummary, RecentInvestigationItem } from "../types/forensics";

export const MOCK_GRAPH_DATA = {
  nodes: [
    // Core Actors & Campaigns
    { id: "actor-gaza", label: "Gaza Cybergang", type: "actor", sublabel: "Threat Actor", severity: "critical", details: { status: "Active", associated: "MoleRats", last_seen: "2 days ago" } },
    { id: "actor-molerats", label: "MoleRats", type: "actor", sublabel: "Threat Actor", severity: "critical", details: { status: "Active", alias: "TA402", last_seen: "Today" } },
    { id: "camp-q2", label: "Q2 Decoy Campaign", type: "campaign", sublabel: "Campaign", severity: "high", details: { target: "Financial", vectors: "Spearphishing" } },
    
    // Tactics / MITRE
    { id: "t-1566", label: "T1566.001", type: "tactic", sublabel: "Spearphishing", severity: "high", details: { phase: "Initial Access", description: "Spearphishing Attachment" } },
    { id: "t-1204", label: "T1204.001", type: "tactic", sublabel: "User Execution", severity: "medium", details: { phase: "Execution", description: "Malicious Link" } },
    { id: "t-1059", label: "T1059.007", type: "tactic", sublabel: "JavaScript", severity: "medium", details: { phase: "Execution", description: "JavaScript/JScript" } },

    // Malware Families
    { id: "mal-poisonivy", label: "POISONIVY", type: "malware", sublabel: "RAT", severity: "critical", details: { type: "Remote Access Trojan", c2: "Active" } },
    { id: "mal-spark", label: "SPARK", type: "malware", sublabel: "Backdoor", severity: "high", details: { type: "Backdoor", c2: "Inactive" } },
    { id: "mal-sharpstage", label: "SHARPSTAGE", type: "malware", sublabel: "Dropper", severity: "high", details: { type: "Dropper", payload: "POISONIVY" } },

    // Domains
    { id: "dom-paypa1", label: "paypa1-security.com", type: "domain", sublabel: "Spoofed Domain", severity: "critical", details: { registrar: "NameCheap", created: "12 days ago", risk: "Suspicious" } },
    { id: "dom-berbank", label: "berbank.com", type: "domain", sublabel: "Spoofed Domain", severity: "critical", details: { registrar: "reg-ripn", created: "Dec 13 2018", risk: "Malicious" } },
    { id: "dom-neerco", label: "neerco.net", type: "domain", sublabel: "C2 Domain", severity: "high", details: { registrar: "reg-ripn", created: "Dec 12 2019", risk: "Malicious" } },
    { id: "dom-cin", label: "cin.kp", type: "domain", sublabel: "C2 Domain", severity: "high", details: { registrar: "r01-reg-ripn", created: "Oct 25 2019", risk: "Malicious" } },

    // IPs
    { id: "ip-203", label: "203.0.113.5", type: "ip", sublabel: "Origin IP", severity: "critical", details: { location: "Singapore", asn: "AS45102", owner: "DigitalOcean" } },
    { id: "ip-195", label: "195.208.0.4", type: "ip", sublabel: "C2 Server", severity: "critical", details: { location: "Russia", asn: "AS56724", owner: "Hostkey B.V." } },
    { id: "ip-234-1", label: "234.221.98.01", type: "ip", sublabel: "C2 Server", severity: "high", details: { location: "North Korea", asn: "AS43783", owner: "Ryugyong-dong" } },
    { id: "ip-234-2", label: "234.221.98.03", type: "ip", sublabel: "Relay Node", severity: "medium", details: { location: "North Korea", asn: "AS43783", owner: "Ryugyong-dong" } },
    { id: "ip-23-1", label: "23.94.218.130", type: "ip", sublabel: "Drop Zone", severity: "high", details: { location: "USA", asn: "AS36352", owner: "ColoCrossing" } },
    { id: "ip-23-2", label: "23.94.218.118", type: "ip", sublabel: "Drop Zone", severity: "medium", details: { location: "USA", asn: "AS36352", owner: "ColoCrossing" } },

    // Emails
    { id: "email-admin", label: "admin@neerco.net", type: "email", sublabel: "Threat Actor Email", severity: "high", details: { registered_domains: 4, activity: "High" } },
    { id: "email-card", label: "card@tours-cin.org", type: "email", sublabel: "Phishing Sender", severity: "high", details: { registered_domains: 2, activity: "Medium" } },
    { id: "email-trc", label: "accounts@paypa1-security.com", type: "email", sublabel: "Phishing Sender", severity: "critical", details: { sent_volume: "10,000+", first_seen: "2 days ago" } },

    // Files/Hashes
    { id: "hash-1", label: "00D7F155F1...", type: "hash", sublabel: "SHA256 Hash", severity: "critical", details: { filename: "Invoice_9921.pdf", type: "PDF Exploit" } },
    { id: "hash-2", label: "B7373B9768...", type: "hash", sublabel: "SHA256 Hash", severity: "high", details: { filename: "payload.exe", type: "PE32 Executable" } },
    { id: "hash-3", label: "2E4671C517...", type: "hash", sublabel: "SHA256 Hash", severity: "high", details: { filename: "macro.docm", type: "Office Macro" } }
  ],
  edges: [
    // Actor connections
    { source: "actor-gaza", target: "actor-molerats", label: "associated with" },
    { source: "actor-molerats", target: "camp-q2", label: "orchestrates" },
    
    // Tactic connections
    { source: "camp-q2", target: "t-1566", label: "uses tactic" },
    { source: "camp-q2", target: "t-1204", label: "uses tactic" },
    { source: "actor-molerats", target: "t-1059", label: "uses tactic" },
    
    // Malware connections
    { source: "actor-molerats", target: "mal-poisonivy", label: "uses malware" },
    { source: "actor-gaza", target: "mal-spark", label: "uses malware" },
    { source: "t-1566", target: "mal-sharpstage", label: "delivers" },
    { source: "mal-sharpstage", target: "mal-poisonivy", label: "drops" },

    // Domain <-> IP connections
    { source: "dom-paypa1", target: "ip-203", label: "resolves to" },
    { source: "dom-berbank", target: "ip-195", label: "resolves to" },
    { source: "dom-neerco", target: "ip-234-1", label: "resolves to" },
    { source: "dom-cin", target: "ip-234-1", label: "resolves to" },
    { source: "dom-cin", target: "ip-234-2", label: "resolves to" },
    { source: "dom-neerco", target: "ip-23-1", label: "resolves to" },
    { source: "dom-neerco", target: "ip-23-2", label: "resolves to" },
    
    // Malware <-> C2 connections
    { source: "mal-poisonivy", target: "ip-195", label: "C2 communication" },
    { source: "mal-spark", target: "dom-neerco", label: "C2 communication" },

    // Email <-> Domain connections
    { source: "email-admin", target: "dom-neerco", label: "registered domain" },
    { source: "email-card", target: "dom-cin", label: "registered domain" },
    { source: "email-trc", target: "dom-paypa1", label: "sender domain" },
    
    // File/Hash connections
    { source: "t-1566", target: "hash-1", label: "attachment" },
    { source: "hash-1", target: "email-trc", label: "distributed by" },
    { source: "hash-2", target: "mal-poisonivy", label: "variant hash" },
    { source: "hash-3", target: "mal-sharpstage", label: "variant hash" },
    { source: "hash-2", target: "ip-23-1", label: "downloaded from" },
    { source: "hash-3", target: "ip-23-2", label: "downloaded from" }
  ]
};

export const MOCK_INVESTIGATION: InvestigationSummary = {
  id: "TRC-1024",
  caseNumber: "TRC-1024",
  subject: "Urgent: Verify Your Account Information",
  from: "accounts@paypa1-security.com",
  to: "user@gov.in",
  date: "May 24, 2025 09:52 AM (IST)",
  receivedPath: [
    "from mail.paypa1.com (203.0.113.5)",
    "by mx1.example.in (10.0.0.25)"
  ],
  messageId: "<20250524.9523.mail.paypa1.com>",
  attachmentsCount: 1,
  linksCount: 2,
  rawHeaders: `Delivered-To: user@gov.in
Received: by mx1.example.in (Postfix, from userid 1001)
    id 4XYZ9923K; Sat, 24 May 2025 09:55:12 +0530 (IST)
Received: from pune-relay.node.net (103.45.67.12)
    by mx1.example.in (10.0.0.25) with ESMTP id 8392AB7C
    for <user@gov.in>; Sat, 24 May 2025 09:54:33 +0530 (IST)
Received: from mumbai-gateway.isp.net (103.21.244.18)
    by pune-relay.node.net with ESMTP id 2847DDE
    for <user@gov.in>; Sat, 24 May 2025 09:53:18 +0530 (IST)
Received: from sg-mail-out.paypa1.com (203.0.113.5)
    by mumbai-gateway.isp.net with SMTP id 11209AF
    for <user@gov.in>; Sat, 24 May 2025 09:52:04 +0530 (IST)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=paypa1-security.com;
    s=default; t=1748058724; bh=invalidHashVal893740284==;
    b=invalidSignatureValueReturnedDuringForensicVerification==
Authentication-Results: mx1.example.in;
    spf=fail (sender IP is 203.0.113.5) smtp.mailfrom=accounts@paypa1-security.com;
    dkim=fail header.d=paypa1-security.com header.s=default;
    dmarc=fail action=quarantine header.from=paypa1-security.com
From: "PayPal Security Alert" <accounts@paypa1-security.com>
To: <user@gov.in>
Subject: Urgent: Verify Your Account Information
Date: Sat, 24 May 2025 09:52:00 +0530
Message-ID: <20250524.9523.mail.paypa1.com>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_NextPart_000_001D"
X-Mailer: Custom Spoof Engine v4.2`,
  riskScore: 91,
  riskCategory: "critical",
  classification: "BEC",
  classificationName: "Business Email Compromise",
  confidence: "High Confidence",
  threatLevel: "CRITICAL",
  threatDescription: "Immediate Action Required",
  analysisTime: "42.6 sec",
  analysisDate: "May 24, 2025 10:24 AM",
  evidenceHash: "8f4a2d9b91bc731a5e4299de801c23f990b79313ea390f77103ba12cb69101f3",
  hashAlgorithm: "SHA-256",
  authResults: {
    spf: {
      status: "FAIL",
      reason: "Domain not authorized to send mail",
      details: "SPF record lookup for paypa1-security.com does not include relay IP 203.0.113.5 in designated SPF mechanisms (~all / -all rejected)."
    },
    dkim: {
      status: "FAIL",
      reason: "Invalid signature detected",
      details: "Body hash mismatch in cryptographic signature (rsa-sha256). Header hash does not correspond to actual public key published at default._domainkey.paypa1-security.com."
    },
    dmarc: {
      status: "FAIL",
      reason: "Policy alignment failed",
      details: "Neither SPF nor DKIM passed in alignment with the From: header domain (paypa1-security.com). Strict DMARC alignment enforced with Quarantine policy."
    }
  },
  relayHops: [
    {
      id: 1,
      location: "Singapore",
      countryCode: "SG",
      flagUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6PUdZR6qB2Fpgll9ZILZ8EEAO36ewUMMnvbLmsj2Yt6quj14ieeoCJBXIiQneQCxH7MeJz1UWGILCK7dHZi16B0LjaegVntySpWek_G4jIW7dL6hF0F5uMDCRWJM5uyjLnaOefTgqakhoMq-dHFjdsV5_uMMoXKrJSjLmSgLnqox7hCre-67RJX2Wbg_lRzRnFqUmf_ikR-MiFtC7tWMdawA6XtdXVTB7e-4exE4z2bXyuHwobNBl",
      ip: "203.0.113.5",
      timestamp: "May 24, 09:52 AM",
      severity: "error",
      coordinates: [1.3521, 103.8198]
    },
    {
      id: 2,
      location: "Mumbai",
      countryCode: "IN",
      flagUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCY_LD4P7t2C5zXwGjqGNeYLK6bBtswiCfoG_DIT_0VkrkloHQtPTa_ga_7FkkKouBlsqcE624d_-Yd0mvlf4pHRCjxNBTfo_zWsu4Ln1rebnzyrwohYfEu4-4_O9hkxwN-OfvXAISpLtYnaFlLzRxYPdagPZwX-KbFWpF8KKrRm0RX_X54zTNnA_7SLex1XbSilAWllEnIW5_Gkajg0zB2kAnOfibykKoqq6OB8KiSw7Eo63sTMmAH",
      ip: "103.21.244.18",
      timestamp: "May 24, 09:53 AM",
      severity: "warning",
      coordinates: [19.076, 72.8777]
    },
    {
      id: 3,
      location: "Pune",
      countryCode: "IN",
      flagUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2tZ99DLkCDKIi_ZPzK3jxXnrEymYBFej-KlE8wQChxPD4XYzYKvyrRZmV8SPnUA98XqrRRuJ2OdBjhT31roWY-cH9OtywlMyyPGY_2qTi95XUm1gSh6e05Jx8tZPalYHkQkaA6On6GZRWJbtloSpuJvatunYTSVFsIX2FyfpOe0AbQgfj30KfMcbUic47ip6CS-6XI0r2hYngwFnDpAdBTERgIYLVVKY1X1_RQ96DKQeUHqB6XH_G",
      ip: "103.45.67.12",
      timestamp: "May 24, 09:54 AM",
      severity: "primary",
      coordinates: [18.5204, 73.8567]
    },
    {
      id: 4,
      location: "Recipient",
      countryCode: "LOCAL",
      flagUrl: "",
      ip: "10.0.0.25",
      timestamp: "May 24, 09:55 AM",
      isRecipient: true,
      severity: "neutral",
      coordinates: [18.5204, 73.8567]
    }
  ],
  threatSignals: [
    { id: "s1", label: "Suspicious Domain", percentage: 90, severity: "critical", description: "Lookalike typosquat domain spoofing 'paypal.com' -> 'paypa1-security.com'." },
    { id: "s2", label: "Authentication Failure", percentage: 85, severity: "critical", description: "SPF, DKIM, and DMARC alignment failed completely." },
    { id: "s3", label: "Urgent Language", percentage: 70, severity: "high", description: "High-pressure urgency heuristics ('Verify Immediately', 'Account Suspended')." },
    { id: "s4", label: "IP Reputation", percentage: 80, severity: "critical", description: "Originating IP 203.0.113.5 listed on 4 global spam and spamhaus blacklists." },
    { id: "s5", label: "Newly Registered Domain", percentage: 75, severity: "high", description: "Domain registered only 12 days ago via privacy registrar." },
    { id: "s6", label: "URL Malicious", percentage: 65, severity: "high", description: "Embedded hyperlink points to deceptive credential harvesting endpoint." }
  ],
  status: "Completed",
  
  // New fields for specific tabs
  signals: [
    { name: "Urgency Indicators", confidence: 0.95, severity: "CRITICAL", description: "Subject and body contain high-pressure vocabulary ('Verify Immediately', 'Account Suspended') typical of BEC attacks." },
    { name: "Financial Request", confidence: 0.82, severity: "HIGH", description: "Contextual analysis identifies a request to verify billing information and update payment methods." },
    { name: "Greeting Anomaly", confidence: 0.76, severity: "MEDIUM", description: "Generic greeting ('Dear Customer') used instead of personalized name, common in mass phishing." }
  ],
  urls: [
    "https://paypa1-security.com/auth/verify?token=8f9a2b",
    "http://secure-update-portal.info/login.php"
  ],
  attachments: [
    { filename: "Account_Verification_Form.pdf", size_bytes: 245000, sha256: "8f4a2d9b91bc731a5e4299de801c23f990b79313ea390f77103ba12cb69101f3", is_suspicious: true, mime_type: "application/pdf" },
    { filename: "logo.png", size_bytes: 12040, sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", is_suspicious: false, mime_type: "image/png" }
  ],
  authentication: {
    spf_result: "fail",
    spf_domain: "paypa1-security.com",
    spf_alignment: false,
    dkim_result: "fail",
    dkim_domain: "paypa1-security.com",
    dkim_selector: "default",
    dkim_alignment: false,
    dmarc_result: "fail",
    dmarc_policy: "quarantine"
  },
  hops: [
    { hop_type: "origin", by_host: "sg-mail-out.paypa1.com", timestamp: "2025-05-24T09:52:04+05:30", ip_address: "203.0.113.5", with_protocol: "SMTP", from_host: "unknown", geo_data: { city: "Singapore", country: "SG", latitude: 1.3521, longitude: 103.8198 } },
    { hop_type: "intermediate", by_host: "mumbai-gateway.isp.net", timestamp: "2025-05-24T09:53:18+05:30", ip_address: "103.21.244.18", with_protocol: "ESMTP", from_host: "sg-mail-out.paypa1.com", geo_data: { city: "Mumbai", country: "IN", latitude: 19.076, longitude: 72.8777 } },
    { hop_type: "intermediate", by_host: "pune-relay.node.net", timestamp: "2025-05-24T09:54:33+05:30", ip_address: "103.45.67.12", with_protocol: "ESMTP", from_host: "mumbai-gateway.isp.net", geo_data: { city: "Pune", country: "IN", latitude: 18.5204, longitude: 73.8567 } },
    { hop_type: "final", by_host: "mx1.example.in", timestamp: "2025-05-24T09:55:12+05:30", ip_address: "10.0.0.25", with_protocol: "Postfix", from_host: "pune-relay.node.net", geo_data: { city: "Local Network", country: "LOCAL", latitude: 18.5204, longitude: 73.8567 } }
  ]
} as any;

export const MOCK_INVESTIGATIONS_LIST: RecentInvestigationItem[] = [
  {
    id: "TRC-1024",
    subject: "Urgent: Verify Your Account Information",
    from: "accounts@paypa1-security.com",
    riskScore: 91,
    classification: "BEC",
    date: "May 24, 2025 10:24 AM",
    status: "Completed"
  },
  {
    id: "TRC-1023",
    subject: "Update Your Password Now",
    from: "security@micr0soft-alert.com",
    riskScore: 76,
    classification: "Phishing",
    date: "May 24, 2025 09:15 AM",
    status: "Completed"
  },
  {
    id: "TRC-1022",
    subject: "Invoice Attached #INV-94021",
    from: "billing@amaz0n-pay.com",
    riskScore: 62,
    classification: "Suspicious",
    date: "May 23, 2025 04:11 PM",
    status: "Completed"
  },
  {
    id: "TRC-1021",
    subject: "Internal Payroll Update - Q2 Bonus",
    from: "hr-portal@corp-intranet.co",
    riskScore: 88,
    classification: "BEC",
    date: "May 23, 2025 02:40 PM",
    status: "Completed"
  },
  {
    id: "TRC-1020",
    subject: "Package Delivery Attempt Failed",
    from: "tracking@dhl-express-portal.info",
    riskScore: 54,
    classification: "Phishing",
    date: "May 22, 2025 11:20 AM",
    status: "Completed"
  }
];
