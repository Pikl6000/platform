package com.platform.demo.repository;

import com.platform.demo.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MySqlRep extends JpaRepository<User, Integer> {

}
