package com.platform.demo.services;

//import com.platform.demo.models.User;
import com.platform.demo.repository.MySqlRep;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final MySqlRep userRepository;

    @Autowired
    public UserService(MySqlRep userRepository) {
        this.userRepository = userRepository;
    }


}