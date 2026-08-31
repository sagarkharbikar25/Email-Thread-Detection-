import { InvestigationSummary, RecentInvestigationItem } from "../types/forensics";

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
  status: "Completed"
};

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
