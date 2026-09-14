package com.example.demo;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void registerUser_WhenValid_ShouldSaveUser() {
        when(userRepository.existsByUsername("stefan")).thenReturn(false);
        when(userRepository.existsByEmail("stefan@test.com")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("encoded_123456");

        User savedUser = new User();
        savedUser.setUsername("stefan");
        savedUser.setEmail("stefan@test.com");
        savedUser.setPassword("encoded_123456");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.registerUser("stefan", "stefan@test.com", "123456");

        assertNotNull(result);
        assertEquals("stefan", result.getUsername());
        verify(passwordEncoder, times(1)).encode("123456");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_WhenUsernameExists_ShouldThrowException() {
        when(userRepository.existsByUsername("stefan")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.registerUser("stefan", "stefan@test.com", "123456"));

        assertEquals("Username already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerUser_WhenEmailExists_ShouldThrowException() {
        when(userRepository.existsByUsername("stefan")).thenReturn(false);
        when(userRepository.existsByEmail("stefan@test.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.registerUser("stefan", "stefan@test.com", "123456"));

        assertEquals("Email already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void findByUsername_WhenExists_ShouldReturnUser() {
        User user = new User();
        user.setUsername("stefan");
        when(userRepository.findByUsername("stefan")).thenReturn(Optional.of(user));

        User result = userService.findByUsername("stefan");

        assertNotNull(result);
        assertEquals("stefan", result.getUsername());
    }

    @Test
    void findByUsername_WhenNotExists_ShouldThrowException() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.findByUsername("nobody"));

        assertEquals("User not found", ex.getMessage());
    }
}