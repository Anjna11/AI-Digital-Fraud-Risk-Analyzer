package com.example.fraudriskanalyzer.controller;

import com.example.fraudriskanalyzer.model.AnalysisResult;
import com.example.fraudriskanalyzer.service.RiskAnalysisService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analyze")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final RiskAnalysisService riskAnalysisService;

    public AnalysisController(RiskAnalysisService riskAnalysisService) {
        this.riskAnalysisService = riskAnalysisService;
    }

    @PostMapping("/url")
    public AnalysisResult analyzeUrl(@RequestBody AnalyzeRequest request) {
        return riskAnalysisService.analyze("url", request.value());
    }

    @PostMapping("/message")
    public AnalysisResult analyzeMessage(@RequestBody AnalyzeRequest request) {
        return riskAnalysisService.analyze("message", request.value());
    }

    @PostMapping("/qr")
    public AnalysisResult analyzeQr(@RequestBody AnalyzeRequest request) {
        return riskAnalysisService.analyze("qr", request.value());
    }

    public record AnalyzeRequest(String value) {}
}