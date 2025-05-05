package com.ds39.mastermind.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.ds39.mastermind.entity.Users;

import java.util.List;

@Repository
public interface UserRepo extends CrudRepository<Users, Integer> {
    Users save(Users user);
    Users findByUserId(String userId);
    List<Users> findByUserNameContainingIgnoreCase(String username);
}