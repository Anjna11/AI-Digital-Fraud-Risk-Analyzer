"""FastAPI endpoints for the Veristate trained AI service."""
from __future__ import annotations

import base64
import binascii
import re
from datetime import datetime, timezone
from typing import Literal

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.model_service import FraudModels, ModelsUnavailable

app = FastAPI(
    title="Veristate AI Service",
    version="0.1.0",
    description="Trained URL and SMS risk classifiers with QR decoding.",
)
models = FraudModels()


class AnalyzeRequest(BaseModel):
    value: str = Field(min_length=1, max_length=7_500_000)


class HealthResponse(BaseModel):
    status: str
    modelsLoaded: bool
    modelVersions: dict[str, str]


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if models.ready() else "models_not_trained",
        modelsLoaded=models.ready(),
        modelVersions={
            "url": str(models.metadata.get("url_model_version", "not-loaded")),
            "message": str(models.metadata.get("message_model_version", "not-loaded")),
        },
    )


@app.post("/admin/reload-models")
def reload_models() -> dict:
    # Keep this endpoint local/private; do not expose it publicly without admin auth.
    models.reload()
    return {"modelsLoaded": models.ready()}


def _result(data: dict) -> dict:
    data["timestamp"] = datetime.now(timezone.utc).isoformat()
    return data


def _call(fn, value: str) -> dict:
    try:
        return _result(fn(value))
    except ModelsUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/analyze/url")
def analyze_url(request: AnalyzeRequest) -> dict:
    return _call(models.analyze_url, request.value)


@app.post("/analyze/message")
def analyze_message(request: AnalyzeRequest) -> dict:
    return _call(models.analyze_message, request.value)


def _decode_data_url(value: str) -> bytes:
    raw = value.strip()
    if raw.startswith("data:"):
        if "," not in raw:
            raise ValueError("Invalid image data URL.")
        header, raw = raw.split(",", 1)
        if ";base64" not in header.lower() or not header.lower().startswith("data:image/"):
            raise ValueError("QR input must be a base64-encoded image data URL.")
    else:
        # Permit raw base64 from trusted backend callers, but not arbitrary text.
        raw = raw.strip()
    try:
        decoded = base64.b64decode(raw, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError("QR input must be an image data URL or base64-encoded image.") from exc
    if not decoded or len(decoded) > 5 * 1024 * 1024:
        raise ValueError("QR image must be between 1 byte and 5 MB.")
    return decoded


@app.post("/analyze/qr")
def analyze_qr(request: AnalyzeRequest) -> dict:
    try:
        image_bytes = _decode_data_url(request.value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=422, detail="Uploaded content is not a supported image.")
    detector = cv2.QRCodeDetector()
    payload, points, _ = detector.detectAndDecode(image)
    if not payload:
        raise HTTPException(status_code=422, detail="No readable QR code was found in this image.")
    return _call(models.analyze_qr_payload, payload)


@app.get("/")
def root() -> dict:
    return {"service": "Veristate AI Service", "docs": "/docs", "health": "/health"}
