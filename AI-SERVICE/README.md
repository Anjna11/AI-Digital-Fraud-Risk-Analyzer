# Veristate AI Service

Python inference service for the AI-Powered Digital Fraud Risk Analyzer.

## What this is (and is not)

This service trains two real supervised machine-learning pipelines:
- **URL model:** character n-gram TF-IDF + Logistic Regression trained from an active phishing URL feed and a Tranco popular-domain list.
- **Message model:** character n-gram TF-IDF + Logistic Regression trained on the UCI SMS Spam Collection.

The QR endpoint decodes an image using OpenCV, then routes a decoded URL to the URL model or decoded text to the message model. QR decoding is not itself a trained model.

**Honest limitation:** the UCI SMS dataset labels spam/ham, not confirmed fraud/non-fraud. Treat its result as a spam/scam-like signal. The starter URL sources are also imperfect and may be biased or stale. Evaluation reports are required; don't claim production-grade accuracy without independent, time-separated validation.

Models are trained locally; model binaries and raw datasets are not committed to Git.

## Ubuntu setup

From the repository root:

```bash
cd AI-SERVICE
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python scripts/prepare_datasets.py
python scripts/train_models.py
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

The first data preparation requires internet access. It downloads:
- Active phishing URLs from `mitchellkrogza/Phishing.Database`
- Tranco's top-domain list (the first 100,000 entries are used)
- UCI SMS Spam Collection

Check source terms/licenses and inspect the prepared data before using it outside an academic prototype. Do not treat the current public feed as a complete list of phishing URLs.

## Endpoints

- `GET /` service information
- `GET /health` reports whether trained model artifacts loaded
- `POST /analyze/url` JSON: `{"value":"https://example.com/login"}`
- `POST /analyze/message` JSON: `{"value":"Your account is blocked. Verify now ..."}`
- `POST /analyze/qr` JSON: `{"value":"data:image/png;base64,..."}`

The QR endpoint requires an image data URL (or raw base64 image bytes). It returns HTTP 422 if the image is invalid or has no decodable QR code. Maximum encoded image size is 5 MB.

Responses contain `riskScore` (0–100 model score), `riskLevel`, `predictionLabel`, `confidence`, `reasons`, `recommendations`, and `modelVersion`. A risk score is not a calibrated probability of financial loss and is not proof of fraud. The 30/60/85 display thresholds should be tuned using validation data and documented in the final report.

Interactive API documentation: `http://127.0.0.1:8001/docs`.

## Smoke tests

After training and starting the service in a second terminal:

```bash
curl http://127.0.0.1:8001/health
curl -X POST http://127.0.0.1:8001/analyze/url -H 'Content-Type: application/json' -d '{"value":"https://example.com"}'
curl -X POST http://127.0.0.1:8001/analyze/message -H 'Content-Type: application/json' -d '{"value":"Your account is suspended. Verify your OTP immediately."}'
```

For QR, send a base64 image data URL generated from a QR image. The service does not trust a filename as QR content.

## Integration contract

Spring Boot should call this service on its private network at `http://127.0.0.1:8001` in local development. Keep the AI service private in deployment; do not expose `/admin/reload-models` publicly. The existing frontend's QR flow must send the actual image content as a data URL, not only its filename.
