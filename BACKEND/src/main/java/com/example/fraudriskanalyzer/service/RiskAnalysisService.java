package com.example.fraudriskanalyzer.service;

import com.example.fraudriskanalyzer.model.AnalysisDocument;
import com.example.fraudriskanalyzer.model.AnalysisResult;
import com.example.fraudriskanalyzer.repository.AnalysisRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class RiskAnalysisService {

    private final AnalysisRepository analysisRepository;
    private final AiServiceClient aiServiceClient;

    public RiskAnalysisService(
            AnalysisRepository analysisRepository,
            AiServiceClient aiServiceClient) {
        this.analysisRepository = analysisRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public AnalysisResult analyze(String type, String input) {
        // Real model inference happens in the Python AI service. If that service
        // is unavailable or its model artifacts are missing, do not save a fake result.
        AiServiceClient.AiAnalysisResponse ai = aiServiceClient.analyze(type, input);
        String timestamp = ai.timestamp() == null || ai.timestamp().isBlank()
                ? Instant.now().toString()
                : ai.timestamp();

        // Avoid storing the full base64 QR image in MongoDB. The AI service returns
        // a safe display label for QR input and the decoded content separately.
        String displayInput = ai.input() == null || ai.input().isBlank() ? input : ai.input();

        AnalysisDocument document = new AnalysisDocument();
        document.setType(type);
        document.setInput(displayInput);
        document.setRiskScore(ai.riskScore());
        document.setRiskLevel(ai.riskLevel());
        document.setScamCategory(ai.scamCategory());
        document.setPredictionLabel(ai.predictionLabel());
        document.setConfidence(ai.confidence());
        document.setModelVersion(ai.modelVersion());
        document.setDecodedContent(ai.decodedContent());
        document.setQrContentType(ai.qrContentType());
        document.setReasons(ai.reasons());
        document.setRecommendations(ai.recommendations());
        document.setStatus("done");
        document.setTimestamp(timestamp);

        AnalysisDocument saved = analysisRepository.save(document);

        AnalysisResult result = new AnalysisResult();
        result.setId(saved.getId());
        result.setType(type);
        result.setInput(displayInput);
        result.setRiskScore(ai.riskScore());
        result.setRiskLevel(ai.riskLevel());
        result.setScamCategory(ai.scamCategory());
        result.setPredictionLabel(ai.predictionLabel());
        result.setConfidence(ai.confidence());
        result.setModelVersion(ai.modelVersion());
        result.setDecodedContent(ai.decodedContent());
        result.setQrContentType(ai.qrContentType());
        result.setReasons(ai.reasons());
        result.setRecommendations(ai.recommendations());
        result.setTimestamp(timestamp);
        return result;
    }
}
