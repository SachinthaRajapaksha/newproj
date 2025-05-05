// D:\skillProto\backend\src\main\java\com\pafproject\skillshare\Repository\LikeRepo.java
package com.ds39.mastermind.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.ds39.mastermind.entity.Like;

@Repository
public interface LikeRepo extends CrudRepository<Like, Integer> {
    
    boolean existsByPostIdAndUserId(String postId, String userId);
    
    @Transactional
    void deleteByPostIdAndUserId(String postId, String userId);
    
    int countByPostId(String postId);
    
    Like findByPostIdAndUserId(String postId, String userId);
}
