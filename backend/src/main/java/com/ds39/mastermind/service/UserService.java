package com.ds39.mastermind.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.ds39.mastermind.entity.Users;
import com.ds39.mastermind.repository.UserRepo;

import java.util.List;

@Service
public class UserService {

    @Autowired
    UserRepo userRepo;
    
    public Users submitMetaDataOfUser(Users user) {
        return userRepo.save(user);
    }
    
    public Users displayUserMetaData(String userid) {
        return userRepo.findByUserId(userid);
    }

    public List<Users> searchUsersByUsername(String username) {
        return userRepo.findByUserNameContainingIgnoreCase(username);
    }
}