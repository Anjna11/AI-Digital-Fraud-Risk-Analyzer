package com.example.fraudriskanalyzer.repository;

import com.example.fraudriskanalyzer.model.AnalysisDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AnalysisRepository extends MongoRepository<AnalysisDocument, String> {
}