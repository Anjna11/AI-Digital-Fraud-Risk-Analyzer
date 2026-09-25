package com.example.fraudriskanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "analyses")
public class AnalysisDocument {

    @Id
    private String id;

    private String type;
    private String input;
    private int riskScore;
    private String riskLevel;
    private String scamCategory;
    private List<String> reasons;
    private List<String> recommendations;
    private String status;
    private String timestamp;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getScamCategory() { return scamCategory; }
    public void setScamCategory(String scamCategory) { this.scamCategory = scamCategory; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}