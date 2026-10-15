"""Download public starter datasets and create normalized CSVs.

Sources:
- Active phishing URLs: mitchellkrogza/Phishing.Database (GitHub)
- Legitimate domains: Tranco top-domain list
- SMS spam/ham: UCI SMS Spam Collection

These sources are useful starter data, not ground truth for every scam. Review
source licenses and dataset drift before public/commercial deployment.
"""
from __future__ import annotations

import io
import zipfile
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "datasets" / "raw"
PROCESSED = ROOT / "datasets" / "processed"
RAW.mkdir(parents=True, exist_ok=True)
PROCESSED.mkdir(parents=True, exist_ok=True)

PHISHING_URLS = "https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-links-ACTIVE.txt"
TRANCO_URL = "https://tranco-list.eu/top-1m.csv.zip"
UCI_SMS_URL = "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip"
HEADERS = {"User-Agent": "VeristateFraudRiskAnalyzer/0.1 (academic research)"}


def get(url: str, timeout: int = 90) -> bytes:
    response = requests.get(url, headers=HEADERS, timeout=timeout)
    response.raise_for_status()
    return response.content


def prepare_urls() -> None:
    print("Downloading active phishing URL feed...")
    phishing_bytes = get(PHISHING_URLS)
    (RAW / "phishing-links-ACTIVE.txt").write_bytes(phishing_bytes)
    phishing = [
        line.strip() for line in phishing_bytes.decode("utf-8", errors="ignore").splitlines()
        if line.strip().startswith(("http://", "https://"))
    ]

    print("Downloading Tranco top-domain list...")
    tranco_bytes = get(TRANCO_URL)
    (RAW / "tranco-top-1m.csv.zip").write_bytes(tranco_bytes)
    with zipfile.ZipFile(io.BytesIO(tranco_bytes)) as archive:
        csv_name = next((n for n in archive.namelist() if n.lower().endswith(".csv")), None)
        if csv_name is None:
            raise RuntimeError("Tranco archive did not contain a CSV file.")
        with archive.open(csv_name) as f:
            tranco = pd.read_csv(f, header=None, names=["rank", "domain"], nrows=100_000)

    legitimate = ["https://" + str(domain).strip().lower() + "/" for domain in tranco["domain"].dropna()]
    frame = pd.DataFrame({
        "url": phishing + legitimate,
        "label": [1] * len(phishing) + [0] * len(legitimate),
    })
    frame["url"] = frame["url"].astype(str).str.strip()
    frame = frame[frame["url"].str.match(r"^https?://[^\s]+$", na=False)]
    frame = frame.drop_duplicates(subset=["url"])
    frame.to_csv(PROCESSED / "url_dataset.csv", index=False)
    print(f"URL dataset: {len(frame):,} unique examples; phishing={int(frame.label.sum()):,}, legitimate={int((frame.label == 0).sum()):,}")


def prepare_messages() -> None:
    print("Downloading UCI SMS Spam Collection...")
    archive_bytes = get(UCI_SMS_URL)
    (RAW / "sms-spam-collection.zip").write_bytes(archive_bytes)
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        name = next((n for n in archive.namelist() if n.endswith("SMSSpamCollection")), None)
        if name is None:
            raise RuntimeError("UCI archive did not contain SMSSpamCollection.")
        with archive.open(name) as f:
            rows = []
            for raw_line in f.read().decode("utf-8", errors="replace").splitlines():
                label, separator, message = raw_line.partition("\t")
                if separator and label in {"ham", "spam"} and message.strip():
                    rows.append({"text": message.strip(), "label": 1 if label == "spam" else 0})
    frame = pd.DataFrame(rows).drop_duplicates(subset=["text"])
    frame.to_csv(PROCESSED / "message_dataset.csv", index=False)
    print(f"Message dataset: {len(frame):,} unique examples; spam={int(frame.label.sum()):,}, ham={int((frame.label == 0).sum()):,}")


if __name__ == "__main__":
    prepare_urls()
    prepare_messages()
    print("Dataset preparation complete.")
