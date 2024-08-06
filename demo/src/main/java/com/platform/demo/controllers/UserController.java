package com.platform.demo.controllers;

import com.platform.demo.models.User;
import com.platform.demo.repository.MySqlRep;
import com.platform.demo.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {
    @Autowired
    private MySqlRep mysql;

    private final UserService userService;

    @GetMapping("/get-all-users")
    public List<User> getAllUsers() {
        return mysql.findAll();
    }

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
}
