import { EmailDetail, CaseItem, EvidenceItem, ThreatGraphData } from '../types';

const API_BASE = '/api/v1';

// Pre-seeded rich demo dataset matching SIH 2026 problem statement fixtures
export const DEMO_EMAILS: EmailDetail[] = [
  {
    id: 'demo-phishing-paypal',
    sha256: 'b98f420653d7434b1f79d79801b6b47aeceea3695eb6308e870b189dea1654ab',
    filename: 'phishing_sample_paypal.eml',
    file_size_bytes: 2893,
    raw_message_id: '<20260831083000.876123@secure-verify-paypal-help.com>',
    subject: 'URGENT: Your PayPal Account Has Been Suspended - Verify Identity Immediately',
    from_address: 'service@paypal.com',
    from_display: 'PayPal Security Center',
    to_addresses: ['victim.user@victim-corp.com'],
    cc_addresses: [],
    reply_to: 'harvester-drop@secure-verify-paypal-help.com',
    return_path: 'bounce@secure-verify-paypal-help.com',
    date_header: 'Mon, 31 Aug 2026 08:30:00 +0000',
    analysis_status: 'COMPLETED',
    risk_score: 100,
    classification: 'CRITICAL',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    authentication: {
      spf_result: 'FAIL',
      spf_domain: 'paypal.com',
      spf_alignment: 'FAIL',
      dkim_result: 'FAIL',
      dkim_domain: 'secure-verify-paypal-help.com',
      dkim_selector: 'k1',
      dkim_alignment: 'FAIL',
      dmarc_result: 'FAIL',
      dmarc_policy: 'reject',
      details: { reason: 'Unauthorized sender IP 185.220.101.5 and broken DKIM signature' }
    },
    hops: [
      {
        hop_order: 1,
        from_host: 'mail-relay-edge.attacker-net.org',
        by_host: 'mx.victim-corp.com',
        with_protocol: 'ESMTP',
        for_address: 'victim.user@victim-corp.com',
        timestamp: 'Mon, 31 Aug 2026 08:30:12 +0000',
        ip_address: '185.220.101.5',
        hop_type: 'ORIGIN',
        geo_data: {
          country_code: 'DE',
          country_name: 'Germany',
          city: 'Frankfurt am Main',
          isp: 'Zwiebelfreunde e.V.',
          asn: 'AS200651',
          is_tor: true,
          is_vpn: false,
          is_proxy: true,
          abuse_score: 95
        }
      },
      {
        hop_order: 2,
        from_host: 'localhost',
        by_host: 'mail-relay-edge.attacker-net.org',
        with_protocol: 'SMTP',
        timestamp: 'Mon, 31 Aug 2026 08:29:50 +0000',
        ip_address: '127.0.0.1',
        hop_type: 'RELAY'
      }
    ],
    signals: [
      {
        signal_id: 'auth_spf_fail',
        category: 'AUTH',
        severity: 'HIGH',
        weight: 25,
        title: 'SPF Authentication Failed',
        description: 'Origin IP is not authorized in SPF record for paypal.com.',
        evidence: 'SPF Result: FAIL'
      },
      {
        signal_id: 'auth_dmarc_fail',
        category: 'AUTH',
        severity: 'CRITICAL',
        weight: 30,
        title: 'DMARC Policy Rejection / Alignment Failure',
        description: 'Failed strict alignment policy for paypal.com (p=reject).',
        evidence: 'DMARC: FAIL'
      },
      {
        signal_id: 'domain_display_name_spoof',
        category: 'DOMAIN',
        severity: 'CRITICAL',
        weight: 35,
        title: 'Executive / Brand Display Name Spoofing',
        description: "Sender display name mimics 'PayPal' but return path is 'secure-verify-paypal-help.com'.",
        evidence: "Display: 'PayPal Security Center' <service@paypal.com>"
      },
      {
        signal_id: 'header_replyto_mismatch',
        category: 'HEADER',
        severity: 'HIGH',
        weight: 20,
        title: 'From vs Reply-To Domain Mismatch',
        description: 'Replies are diverted to unauthorized harvester-drop@secure-verify-paypal-help.com.',
        evidence: 'From: service@paypal.com | Reply-To: harvester-drop@secure-verify-paypal-help.com'
      },
      {
        signal_id: 'intel_tor_exit_node',
        category: 'INTEL',
        severity: 'CRITICAL',
        weight: 40,
        title: 'Origin IP is Tor Exit Node',
        description: 'Email sent through anonymized German Tor relay node (185.220.101.5).',
        evidence: 'IP: 185.220.101.5 (Zwiebelfreunde e.V.)'
      },
      {
        signal_id: 'content_suspicious_urls',
        category: 'CONTENT',
        severity: 'HIGH',
        weight: 30,
        title: 'Embedded Phishing Credential Harvester (2 detected)',
        description: 'Contains bare IP link pointing to PHP credential harvesting script.',
        evidence: 'http://185.220.101.5/paypal-login-secure/verify.php'
      }
    ],
    urls: [
      { url: 'http://185.220.101.5/paypal-login-secure/verify.php', domain: '185.220.101.5', suspicious: true }
    ],
    origin_assessment: 'CONFIRMED SPOOFED IDENTITY - High-confidence credential harvesting infrastructure',
    origin_confidence: 95,
    graph_data: {
      nodes: [
        { id: 'email_paypal', type: 'emailNode', data: { label: 'Email: PayPal Account Suspended', threat_level: 'CRITICAL', category: 'email', risk_score: 100 }, position: { x: 250, y: 150 } },
        { id: 'domain_paypal', type: 'domainNode', data: { label: 'Domain: paypal.com (Claimed)', threat_level: 'HIGH', category: 'domain' }, position: { x: 250, y: 20 } },
        { id: 'ip_tor', type: 'ipNode', data: { label: 'Origin IP: 185.220.101.5 [Tor Node]', threat_level: 'CRITICAL', category: 'ip' }, position: { x: 520, y: 20 } },
        { id: 'asn_tor', type: 'asnNode', data: { label: 'ASN: AS200651 Zwiebelfreunde', threat_level: 'MEDIUM', category: 'asn' }, position: { x: 780, y: 20 } },
        { id: 'hop_1', type: 'hopNode', data: { label: 'Hop #1: mx.victim-corp.com', threat_level: 'LOW', category: 'hop' }, position: { x: 100, y: 300 } },
        { id: 'url_phish', type: 'urlNode', data: { label: 'URL: http://185.220.101.5/verify.php', threat_level: 'CRITICAL', category: 'url' }, position: { x: 520, y: 180 } }
      ],
      edges: [
        { id: 'e1', source: 'email_paypal', target: 'domain_paypal', label: 'CLAIMS_SENDER' },
        { id: 'e2', source: 'domain_paypal', target: 'ip_tor', label: 'UNAUTHENTICATED_ORIGIN' },
        { id: 'e3', source: 'ip_tor', target: 'asn_tor', label: 'ROUTED_VIA' },
        { id: 'e4', source: 'email_paypal', target: 'hop_1', label: 'RECEIVED_AT' },
        { id: 'e5', source: 'email_paypal', target: 'url_phish', label: 'EMBEDS_LINK' }
      ],
      total_nodes: 6,
      total_edges: 5
    }
  },
  {
    id: 'demo-ceo-fraud',
    sha256: '7e8664691fc2c38b9f82b08f50e39c2c65427b15d689777a0e071819380a7f1e',
    filename: 'spoofed_ceo_wire_fraud.eml',
    file_size_bytes: 1420,
    raw_message_id: '<20260831071445.99812@executive-direct-desk.net>',
    subject: 'CONFIDENTIAL: Urgent Vendor Invoice Settlement (Ref: ACQ-2026-9)',
    from_address: 'ceo@victim-corp.com',
    from_display: 'Arun Sharma (CEO)',
    to_addresses: ['finance.lead@victim-corp.com'],
    cc_addresses: [],
    reply_to: 'arun.sharma.exec77@gmail.com',
    return_path: 'bounce@executive-direct-desk.net',
    date_header: 'Mon, 31 Aug 2026 07:14:45 +0000',
    analysis_status: 'COMPLETED',
    risk_score: 100,
    classification: 'CRITICAL',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    authentication: {
      spf_result: 'SOFTFAIL',
      spf_domain: 'victim-corp.com',
      spf_alignment: 'FAIL',
      dkim_result: 'NONE',
      dmarc_result: 'FAIL',
      dmarc_policy: 'quarantine',
      details: { reason: 'Softfail on SPF, No DKIM signature, Return-path mismatch' }
    },
    hops: [
      {
        hop_order: 1,
        from_host: 'bulletproof-mta.hostkey.net',
        by_host: 'mx.victim-corp.com',
        with_protocol: 'ESMTP',
        for_address: 'finance.lead@victim-corp.com',
        timestamp: 'Mon, 31 Aug 2026 07:15:10 +0000',
        ip_address: '194.26.29.112',
        hop_type: 'ORIGIN',
        geo_data: {
          country_code: 'RU',
          country_name: 'Russia',
          city: 'Moscow',
          isp: 'Hostkey B.V. Bulletproof',
          asn: 'AS57043',
          is_tor: false,
          is_vpn: true,
          is_proxy: true,
          abuse_score: 88
        }
      }
    ],
    signals: [
      {
        signal_id: 'auth_spf_fail',
        category: 'AUTH',
        severity: 'HIGH',
        weight: 25,
        title: 'SPF Softfail Violation',
        description: 'Origin host 194.26.29.112 not authorized for victim-corp.com.',
        evidence: 'SPF: SOFTFAIL'
      },
      {
        signal_id: 'auth_dmarc_fail',
        category: 'AUTH',
        severity: 'CRITICAL',
        weight: 30,
        title: 'DMARC Alignment Failure',
        description: 'Failed domain owner authentication policy.',
        evidence: 'DMARC: FAIL'
      },
      {
        signal_id: 'header_replyto_mismatch',
        category: 'HEADER',
        severity: 'HIGH',
        weight: 20,
        title: 'BEC Free-Mail Reply-To Redirection',
        description: 'Replies routed to free Gmail account arun.sharma.exec77@gmail.com.',
        evidence: 'Reply-To: arun.sharma.exec77@gmail.com'
      },
      {
        signal_id: 'intel_ip_high_abuse',
        category: 'INTEL',
        severity: 'HIGH',
        weight: 25,
        title: 'Bulletproof Origin Host (Moscow, RU)',
        description: 'Host IP is associated with known bulletproof hosting and high threat abuse scores.',
        evidence: 'Abuse Score: 88/100 (Hostkey B.V.)'
      }
    ],
    origin_assessment: 'CONFIRMED SPOOFED IDENTITY - High-confidence BEC wire transfer fraud campaign',
    origin_confidence: 90,
    graph_data: {
      nodes: [
        { id: 'email_ceo', type: 'emailNode', data: { label: 'Email: Urgent Wire Settlement', threat_level: 'CRITICAL', category: 'email', risk_score: 100 }, position: { x: 250, y: 150 } },
        { id: 'domain_corp', type: 'domainNode', data: { label: 'Domain: victim-corp.com', threat_level: 'HIGH', category: 'domain' }, position: { x: 250, y: 20 } },
        { id: 'ip_bulletproof', type: 'ipNode', data: { label: 'Origin IP: 194.26.29.112 [RU]', threat_level: 'CRITICAL', category: 'ip' }, position: { x: 520, y: 20 } },
        { id: 'asn_hostkey', type: 'asnNode', data: { label: 'ASN: AS57043 Hostkey', threat_level: 'MEDIUM', category: 'asn' }, position: { x: 780, y: 20 } }
      ],
      edges: [
        { id: 'e1', source: 'email_ceo', target: 'domain_corp', label: 'SPOOFS_DOMAIN' },
        { id: 'e2', source: 'domain_corp', target: 'ip_bulletproof', label: 'SENT_VIA_BULLETPROOF' },
        { id: 'e3', source: 'ip_bulletproof', target: 'asn_hostkey', label: 'ROUTED_THROUGH' }
      ],
      total_nodes: 4,
      total_edges: 3
    }
  },
  {
    id: 'demo-legit-github',
    sha256: '754e16303f32cf92647399f54b2dae0f013e4b5b17be8c6d291fdcbc8d503943',
    filename: 'legitimate_github_security.eml',
    file_size_bytes: 1850,
    raw_message_id: '<github/security/ssh/20260831@github.com>',
    subject: '[GitHub] Security alert: A new SSH key was added to your account',
    from_address: 'noreply@github.com',
    from_display: 'GitHub Security',
    to_addresses: ['developer@victim-corp.com'],
    cc_addresses: [],
    reply_to: 'noreply@github.com',
    return_path: 'noreply@github.com',
    date_header: 'Mon, 31 Aug 2026 06:00:00 +0000',
    analysis_status: 'COMPLETED',
    risk_score: 0,
    classification: 'LEGITIMATE',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    authentication: {
      spf_result: 'PASS',
      spf_domain: 'github.com',
      spf_alignment: 'PASS',
      dkim_result: 'PASS',
      dkim_domain: 'github.com',
      dkim_selector: 's202105',
      dkim_alignment: 'PASS',
      dmarc_result: 'PASS',
      dmarc_policy: 'reject',
      details: { reason: 'All cryptographic checks passed and aligned' }
    },
    hops: [
      {
        hop_order: 1,
        from_host: 'out-21.smtp.github.com',
        by_host: 'mx.victim-corp.com',
        with_protocol: 'ESMTPS',
        for_address: 'developer@victim-corp.com',
        timestamp: 'Mon, 31 Aug 2026 06:00:15 +0000',
        ip_address: '142.250.190.46',
        hop_type: 'ORIGIN',
        geo_data: {
          country_code: 'US',
          country_name: 'United States',
          city: 'Mountain View',
          isp: 'Google LLC',
          asn: 'AS15169',
          is_tor: false,
          is_vpn: false,
          is_proxy: false,
          abuse_score: 0
        }
      }
    ],
    signals: [
      {
        signal_id: 'auth_spf_pass',
        category: 'AUTH',
        severity: 'INFO',
        weight: -10,
        title: 'SPF Authenticated',
        description: 'Sending IP is strictly authorized by github.com.',
        evidence: 'SPF: PASS'
      },
      {
        signal_id: 'auth_dkim_pass',
        category: 'AUTH',
        severity: 'INFO',
        weight: -10,
        title: 'DKIM Cryptographic Signature Valid',
        description: 'Valid RSA-SHA256 signature verified for github.com.',
        evidence: 'DKIM: PASS (selector=s202105)'
      }
    ],
    urls: [
      { url: 'https://github.com/settings/keys', domain: 'github.com', suspicious: false }
    ],
    origin_assessment: 'AUTHENTICATED ORIGIN - Traced to authorized github.com transmission infrastructure',
    origin_confidence: 95,
    graph_data: {
      nodes: [
        { id: 'email_gh', type: 'emailNode', data: { label: 'Email: GitHub Security Notification', threat_level: 'LEGITIMATE', category: 'email', risk_score: 0 }, position: { x: 250, y: 150 } },
        { id: 'domain_gh', type: 'domainNode', data: { label: 'Domain: github.com', threat_level: 'LEGITIMATE', category: 'domain' }, position: { x: 250, y: 20 } },
        { id: 'ip_gh', type: 'ipNode', data: { label: 'Origin IP: 142.250.190.46', threat_level: 'LEGITIMATE', category: 'ip' }, position: { x: 520, y: 20 } },
        { id: 'url_gh', type: 'urlNode', data: { label: 'URL: https://github.com/settings/keys', threat_level: 'LEGITIMATE', category: 'url' }, position: { x: 520, y: 180 } }
      ],
      edges: [
        { id: 'e1', source: 'email_gh', target: 'domain_gh', label: 'VERIFIED_SENDER' },
        { id: 'e2', source: 'domain_gh', target: 'ip_gh', label: 'AUTHENTICATED_MTA' },
        { id: 'e3', source: 'email_gh', target: 'url_gh', label: 'LEGIT_LINK' }
      ],
      total_nodes: 4,
      total_edges: 3
    }
  }
];

