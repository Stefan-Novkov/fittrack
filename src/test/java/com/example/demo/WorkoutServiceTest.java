package com.example.demo;

import com.example.demo.entity.User;
import com.example.demo.entity.Workout;
import com.example.demo.repository.WorkoutRepository;
import com.example.demo.service.WorkoutService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutServiceTest {

    @Mock
    private WorkoutRepository workoutRepository;

    @InjectMocks
    private WorkoutService workoutService;

    private User user;
    private Workout workout;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("stefan");
        user.setEmail("stefan@test.com");
        user.setPassword("encoded_password");

        workout = new Workout();
        workout.setId(1L);
        workout.setName("Chest Day");
        workout.setNotes("Heavy bench press");
        workout.setWorkoutDate(LocalDateTime.now());
        workout.setUser(user);
    }

    @Test
    void createWorkout_ShouldSaveAndReturnWorkout() {
        when(workoutRepository.save(workout)).thenReturn(workout);

        Workout result = workoutService.createWorkout(workout);

        assertNotNull(result);
        assertEquals("Chest Day", result.getName());
        verify(workoutRepository, times(1)).save(workout);
    }

    @Test
    void getUserWorkouts_ShouldReturnWorkoutList() {
        when(workoutRepository.findByUserIdOrderByWorkoutDateDesc(1L))
                .thenReturn(List.of(workout));

        List<Workout> result = workoutService.getUserWorkouts(1L);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("Chest Day", result.get(0).getName());
    }

    @Test
    void getWorkoutById_WhenExists_ShouldReturnWorkout() {
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(workout));

        Workout result = workoutService.getWorkoutById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getWorkoutById_WhenNotExists_ShouldThrowException() {
        when(workoutRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> workoutService.getWorkoutById(99L));

        assertEquals("Workout not found", ex.getMessage());
    }

    @Test
    void deleteWorkout_WhenOwner_ShouldDelete() {
        when(workoutRepository.findById(1L)).thenReturn(Optional.of(workout));

        workoutService.deleteWorkout(1L, user);

        verify(workoutRepository, times(1)).delete(workout);
    }

    @Test
    void deleteWorkout_WhenNotOwner_ShouldThrowException() {
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("other");

        when(workoutRepository.findById(1L)).thenReturn(Optional.of(workout));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> workoutService.deleteWorkout(1L, otherUser));

        assertEquals("User not the same", ex.getMessage());
        verify(workoutRepository, never()).delete(any());
    }
}