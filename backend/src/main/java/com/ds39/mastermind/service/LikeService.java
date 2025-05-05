// D:\skillProto\backend\src\main\java\com\pafproject\skillshare\Service\LikeService.java
package com.ds39.mastermind.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ds39.mastermind.entity.Like;
import com.ds39.mastermind.entity.Post;
import com.ds39.mastermind.repository.LikeRepo;
import com.ds39.mastermind.repository.PostRepo;

import java.util.Optional;

@Service
public class LikeService {
    
    @Autowired
    LikeRepo likeRepo;
    
    @Autowired
    PostRepo postRepo;
    
    @Transactional
    public boolean toggleLike(String postId, String userId) {
        boolean hasLiked = likeRepo.existsByPostIdAndUserId(postId, userId);
        
        if (hasLiked) {
            // Unlike the post - find and delete the specific like entry
            likeRepo.deleteByPostIdAndUserId(postId, userId);
            updatePostLikeCount(postId);
            return false;
        } else {
            // Like the post
            Like like = new Like(postId, userId);
            likeRepo.save(like);
            updatePostLikeCount(postId);
            return true;
        }
    }
    
    private void updatePostLikeCount(String postId) {
        int likeCount = likeRepo.countByPostId(postId);
        
        // Find the post and update like count
        Optional<Post> postOptional = postRepo.findAll()
                .stream()
                .filter(p -> p.getPostId().equals(postId))
                .findFirst();
        
        if (postOptional.isPresent()) {
            Post post = postOptional.get();
            post.setLikeCount(likeCount);
            postRepo.save(post);
        }
    }
    
    public boolean hasUserLikedPost(String postId, String userId) {
        return likeRepo.existsByPostIdAndUserId(postId, userId);
    }
    
    public int getLikeCount(String postId) {
        return likeRepo.countByPostId(postId);
    }
}
