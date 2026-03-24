package com.globaltalent.portal.controller;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.globaltalent.portal.model.Candidate;
import com.globaltalent.portal.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired(required = false)
    private CandidateRepository candidateRepository;

    @Autowired(required = false)
    private BlobServiceClient blobServiceClient;

    private final String containerName = "resumes";

    @PostMapping("/upload")
    public ResponseEntity<Candidate> uploadResume(
            @RequestPart("candidate") Candidate candidate,
            @RequestPart("resume") MultipartFile resumeFile) {

        try {
            String blobName = UUID.randomUUID().toString() + "-" + resumeFile.getOriginalFilename();
            String resumeUrl = uploadToBlobStorage(blobName, resumeFile);

            candidate.setId(UUID.randomUUID().toString());
            candidate.setResumeUrl(resumeUrl);

            if (candidateRepository != null) {
                Candidate saved = candidateRepository.save(candidate);
                return ResponseEntity.status(HttpStatus.CREATED).body(saved);
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).body(candidate);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Candidate>> searchCandidates(@RequestParam(required = false) String skills) {
        if (candidateRepository == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        List<Candidate> results;
        if (skills != null && !skills.trim().isEmpty()) {
            results = candidateRepository.findBySkill(skills.trim());
        } else {
            Iterable<Candidate> all = candidateRepository.findAll();
            results = new ArrayList<>();
            all.forEach(results::add);
        }
        return ResponseEntity.ok(results);
    }

    private String uploadToBlobStorage(String blobName, MultipartFile file) throws IOException {
        if (blobServiceClient == null)
            return "mock-url/" + blobName;

        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        if (!containerClient.exists()) {
            containerClient.create();
        }

        BlobClient blobClient = containerClient.getBlobClient(blobName);
        blobClient.upload(file.getInputStream(), file.getSize(), true);
        return blobClient.getBlobUrl();
    }
}
