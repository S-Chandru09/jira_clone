package com.example.jira.controller;

import java.util.HashMap;
import java.util.Map;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.jira.model.User;
import com.example.jira.repository.UserRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class Usercontroller {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =========================
    // SIGNUP
    // =========================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {

        // Check whether the email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {

            Map<String, String> response = new HashMap<>();
            response.put("message", "Account is already present.");

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(response);
        }

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set default role
        user.setRole(
                user.getRole() == null ? "USER" : user.getRole()
        );

        // Save new user
        User savedUser = userRepository.save(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedUser);
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {

        // Find account by email
        User user = userRepository
                .findByEmail(loginRequest.getEmail())
                .orElse(null);

        // Account does not exist
        if (user == null) {

            Map<String, String> response = new HashMap<>();
            response.put("message", "Account does not exist.");

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(response);
        }

        // Check password
        boolean passwordMatches = passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword()
        );

        // Incorrect password
        if (!passwordMatches) {

            Map<String, String> response = new HashMap<>();
            response.put("message", "Incorrect password.");

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        // Login successful
        return ResponseEntity.ok(user);
    }

    // =========================
    // GET USER BY ID
    // =========================
    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {

        ObjectId objectId;

        try {
            objectId = new ObjectId(id);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid user id");
        }

        return userRepository
                .findById(objectId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =========================
    // EDIT PROFILE
    // =========================
    @PutMapping("/{id}")
    public User editProfile(
            @PathVariable String id,
            @RequestBody User updatedUser) {

        ObjectId objectId;

        try {
            objectId = new ObjectId(id);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid user id");
        }

        User user = userRepository
                .findById(objectId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(updatedUser.getName());
        user.setGroup(updatedUser.getGroup());
        user.setAvatar(updatedUser.getAvatar());

        return userRepository.save(user);
    }
}