package com.stock.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;


import com.stock.management.model.User;
import com.stock.management.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public User registerUser(@RequestBody @NonNull User user) {
        return userService.saveUser(user);
    }

    @GetMapping("/{username}")
    public User getUser(@PathVariable @NonNull String username) {
    return userService.findByUsername(username);    }
}