package com.stock.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.stock.management.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsername(String username); 
}