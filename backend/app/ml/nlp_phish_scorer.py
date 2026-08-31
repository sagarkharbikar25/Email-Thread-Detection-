import re
from typing import Dict, Any, List

class NLPPhishingScorer:
    """
    Person 3 ML Deliverable: NLP Phishing & Threat Content Classifier.
    Analyzes email Subject and Body text for psychological triggers, financial extortion,
    credential harvesting patterns, urgency markers, and executive spoofing language.
    """
    
    URGENCY_KEYWORDS = [
        "urgent", "immediately", "immediate action required", "suspended", "account locked",
        "unauthorized access", "action required", "within 24 hours", "critical alert",
        "security warning", "expire", "verification required", "deactivated", "overdue"
    ]
    
    FINANCIAL_EXTORTION_KEYWORDS = [
        "wire transfer", "invoice settlement", "remittance", "payment voucher", "settlement ref",
        "beneficiary account", "swift transfer", "direct deposit", "confidential settlement",
        "bitcoin", "cryptocurrency", "wallet address", "funds transfer", "acq-2026"
    ]
    
    CREDENTIAL_HARVESTING_KEYWORDS = [
        "verify identity", "confirm your password", "login to restore", "click here to unlock",
        "reset your credentials", "security update required", "update payment method",
        "secure-verify", "login verification", "re-authenticate"
    ]
    
    EXECUTIVE_SPOOF_PATTERNS = [
        "confidential", "are you at your desk", "available to handle a wire",
        "sent from my iphone", "treat this with urgency", "executive desk", "ceo directive"
    ]

    def analyze_content(self, subject: str, body_text: str = "") -> Dict[str, Any]:
        full_text = f"{subject} {body_text}".lower()
        
        urgency_matches = [w for w in self.URGENCY_KEYWORDS if w in full_text]
        financial_matches = [w for w in self.FINANCIAL_EXTORTION_KEYWORDS if w in full_text]
        cred_matches = [w for w in self.CREDENTIAL_HARVESTING_KEYWORDS if w in full_text]
        exec_matches = [w for w in self.EXECUTIVE_SPOOF_PATTERNS if w in full_text]
        
        # Calculate heuristic ML probability score
        feature_count = len(urgency_matches) + len(financial_matches) * 1.5 + len(cred_matches) * 2.0 + len(exec_matches) * 1.5
        
        # Sigmoid-like scaling
        prob = min(0.99, max(0.01, feature_count / 6.0)) if feature_count > 0 else 0.05
        
        intent_type = "BENIGN"
        if len(cred_matches) > 0:
            intent_type = "CREDENTIAL_HARVESTING"
        elif len(financial_matches) > 0:
            intent_type = "FINANCIAL_BEC_FRAUD"
        elif len(urgency_matches) > 1:
            intent_type = "SOCIAL_ENGINEERING_URGENCY"
            
        return {
            "ml_phish_probability": round(prob, 2),
            "predicted_intent": intent_type,
            "detected_features": {
                "urgency_triggers": urgency_matches,
                "financial_keywords": financial_matches,
                "credential_prompts": cred_matches,
                "executive_patterns": exec_matches,
            },
            "is_suspicious_content": prob >= 0.50
        }

# Global singleton instance
nlp_scorer = NLPPhishingScorer()
