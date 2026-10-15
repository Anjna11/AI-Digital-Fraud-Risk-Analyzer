"""Train, evaluate and save the URL and message classifiers.

The evaluation uses a stratified hold-out split. Because public phishing feeds
and popular-domain lists can contain domain/campaign bias, these metrics are
initial baseline metrics, not proof of real-world performance.
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "datasets" / "processed"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"
MODELS.mkdir(parents=True, exist_ok=True)
REPORTS.mkdir(parents=True, exist_ok=True)


def build_pipeline() -> Pipeline:
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            analyzer="char",
            ngram_range=(3, 5),
            min_df=2,
            max_features=250_000,
            sublinear_tf=True,
            dtype="float32",
        )),
        ("classifier", LogisticRegression(
            max_iter=1200,
            class_weight="balanced",
            solver="liblinear",
            random_state=42,
        )),
    ])


def train_one(csv_path: Path, text_column: str, label_column: str, artifact: str, report_name: str, version: str) -> dict:
    if not csv_path.exists():
        raise FileNotFoundError(f"{csv_path} not found. Run python scripts/prepare_datasets.py first.")
    df = pd.read_csv(csv_path).dropna(subset=[text_column, label_column])
    df[text_column] = df[text_column].astype(str).str.strip()
    df = df[df[text_column].str.len() > 0].drop_duplicates(subset=[text_column])
    df[label_column] = pd.to_numeric(df[label_column], errors="coerce")
    df = df[df[label_column].isin([0, 1])]
    if df[label_column].nunique() != 2 or df[label_column].value_counts().min() < 10:
        raise ValueError(f"{csv_path.name} needs at least 10 examples from each class.")

    x_train, x_test, y_train, y_test = train_test_split(
        df[text_column], df[label_column].astype(int),
        test_size=0.2, random_state=42, stratify=df[label_column].astype(int),
    )
    model = build_pipeline()
    print(f"Training {artifact}: {len(x_train):,} train / {len(x_test):,} test examples...")
    model.fit(x_train, y_train)
    pred = model.predict(x_test)
    probability = model.predict_proba(x_test)[:, 1]
    metrics = {
        "model_version": version,
        "dataset": csv_path.name,
        "dataset_rows_after_deduplication": int(len(df)),
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
        "class_counts": {str(k): int(v) for k, v in df[label_column].value_counts().items()},
        "accuracy": round(float(accuracy_score(y_test, pred)), 4),
        "precision_positive_class": round(float(precision_score(y_test, pred, zero_division=0)), 4),
        "recall_positive_class": round(float(recall_score(y_test, pred, zero_division=0)), 4),
        "f1_positive_class": round(float(f1_score(y_test, pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, probability)), 4),
        "confusion_matrix_labels_0_then_1": confusion_matrix(y_test, pred, labels=[0, 1]).tolist(),
        "classification_report": classification_report(y_test, pred, labels=[0, 1], target_names=["class_0", "class_1"], output_dict=True, zero_division=0),
        "evaluation_note": "Random stratified hold-out; likely affected by dataset/source bias. Validate on a time-separated, independently sourced set before deployment.",
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
    }
    joblib.dump(model, MODELS / artifact, compress=3)
    (REPORTS / report_name).write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in metrics.items() if k not in {"classification_report"}}, indent=2))
    return metrics


if __name__ == "__main__":
    try:
        url_metrics = train_one(
            DATA / "url_dataset.csv", "url", "label",
            "url_model.joblib", "url_evaluation.json", "url-char-tfidf-logreg-v1",
        )
        message_metrics = train_one(
            DATA / "message_dataset.csv", "text", "label",
            "message_model.joblib", "message_evaluation.json", "message-char-tfidf-logreg-v1",
        )
    except Exception as exc:
        print(f"Training failed: {exc}", file=sys.stderr)
        raise

    metadata = {
        "url_model_version": url_metrics["model_version"],
        "message_model_version": message_metrics["model_version"],
        "url_dataset": url_metrics["dataset"],
        "message_dataset": message_metrics["dataset"],
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "message_scope_warning": "Combined UCI ham/spam and public smishing data; the combined smishing source reports keyword-based labeling, so labels may be noisy and are not confirmed fraud ground truth.",
    }
    joblib.dump(metadata, MODELS / "model_metadata.joblib", compress=3)
    print(f"Models saved to {MODELS}")
    print(f"Evaluation reports saved to {REPORTS}")
