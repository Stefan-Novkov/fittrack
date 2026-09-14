package com.example.demo.controller;
import com.example.demo.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {
    private final WorkoutRepository workoutRepository;
    private final UserService userService;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        long total = workoutRepository.findByUserIdOrderByWorkoutDateDesc(user.getId()).size();
        return ResponseEntity.ok(Map.of(
                "totalWorkouts", total,
                "username", user.getUsername()
        ));
    }
}
