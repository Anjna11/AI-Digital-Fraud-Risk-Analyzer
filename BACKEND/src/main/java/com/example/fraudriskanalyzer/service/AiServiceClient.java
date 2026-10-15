package com.example.fraudriskanalyzer.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(
            RestClient.Builder builder,
            @Value("${ai.service.base-url:http://127.0.0.1:8001}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    public AiAnalysisResponse analyze(String type, String value) {
        String endpoint = switch (type) {
            case "url" -> "/analyze/url";
            case "message" -> "/analyze/message";
            case "qr" -> "/analyze/qr";
            default -> throw new IllegalArgumentException("Unsupported analysis type: " + type);
        };

        try {
            AiAnalysisResponse response = restClient.post()
                    .uri(endpoint)
                    .body(Map.of("value", value))
                    .retrieve()
                    .body(AiAnalysisResponse.class);

            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY, "AI service returned an empty response.");
            }
            return response;
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "AI analysis is temporarily unavailable. Ensure the trained AI service is running.",
                    ex);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AiAnalysisResponse(
            String type,
            String input,
            int riskScore,
            String riskLevel,
            String scamCategory,
            String predictionLabel,
            double confidence,
            java.util.List<String> reasons,
            java.util.List<String> recommendations,
            String timestamp,
            String modelVersion,
            String decodedContent,
            String qrContentType
    ) {}
}
