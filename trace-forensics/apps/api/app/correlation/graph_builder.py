from typing import Dict, Any, List
try:
    import networkx as nx
except ImportError:
    nx = None

def build_email_graph(email_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build forensic threat infrastructure graph formatted for React Flow.
    Nodes and edges connect emails, sender domains, relay MTAs, IPs, ASNs, URLs, and attachments.
    """
    email_id = str(email_data.get("email_id", "root"))
    risk_score = email_data.get("risk_score", 0)
    threat_level = "CRITICAL" if risk_score >= 80 else ("HIGH" if risk_score >= 60 else ("MEDIUM" if risk_score >= 40 else "LOW"))

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    # 1. Central Email Node
    nodes.append({
        "id": f"email_{email_id}",
        "type": "emailNode",
        "data": {
            "label": f"Email: {email_data.get('subject', 'Untitled')[:32]}",
            "subject": email_data.get("subject"),
            "risk_score": risk_score,
            "threat_level": threat_level,
            "category": "email"
        },
        "position": {"x": 250, "y": 150}
    })

    # 2. Sender Domain Node
    from_address = email_data.get("from_address") or ""
    sender_domain = from_address.split("@")[-1] if "@" in from_address else "unknown.domain"
    domain_node_id = f"domain_{sender_domain}"
    nodes.append({
        "id": domain_node_id,
        "type": "domainNode",
        "data": {
            "label": f"Domain: {sender_domain}",
            "domain": sender_domain,
            "threat_level": threat_level,
            "category": "domain"
        },
        "position": {"x": 250, "y": 20}
    })
    edges.append({
        "id": f"e_email_domain",
        "source": f"email_{email_id}",
        "target": domain_node_id,
        "label": "SENT_FROM",
        "type": "smoothstep"
    })

    # 3. Origin IP & ASN Nodes
    origin_ip = email_data.get("origin_ip")
    if origin_ip:
        ip_node_id = f"ip_{origin_ip}"
        ip_threat = "CRITICAL" if email_data.get("is_tor") or email_data.get("abuse_score", 0) > 50 else threat_level
        nodes.append({
            "id": ip_node_id,
            "type": "ipNode",
            "data": {
                "label": f"Origin IP: {origin_ip}",
                "ip": origin_ip,
                "country": email_data.get("country_name", "Unknown"),
                "threat_level": ip_threat,
                "category": "ip"
            },
            "position": {"x": 500, "y": 20}
        })
        edges.append({
            "id": f"e_domain_ip",
            "source": domain_node_id,
            "target": ip_node_id,
            "label": "ORIGINATED_AT",
            "type": "smoothstep"
        })

        asn = email_data.get("asn")
        if asn:
            asn_node_id = f"asn_{asn}"
            nodes.append({
                "id": asn_node_id,
                "type": "asnNode",
                "data": {
                    "label": f"ASN: {asn}",
                    "asn": asn,
                    "threat_level": "MEDIUM",
                    "category": "asn"
                },
                "position": {"x": 750, "y": 20}
            })
            edges.append({
                "id": f"e_ip_asn",
                "source": ip_node_id,
                "target": asn_node_id,
                "label": "ROUTED_VIA",
                "type": "smoothstep"
            })

    # 4. Hop Relay Chain Nodes
    hops = email_data.get("hops", [])
    prev_hop_id = None
    for idx, hop in enumerate(hops):
        hop_id = f"hop_{idx+1}"
        hop_host = hop.get("by_host") or hop.get("from_host") or f"MTA-Hop-{idx+1}"
        hop_ip = hop.get("ip_address") or "N/A"
        nodes.append({
            "id": hop_id,
            "type": "hopNode",
            "data": {
                "label": f"Hop #{hop.get('hop_order', idx+1)}: {hop_host[:20]}",
                "ip": hop_ip,
                "threat_level": "HIGH" if hop.get("hop_type") == "SUSPICIOUS" else "LOW",
                "category": "hop"
            },
            "position": {"x": 100 + (idx * 160), "y": 300}
        })
        if prev_hop_id:
            edges.append({
                "id": f"e_{prev_hop_id}_{hop_id}",
                "source": prev_hop_id,
                "target": hop_id,
                "label": "RELAYED_TO",
                "type": "smoothstep"
            })
        else:
            edges.append({
                "id": f"e_email_{hop_id}",
                "source": f"email_{email_id}",
                "target": hop_id,
                "label": "RECEIVED_PATH",
                "type": "smoothstep"
            })
        prev_hop_id = hop_id

    # 5. Embedded URLs Nodes
    urls = email_data.get("urls", [])
    for idx, url_obj in enumerate(urls[:5]):  # Cap at 5 for clear visualization
        url_val = url_obj.get("url") if isinstance(url_obj, dict) else str(url_obj)
        url_node_id = f"url_{idx}"
        is_susp = url_obj.get("suspicious", True) if isinstance(url_obj, dict) else True
        nodes.append({
            "id": url_node_id,
            "type": "urlNode",
            "data": {
                "label": f"URL: {url_val[:28]}...",
                "url": url_val,
                "threat_level": "CRITICAL" if is_susp else "LOW",
                "category": "url"
            },
            "position": {"x": 500 + (idx * 40), "y": 180 + (idx * 60)}
        })
        edges.append({
            "id": f"e_email_{url_node_id}",
            "source": f"email_{email_id}",
            "target": url_node_id,
            "label": "CONTAINS_LINK",
            "type": "smoothstep"
        })

    # 6. Attachment Nodes
    attachments = email_data.get("attachments", [])
    for idx, att in enumerate(attachments):
        att_name = att.get("filename", f"file_{idx}") if isinstance(att, dict) else str(att)
        att_node_id = f"att_{idx}"
        is_susp = att.get("suspicious", False) if isinstance(att, dict) else False
        nodes.append({
            "id": att_node_id,
            "type": "attachmentNode",
            "data": {
                "label": f"File: {att_name}",
                "filename": att_name,
                "threat_level": "CRITICAL" if is_susp else "LOW",
                "category": "attachment"
            },
            "position": {"x": 20, "y": 180 + (idx * 60)}
        })
        edges.append({
            "id": f"e_email_{att_node_id}",
            "source": f"email_{email_id}",
            "target": att_node_id,
            "label": "CONTAINS_ATTACHMENT",
            "type": "smoothstep"
        })

    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges)
    }
