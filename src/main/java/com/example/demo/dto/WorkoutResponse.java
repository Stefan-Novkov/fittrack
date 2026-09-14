package com.example.demo.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkoutResponse {
    private Long id;
    private String name;
    private String notes;
    private LocalDateTime workoutDate;
    private LocalDateTime createdAt;
    private List<ExerciseDetail> exercises;

    @Data
    public static class ExerciseDetail {
        private Long id;
        private String exerciseName;
        private String muscleGroup;
        private Integer sets;
        private Integer reps;
        private Double weight;
    }
}
