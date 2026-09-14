package com.example.demo.controller;

import com.example.demo.dto.WorkoutRequest;
import com.example.demo.dto.WorkoutResponse;
import com.example.demo.entity.User;
import com.example.demo.entity.Workout;
import com.example.demo.entity.WorkoutExercise;
import com.example.demo.service.ExerciseService;
import com.example.demo.service.UserService;
import com.example.demo.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;
    private final UserService userService;
    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> getWorkouts(Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        List<WorkoutResponse> responses = workoutService
                .getUserWorkouts(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(
            @RequestBody WorkoutRequest request,
            Authentication auth) {
        User user = userService.findByUsername(auth.getName());

        Workout workout = new Workout();
        workout.setName(request.getName());
        workout.setNotes(request.getNotes());
        workout.setWorkoutDate(request.getWorkoutDate() != null
                ? request.getWorkoutDate() : LocalDateTime.now());
        workout.setUser(user);

        if (request.getExercises() != null) {
            List<WorkoutExercise> exercises = request.getExercises().stream()
                    .map(ex -> {
                        WorkoutExercise we = new WorkoutExercise();
                        we.setExercise(exerciseService.getExerciseById(ex.getExerciseId()));
                        we.setSets(ex.getSets());
                        we.setReps(ex.getReps());
                        we.setWeight(ex.getWeight());
                        we.setWorkout(workout);
                        return we;
                    }).collect(Collectors.toList());
            workout.setWorkoutExercises(exercises);
        }

        return ResponseEntity.ok(toResponse(workoutService.createWorkout(workout)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutResponse> getWorkout(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(workoutService.getWorkoutById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkout(@PathVariable Long id, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        workoutService.deleteWorkout(id, user);
        return ResponseEntity.ok().build();
    }

    private WorkoutResponse toResponse(Workout workout) {
        WorkoutResponse response = new WorkoutResponse();
        response.setId(workout.getId());
        response.setName(workout.getName());
        response.setNotes(workout.getNotes());
        response.setWorkoutDate(workout.getWorkoutDate());
        response.setCreatedAt(workout.getCreatedAt());

        if (workout.getWorkoutExercises() != null) {
            List<WorkoutResponse.ExerciseDetail> details = workout
                    .getWorkoutExercises().stream()
                    .map(we -> {
                        WorkoutResponse.ExerciseDetail detail =
                                new WorkoutResponse.ExerciseDetail();
                        detail.setId(we.getId());
                        detail.setExerciseName(we.getExercise().getName());
                        detail.setMuscleGroup(we.getExercise().getMuscleGroup());
                        detail.setSets(we.getSets());
                        detail.setReps(we.getReps());
                        detail.setWeight(we.getWeight());
                        return detail;
                    }).collect(Collectors.toList());
            response.setExercises(details);
        }
        return response;
    }
}