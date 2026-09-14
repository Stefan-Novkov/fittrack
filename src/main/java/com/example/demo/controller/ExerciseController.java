package com.example.demo.controller;

import com.example.demo.entity.Exercise;
import com.example.demo.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public ResponseEntity<List<Exercise>> getExercises(@RequestParam(required = false) String search){
        if(search != null && !search.isBlank()){
            return ResponseEntity.ok(exerciseService.searchExercises(search));
        }
        return ResponseEntity.ok(exerciseService.getAllExercises());
    }

    @PostMapping
    public ResponseEntity<Exercise> createExercise(@RequestBody Exercise exercise) {
        return ResponseEntity.ok(exerciseService.createExercise(exercise));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExercise(@PathVariable Long id){
        return ResponseEntity.ok(exerciseService.getExerciseById(id));
    }

}
