package com.globaltalent.portal.model;

import com.azure.spring.data.cosmos.core.mapping.Container;
import com.azure.spring.data.cosmos.core.mapping.PartitionKey;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Container(containerName = "Candidates")
public class Candidate {

    @Id
    private String id;

    private String fullName;

    @PartitionKey
    private String title;

    private List<String> skills;

    private String resumeUrl;
}
