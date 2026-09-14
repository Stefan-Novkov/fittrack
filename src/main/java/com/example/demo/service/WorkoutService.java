package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.entity.Workout;
import com.example.demo.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public Workout createWorkout(Workout workout){
        return workoutRepository.save(workout);
    }

    public List<Workout> getUserWorkouts(Long userId){
        return workoutRepository.findByUserIdOrderByWorkoutDateDesc(userId);
    }

    public Workout getWorkoutById(Long id){
        return workoutRepository.findById(id).orElseThrow(() -> new RuntimeException("Workout not found"));
    }

    public void deleteWorkout(Long id, User currentUser){
        Workout workout = getWorkoutById(id);
        if(!workout.getUser().getId().equals(currentUser.getId())){
            throw new RuntimeException("User not the same");
        }
        workoutRepository.delete(workout);
    }

}
