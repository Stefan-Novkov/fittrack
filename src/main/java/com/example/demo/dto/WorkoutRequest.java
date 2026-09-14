package com.example.demo.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkoutRequest {
    private String name;
    private String notes;
    private LocalDateTime workoutDate;
    private List<WorkoutExerciseRequest> exercises;

    @Data
    public static class WorkoutExerciseRequest{
        private Long exerciseId;
        private Integer sets;
        private Integer reps;
        private Double weight;
    }
}