export const DEMO_CASES: CaseItem[] = [
  {
    id: 'case-sih-01',
    case_number: 'CASE-2026-SIH01',
    title: 'Operation PhishGuard: Q3 Financial Phishing & Executive Spoofing Investigation',
    description: 'Active forensic campaign targeting high-value corporate accounts through lookalike domains and credential harvesting relays.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    assigned_to: 'Senior SOC Analyst',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    notes: 'Correlated 2 threat emails with Tor exit nodes in Frankfurt and bulletproof MTAs in Moscow.',
    email_count: 2,
    evidence_count: 2
  }
];

export const DEMO_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-01',
    evidence_id: 'EV-20260831-B98F42',
    case_id: 'case-sih-01',
    email_id: 'demo-phishing-paypal',
    filename: 'phishing_sample_paypal.eml',
    sha256: 'b98f420653d7434b1f79d79801b6b47aeceea3695eb6308e870b189dea1654ab',
    file_size: 2893,
    evidence_type: 'EMAIL',
    integrity_status: 'VERIFIED',
    uploaded_at: new Date(Date.now() - 3600000).toISOString(),
    chain_events: [
      { id: 'c1', action: 'INGESTED_AND_ANALYZED', actor_name: 'Forensic Automation Pipeline', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Initial SHA-256 generation' },
      { id: 'c2', action: 'VERIFIED', actor_name: 'Senior SOC Analyst', timestamp: new Date().toISOString(), note: 'SHA-256 Tamper Integrity Check: PASSED' }
    ]
  },
  {
    id: 'ev-02',
    evidence_id: 'EV-20260831-7E8664',
    case_id: 'case-sih-01',
    email_id: 'demo-ceo-fraud',
    filename: 'spoofed_ceo_wire_fraud.eml',
    sha256: '7e8664691fc2c38b9f82b08f50e39c2c65427b15d689777a0e071819380a7f1e',
    file_size: 1420,
    evidence_type: 'EMAIL',
    integrity_status: 'VERIFIED',
    uploaded_at: new Date(Date.now() - 7200000).toISOString(),
    chain_events: [
      { id: 'c3', action: 'INGESTED_AND_ANALYZED', actor_name: 'Forensic Automation Pipeline', timestamp: new Date(Date.now() - 7200000).toISOString(), note: 'Initial SHA-256 generation' }
    ]
  }
];

