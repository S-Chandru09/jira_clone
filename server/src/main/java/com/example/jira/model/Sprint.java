package com.example.jira.model;

import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sprints")
public class Sprint {

    @Id
    private ObjectId id;

    private String name;
    private String projectId;
    private Instant startDate;
    private Instant endDate;
    private String goal;
    private String status;

public ObjectId getobjectId() {
    return id;
}

public void setId(ObjectId id) {
    this.id = id;
}
public String getName() { return name; }
public void setName(String name) { this.name = name; }

public String getProjectId() { return projectId; }
public void setProjectId(String projectId) { this.projectId = projectId; }

public Instant getStartDate() { return startDate; }
public void setStartDate(Instant startDate) { this.startDate = startDate; }

public Instant getEndDate() { return endDate; }
public void setEndDate(Instant endDate) { this.endDate = endDate; }

public String getStatus() { return status; }
public void setStatus(String status) { this.status = status; }

public String getGoal() { return goal; }
public void setGoal(String goal) { this.goal = goal; }
}