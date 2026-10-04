package com.example.jira.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.jira.model.Issue;

public interface IssueRepository extends MongoRepository<Issue, ObjectId> {
    List<Issue> findByProjectId(String projectId);
}