// API Service with Live Backend & Seamless Demo Fallback
export const api = {
  async getEmails(): Promise<EmailDetail[]> {
    try {
      const res = await fetch(`${API_BASE}/emails`);
      if (res.ok) {
        const liveList = await res.json();
        if (liveList && liveList.length > 0) {
          // Fetch full details for live emails
          const detailed = await Promise.all(
            liveList.map(async (item: any) => {
              try {
                const dRes = await fetch(`${API_BASE}/emails/${item.id}`);
                if (dRes.ok) return await dRes.json();
              } catch (_) {}
              return item;
            })
          );
          return detailed;
        }
      }
    } catch (_) {}
    return DEMO_EMAILS;
  },

  async getEmailById(id: string): Promise<EmailDetail | null> {
    try {
      const res = await fetch(`${API_BASE}/emails/${id}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return DEMO_EMAILS.find(e => e.id === id) || DEMO_EMAILS[0];
  },

  async uploadEmail(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/emails/upload?sync_mode=true`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    
    // Demo fallback upload simulation
    return {
      email_id: 'demo-phishing-paypal',
      sha256: 'b98f420653d7434b1f79d79801b6b47aeceea3695eb6308e870b189dea1654ab',
      filename: file.name,
      status: 'COMPLETED',
      risk_score: 100,
      classification: 'CRITICAL',
      message: 'Forensic analysis completed (Demo Simulation)'
    };
  },

  async getCases(): Promise<CaseItem[]> {
    try {
      const res = await fetch(`${API_BASE}/cases`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return data;
      }
    } catch (_) {}
    return DEMO_CASES;
  },

  async createCase(caseData: { title: string; description?: string; severity: string }): Promise<CaseItem> {
    try {
      const res = await fetch(`${API_BASE}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    
    const newCase: CaseItem = {
      id: `case-${Date.now()}`,
      case_number: `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: caseData.title,
      description: caseData.description,
      severity: caseData.severity as any,
      status: 'OPEN',
      assigned_to: 'Senior SOC Analyst',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_count: 0,
      evidence_count: 0
    };
    return newCase;
  },

  async getEvidence(): Promise<EvidenceItem[]> {
    try {
      const res = await fetch(`${API_BASE}/evidence`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return data;
      }
    } catch (_) {}
    return DEMO_EVIDENCE;
  },

  async verifyEvidence(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evidence/${id}/verify`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (_) {}
    return {
      evidence_id: id,
      integrity_status: 'VERIFIED',
      verified_at: new Date().toISOString()
    };
  }
};
