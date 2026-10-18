from __future__ import annotations

import base64
import binascii
from datetime import datetime, timezone
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.model_service import FraudModels, ModelsUnavailable

app = FastAPI(
    title="Veristate AI Service",
    description="Private ML service used by the Spring Boot API.",
    version="1.0.0",
)
models = FraudModels()


class AnalyzeRequest(BaseModel):
    value: str = Field(min_length=1, max_length=7_500_000)


def with_timestamp(data: dict[str, Any]) -> dict[str, Any]:
    return {**data, "timestamp": datetime.now(timezone.utc).isoformat()}


def call_model(method: Any, value: str) -> dict[str, Any]:
    try:
        return with_timestamp(method(value))
    except ModelsUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "Veristate AI Service",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    ready = models.ready()
    return {
        "status": "ok" if ready else "degraded",
        "modelsLoaded": ready,
        "modelVersions": models.metadata,
    }


@app.post("/admin/reload-models")
def reload_models() -> dict[str, Any]:
    models.reload()
    return health()


@app.post("/analyze/url")
def analyze_url(request: AnalyzeRequest) -> dict[str, Any]:
    return call_model(models.analyze_url, request.value)


@app.post("/analyze/message")
def analyze_message(request: AnalyzeRequest) -> dict[str, Any]:
    return call_model(models.analyze_message, request.value)


@app.post("/analyze/qr")
def analyze_qr(request: AnalyzeRequest) -> dict[str, Any]:
    prefix = "data:image/"
    if not request.value.startswith(prefix) or "," not in request.value:
        raise HTTPException(
            status_code=422,
            detail="Expected a base64 image data URL, for example data:image/png;base64,...",
        )

    header, encoded = request.value.split(",", 1)
    if ";base64" not in header:
        raise HTTPException(status_code=422, detail="QR image must be base64 encoded.")

    try:
        image_bytes = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=422, detail="Invalid base64 image data.") from exc

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=422, detail="Could not read the uploaded QR image.")

    payload, points, _ = cv2.QRCodeDetector().detectAndDecode(image)
    if not payload:
        raise HTTPException(status_code=422, detail="No readable QR code was found in this image.")

    return call_model(models.analyze_qr_payload, payload)
