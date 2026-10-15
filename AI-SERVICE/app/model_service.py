"""Load trained text models and produce explainable risk assessments.

Models are deliberately not bundled in Git. Run scripts/prepare_datasets.py and
scripts/train_models.py before starting the API. The API fails closed with 503
if the model artifacts are missing; it never silently substitutes mock scores.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import joblib

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "models"

URL_MODEL_PATH = MODEL_DIR / "url_model.joblib"
MESSAGE_MODEL_PATH = MODEL_DIR / "message_model.joblib"
METADATA_PATH = MODEL_DIR / "model_metadata.joblib"

URL_RE = re.compile(r"(?i)\b((?:https?://)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:/[^\s<>'\"]*)?)")
URL_SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "rebrand.ly"}
SUSPICIOUS_TLDS = {".zip", ".mov", ".top", ".click", ".work", ".support", ".country", ".gq", ".tk", ".ml", ".cf"}


class ModelsUnavailable(RuntimeError):
    pass


class FraudModels:
    def __init__(self) -> None:
        self.url_pipeline = None
        self.message_pipeline = None
        self.metadata: dict[str, Any] = {}
        self.reload()

    def reload(self) -> None:
        missing = [str(p.name) for p in (URL_MODEL_PATH, MESSAGE_MODEL_PATH) if not p.exists()]
        if missing:
            self.url_pipeline = None
            self.message_pipeline = None
            self.metadata = {}
            return
        self.url_pipeline = joblib.load(URL_MODEL_PATH)
        self.message_pipeline = joblib.load(MESSAGE_MODEL_PATH)
        self.metadata = joblib.load(METADATA_PATH) if METADATA_PATH.exists() else {}

    def ready(self) -> bool:
        return self.url_pipeline is not None and self.message_pipeline is not None

    def _require_models(self) -> None:
        if not self.ready():
            raise ModelsUnavailable(
                "Trained model artifacts are missing. Run: "
                "python scripts/prepare_datasets.py && python scripts/train_models.py"
            )

    @staticmethod
    def _normalise_url(value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("URL cannot be empty.")
        candidate = value if "://" in value else "http://" + value
        parsed = urlparse(candidate)
        if not parsed.hostname or "." not in parsed.hostname:
            raise ValueError("Enter a valid URL or domain, for example https://example.com.")
        if any(ch.isspace() for ch in value):
            raise ValueError("URL must not contain spaces.")
        return candidate

    @staticmethod
    def _score(probability: float) -> int:
        # Probability is a model score, not a guarantee of fraud or a calibrated
        # financial-loss probability. Thresholds are configurable after validation.
        return int(round(max(0.0, min(1.0, probability)) * 100))

    @staticmethod
    def _level(score: int) -> str:
        if score >= 85:
            return "critical"
        if score >= 60:
            return "high"
        if score >= 30:
            return "medium"
        return "safe"

    @staticmethod
    def _url_reasons(url: str, score: int) -> list[str]:
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower()
        reasons: list[str] = []
        if parsed.scheme != "https":
            reasons.append("The URL does not use HTTPS; this alone does not prove it is malicious.")
        if "@" in parsed.netloc:
            reasons.append("The URL contains an @ symbol in its authority section, which can obscure the actual host.")
        if len(url) > 100:
            reasons.append("The URL is unusually long, which can make its destination harder to inspect.")
        if host in URL_SHORTENERS:
            reasons.append("The URL uses a link-shortening service that hides the final destination.")
        if any(host.endswith(tld) for tld in SUSPICIOUS_TLDS):
            reasons.append("The domain uses a top-level domain that appears in some abuse campaigns; this is not proof by itself.")
        if re.search(r"(login|verify|secure|account|wallet|bank|update|claim|gift|prize)", url, re.I):
            reasons.append("The URL contains words often used in login, account-verification, or reward lures.")
        if score >= 60:
            reasons.append("The trained URL classifier found patterns more similar to phishing examples in its training data.")
        if not reasons:
            reasons.append("No obvious URL red flags were found by the rule checks; use the model result as a signal, not a guarantee.")
        return reasons[:5]

    @staticmethod
    def _message_reasons(message: str, score: int) -> list[str]:
        reasons: list[str] = []
        if URL_RE.search(message):
            reasons.append("The message includes a URL; inspect the destination independently before opening it.")
        if re.search(r"(?i)\b(otp|password|pin|cvv|bank details|account number)\b", message):
            reasons.append("The message mentions credentials or financial information.")
        if re.search(r"(?i)\b(urgent|immediately|act now|suspended|blocked|verify now|within 24 hours)\b", message):
            reasons.append("The message uses urgency or account-threat language.")
        if re.search(r"(?i)\b(prize|winner|won|lottery|reward|cashback|claim your)\b", message):
            reasons.append("The message contains prize or reward language commonly seen in unsolicited lures.")
        if score >= 60:
            reasons.append("The trained message classifier found patterns more similar to spam/scam-labeled examples in its training data.")
        if not reasons:
            reasons.append("No common scam indicators were detected by the rule checks; this does not guarantee the message is safe.")
        return reasons[:5]

    @staticmethod
    def _recommendations(level: str) -> list[str]:
        if level in {"high", "critical"}:
            return [
                "Do not enter passwords, OTPs, PINs, or banking details through this content.",
                "Do not pay or open its links until you verify the sender or destination independently.",
                "Use the organisation's official app or manually typed official website to check the claim.",
            ]
        if level == "medium":
            return [
                "Verify the sender and destination through an official channel before acting.",
                "Do not share credentials or payment information based on this content alone.",
            ]
        return [
            "No strong risk signal was returned by this model, but this is not a safety guarantee.",
            "Verify unexpected requests for money, credentials, or urgent action independently.",
        ]

    @staticmethod
    def _top_features(pipeline: Any, text: str, limit: int = 4) -> list[str]:
        """Return active n-grams with positive contribution for linear models."""
        try:
            vectorizer = pipeline.named_steps["tfidf"]
            classifier = pipeline.named_steps["classifier"]
            vector = vectorizer.transform([text])
            names = vectorizer.get_feature_names_out()
            weights = classifier.coef_[0]
            row = vector.tocoo()
            contributions = [(names[i], float(v) * float(weights[i])) for i, v in zip(row.col, row.data)]
            positive = sorted((item for item in contributions if item[1] > 0), key=lambda x: x[1], reverse=True)
            return [feature for feature, _ in positive[:limit] if len(feature.strip()) >= 3]
        except Exception:
            return []

    def analyze_url(self, value: str) -> dict[str, Any]:
        self._require_models()
        url = self._normalise_url(value)
        probability = float(self.url_pipeline.predict_proba([url])[0][1])
        score = self._score(probability)
        level = self._level(score)
        reasons = self._url_reasons(url, score)
        features = self._top_features(self.url_pipeline, url)
        if features:
            reasons.append("Model-sensitive URL fragments: " + ", ".join(repr(x) for x in features[:3]) + ".")
        return {
            "type": "url",
            "input": value,
            "riskScore": score,
            "riskLevel": level,
            "scamCategory": "Possible phishing URL" if score >= 30 else None,
            "predictionLabel": "phishing_like" if probability >= 0.5 else "legitimate_like",
            "confidence": round(max(probability, 1.0 - probability), 4),
            "reasons": reasons[:6],
            "recommendations": self._recommendations(level),
            "modelVersion": self.metadata.get("url_model_version", "url-model-unversioned"),
        }

    def analyze_message(self, value: str) -> dict[str, Any]:
        self._require_models()
        message = value.strip()
        if not message:
            raise ValueError("Message cannot be empty.")
        probability = float(self.message_pipeline.predict_proba([message])[0][1])
        score = self._score(probability)
        level = self._level(score)
        reasons = self._message_reasons(message, score)
        features = self._top_features(self.message_pipeline, message)
        if features:
            reasons.append("Model-sensitive text fragments: " + ", ".join(repr(x) for x in features[:3]) + ".")
        return {
            "type": "message",
            "input": value,
            "riskScore": score,
            "riskLevel": level,
            "scamCategory": "Possible spam or scam message" if score >= 30 else None,
            "predictionLabel": "spam_or_scam_like" if probability >= 0.5 else "ham_like",
            "confidence": round(max(probability, 1.0 - probability), 4),
            "reasons": reasons[:6],
            "recommendations": self._recommendations(level),
            "modelVersion": self.metadata.get("message_model_version", "message-model-unversioned"),
            "modelScopeWarning": "Message model uses UCI ham/spam labels plus a combined smishing dataset whose README says labels were partly assigned by keyword presence; labels are noisy proxies, not confirmed fraud ground truth.",
        }

    def analyze_qr_payload(self, payload: str) -> dict[str, Any]:
        payload = payload.strip()
        if not payload:
            raise ValueError("The QR code did not contain readable text.")
        match = URL_RE.search(payload)
        if match:
            result = self.analyze_url(match.group(1))
            result["type"] = "qr"
            result["input"] = "[QR code image]"
            result["decodedContent"] = payload[:2000]
            result["qrContentType"] = "url"
            result["reasons"].insert(0, "The QR code decodes to a URL; the URL model assessed the decoded destination.")
            return result
        result = self.analyze_message(payload)
        result["type"] = "qr"
        result["input"] = "[QR code image]"
        result["decodedContent"] = payload[:2000]
        result["qrContentType"] = "text"
        result["reasons"].insert(0, "The QR code decodes to text rather than a detected URL; the message model assessed the text.")
        return result
