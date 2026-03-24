package com.globaltalent.portal.repository;

import com.azure.spring.data.cosmos.repository.CosmosRepository;
import com.azure.spring.data.cosmos.repository.Query;
import com.globaltalent.portal.model.Candidate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends CosmosRepository<Candidate, String> {

    // Simple custom query to find candidates containing a specific skill in their
    // skills array
    @Query("SELECT * FROM c WHERE ARRAY_CONTAINS(c.skills, @skill, true)")
    List<Candidate> findBySkill(String skill);

    // Fallback simple search via Title if needed
    List<Candidate> findByTitleContainingIgnoreCase(String title);
}
