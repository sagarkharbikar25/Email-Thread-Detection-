import logging
from collections import defaultdict
from typing import Any, Dict, Iterable, List

logger = logging.getLogger(__name__)


def detect_campaigns(records: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect campaign clusters using IP and domain similarity."""
    buckets: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

    for record in records:
        ip_value = str(record.get("ip") or "unknown-ip")
        domain_value = str(record.get("domain") or "unknown-domain")
        risk_value = float(record.get("risk", 0) or 0)
        buckets[ip_value].append({
            "domain": domain_value,
            "risk": risk_value,
            "source": record,
        })

    campaigns: List[Dict[str, Any]] = []
    for cluster_key, entries in buckets.items():
        if len(entries) < 2:
            continue
        suspicious_entries = [entry for entry in entries if entry["risk"] >= 50]
        if not suspicious_entries:
            continue

        score = round(sum(item["risk"] for item in suspicious_entries) / max(len(suspicious_entries), 1), 2)
        campaigns.append({
            "cluster_key": cluster_key,
            "domains": sorted({item["domain"] for item in suspicious_entries}),
            "risk_score": score,
            "email_count": len(suspicious_entries),
            "confidence": min(99, 60 + int(score)),
            "campaign_name": f"Campaign-{cluster_key}",
        })

    campaigns.sort(key=lambda item: item["risk_score"], reverse=True)
    return campaigns
