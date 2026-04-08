package com.stock.management.service;

import com.stock.management.model.User;
import com.stock.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // ✅ SINGLE method (FIXED)
    public User saveUser(User user) {

    // Username already exists
    if (userRepository.findByUsername(user.getUsername()) != null) {
        throw new RuntimeException("Username already exists");
    }

    // Username validation
    if (user.getUsername().length() < 3) {
        throw new RuntimeException("Username must be at least 3 characters");
    }

    // Password validation
    if (user.getPassword().length() < 4) {
        throw new RuntimeException("Password must be at least 4 characters");
    }

    user.setPassword(passwordEncoder.encode(user.getPassword()));

    return userRepository.save(user);
    }
}