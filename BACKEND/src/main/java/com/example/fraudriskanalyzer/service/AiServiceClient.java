package com.example.fraudriskanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * HTTP client for the Python/FastAPI machine-learning service.
 * The Python service owns model loading and prediction; Spring Boot remains
 * responsible for the public API and persistence.
 */
@Component
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(
            RestClient.Builder builder,
            @Value("${ai.service.base-url:http://localhost:8000}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    public AiPrediction analyze(String type, String value) {
        String path = switch (type) {
            case "url" -> "/analyze/url";
            case "message" -> "/analyze/message";
            case "qr" -> "/analyze/qr";
            default -> throw new IllegalArgumentException("Unsupported analysis type: " + type);
        };

        try {
            JsonNode body = restClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("value", value))
                    .retrieve()
                    .body(JsonNode.class);

            if (body == null) {
                throw new AiServiceUnavailableException("AI service returned an empty response.");
            }

            int score = body.path("riskScore").asInt(-1);
            if (score < 0 || score > 100) {
                throw new AiServiceUnavailableException("AI service returned an invalid risk score.");
            }

            String level = body.path("riskLevel").asText("");
            if (level.isBlank()) {
                level = levelFromScore(score);
            }

            return new AiPrediction(
                    score,
                    normalizeLevel(level, score),
                    textOrNull(body.path("scamCategory")),
                    readStringList(body.path("reasons")),
                    readStringList(body.path("recommendations"))
            );
        } catch (RestClientException ex) {
            throw new AiServiceUnavailableException(
                    "Could not reach the AI service. Start AI-SERVICE on port 8000 and try again.", ex);
        }
    }

    private static String textOrNull(JsonNode node) {
        return node.isMissingNode() || node.isNull() || node.asText().isBlank()
                ? null : node.asText();
    }

    private static List<String> readStringList(JsonNode node) {
        List<String> values = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(item -> {
                if (!item.isNull() && !item.asText().isBlank()) {
                    values.add(item.asText());
                }
            });
        }
        return values;
    }

    private static String normalizeLevel(String level, int score) {
        return switch (level.toLowerCase()) {
            case "safe", "low" -> score < 30 ? "safe" : levelFromScore(score);
            case "medium", "moderate" -> "medium";
            case "high" -> "high";
            case "critical", "very high" -> "critical";
            default -> levelFromScore(score);
        };
    }

    private static String levelFromScore(int score) {
        if (score >= 85) return "critical";
        if (score >= 60) return "high";
        if (score >= 30) return "medium";
        return "safe";
    }

    public record AiPrediction(
            int riskScore,
            String riskLevel,
            String scamCategory,
            List<String> reasons,
            List<String> recommendations) {
    }

    public static class AiServiceUnavailableException extends RuntimeException {
        public AiServiceUnavailableException(String message) {
            super(message);
        }

        public AiServiceUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
