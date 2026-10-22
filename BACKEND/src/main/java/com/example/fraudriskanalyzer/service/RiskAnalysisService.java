package com.example.fraudriskanalyzer.service;

import com.example.fraudriskanalyzer.model.AnalysisDocument;
import com.example.fraudriskanalyzer.model.AnalysisResult;
import com.example.fraudriskanalyzer.repository.AnalysisRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RiskAnalysisService {

    private final AnalysisRepository analysisRepository;
    private final AtomicInteger idCounter = new AtomicInteger(100);

    // Spring automatically hands us the repository here
    public RiskAnalysisService(AnalysisRepository analysisRepository) {
        this.analysisRepository = analysisRepository;
    }

    public AnalysisResult analyze(String type, String input) {
        String timestamp = Instant.now().toString();

        // TODO: replace with real AI analysis call
        int riskScore = 0;
        String riskLevel = "safe";
        String scamCategory = null;
        List<String> reasons = List.of("AI analysis not connected yet");
        List<String> recommendations = List.of();

        // 1. Save to MongoDB
        AnalysisDocument document = new AnalysisDocument();
        document.setType(type);
        document.setInput(input);
        document.setRiskScore(riskScore);
        document.setRiskLevel(riskLevel);
        document.setScamCategory(scamCategory);
        document.setReasons(reasons);
        document.setRecommendations(recommendations);
        document.setStatus("done"); // will become "pending" once AI call is async later
        document.setTimestamp(timestamp);

        AnalysisDocument saved = analysisRepository.save(document);
        // saved.getId() now contains the auto-generated MongoDB _id

        // 2. Build the response sent back to frontend
        AnalysisResult result = new AnalysisResult();
        result.setId(saved.getId()); // use the real MongoDB id, not a fake counter
        result.setType(type);
        result.setInput(input);
        result.setRiskScore(riskScore);
        result.setRiskLevel(riskLevel);
        result.setScamCategory(scamCategory);
        result.setReasons(reasons);
        result.setRecommendations(recommendations);
        result.setTimestamp(timestamp);

        return result;
    }
}