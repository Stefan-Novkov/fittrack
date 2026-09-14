package com.example.demo;

import com.example.demo.entity.Exercise;
import com.example.demo.repository.ExerciseRepository;
import com.example.demo.service.ExerciseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExerciseServiceTest {

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private ExerciseService exerciseService;

    private Exercise exercise;

    @BeforeEach
    void setUp() {
        exercise = new Exercise();
        exercise.setId(1L);
        exercise.setName("Bench Press");
        exercise.setMuscleGroup("Chest");
        exercise.setDescription("Flat bench press with barbell");
    }

    @Test
    void createExercise_ShouldSaveAndReturnExercise() {
        when(exerciseRepository.save(exercise)).thenReturn(exercise);

        Exercise result = exerciseService.createExercise(exercise);

        assertNotNull(result);
        assertEquals("Bench Press", result.getName());
        verify(exerciseRepository, times(1)).save(exercise);
    }

    @Test
    void getAllExercises_ShouldReturnList() {
        when(exerciseRepository.findAll()).thenReturn(List.of(exercise));

        List<Exercise> result = exerciseService.getAllExercises();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("Bench Press", result.get(0).getName());
    }

    @Test
    void searchExercises_ShouldReturnMatchingExercises() {
        when(exerciseRepository.findByNameContainingIgnoreCase("bench"))
                .thenReturn(List.of(exercise));

        List<Exercise> result = exerciseService.searchExercises("bench");

        assertFalse(result.isEmpty());
        assertEquals("Bench Press", result.get(0).getName());
    }

    @Test
    void searchExercises_WhenNoMatch_ShouldReturnEmptyList() {
        when(exerciseRepository.findByNameContainingIgnoreCase("squat"))
                .thenReturn(List.of());

        List<Exercise> result = exerciseService.searchExercises("squat");

        assertTrue(result.isEmpty());
    }

    @Test
    void getExerciseById_WhenExists_ShouldReturnExercise() {
        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(exercise));

        Exercise result = exerciseService.getExerciseById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Bench Press", result.getName());
    }

    @Test
    void getExerciseById_WhenNotExists_ShouldThrowException() {
        when(exerciseRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> exerciseService.getExerciseById(99L));

        assertEquals("Exercise not found", ex.getMessage());
    }
}