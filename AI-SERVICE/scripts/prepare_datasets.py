"""Download public starter datasets and create normalized CSVs.

Sources:
- Active phishing URLs: mitchellkrogza/Phishing.Database (GitHub)
- Legitimate domains: Tranco top-domain list
- SMS spam/ham: UCI SMS Spam Collection
- Smishing-labelled SMS: Combined Labeled Smishing Dataset (labels partly keyword-derived; weak-label caveat)

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
SMISHING_CSV_URL = "https://raw.githubusercontent.com/shaghayegh-hp/Smishing_Dataset/main/Combined-Labeled-Dataset.csv"
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
    # Keep the starter training run manageable on a typical student laptop.
    # The source feed is larger and changes over time; expand this cap after profiling.
    phishing = phishing[:100_000]

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
    # UCI provides a familiar ham/spam baseline.
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
                    rows.append({
                        "text": message.strip(),
                        "label": 1 if label == "spam" else 0,
                        "source": "uci_sms_spam_collection",
                    })

    # Add a dataset that includes explicit smishing labels. Its README states
    # labels were assigned partly from keyword presence, so this source has
    # weak-label/keyword-leakage risk and must not be treated as perfect ground truth.
    print("Downloading combined labeled smishing dataset...")
    smishing_bytes = get(SMISHING_CSV_URL)
    (RAW / "combined-labeled-smishing.csv").write_bytes(smishing_bytes)
    smishing = pd.read_csv(io.BytesIO(smishing_bytes))
    smishing.columns = [str(col).strip().lower() for col in smishing.columns]
    required = {"message", "spam label", "smishing label"}
    if not required.issubset(set(smishing.columns)):
        raise RuntimeError(
            "Smishing dataset columns changed. Expected message, spam label, smishing label; "
            f"received {list(smishing.columns)}"
        )
    smishing = smishing.dropna(subset=["message"])
    spam = pd.to_numeric(smishing["spam label"], errors="coerce").fillna(0).astype(int)
    smish = pd.to_numeric(smishing["smishing label"], errors="coerce").fillna(0).astype(int)
    labels = ((spam > 0) | (smish > 0)).astype(int)
    for message, label in zip(smishing["message"], labels):
        if str(message).strip():
            rows.append({
                "text": str(message).strip(),
                "label": int(label),
                "source": "combined_labeled_smishing",
            })

    frame = pd.DataFrame(rows)
    frame["text"] = frame["text"].astype(str).str.strip()
    frame = frame[frame["text"].str.len() > 0]
    # Prefer the positive label if the same text has conflicting labels across sources.
    frame["_dedupe"] = frame["text"].str.lower()
    frame = frame.sort_values("label", ascending=False).drop_duplicates(subset=["_dedupe"])
    frame = frame.drop(columns=["_dedupe"])
    frame.to_csv(PROCESSED / "message_dataset.csv", index=False)
    print(
        f"Message dataset: {len(frame):,} unique examples; "
        f"spam/smishing={int(frame.label.sum()):,}, "
        f"ham/non-smishing={int((frame.label == 0).sum()):,}"
    )


if __name__ == "__main__":
    prepare_urls()
    prepare_messages()
    print("Dataset preparation complete.")
