package com.platform.demo;

import com.platform.demo.controllers.UserRequest;
import com.platform.demo.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Scanner;

//@Component
//public class ConsoleApp implements CommandLineRunner {
//
//    private final UserService userService;
//
//    @Autowired
//    public ConsoleApp(UserService userService) {
//        this.userService = userService;
//    }
//
//    @Override
//    public void run(String... args) {
//        Scanner scanner = new Scanner(System.in);
//
//        System.out.println("Zadaj meno: ");
//        String name = scanner.nextLine();
//
//        System.out.println("Zadaj priezvisko: ");
//        String lastname = scanner.nextLine();
//
//        System.out.println("Zadaj email: ");
//        String email = scanner.nextLine();
//
//        System.out.println("Zadaj heslo: ");
//        String password = scanner.nextLine();
//
//        // Vytvorenie UserRequest objektu s použitím vstupných údajov
//        UserRequest userRequest = new UserRequest();
//        userRequest.setName(name);
//        userRequest.setLastname(lastname);
//        userRequest.setEmail(email);
//        userRequest.setPassword(password);
//
//        // Použitie inštancie userService na pridanie používateľa do databázy
//        userService.addUser(userRequest.getName(),userRequest.getLastname(),userRequest.getEmail(),userRequest.getPassword());
//    }
//}


