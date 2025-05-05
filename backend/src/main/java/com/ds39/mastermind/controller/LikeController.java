// D:\skillProto\backend\src\main\java\com\pafproject\skillshare\Controller\LikeController.java
package com.ds39.mastermind.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ds39.mastermind.service.LikeService;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/likes")
public class LikeController {
    
    @Autowired
    LikeService likeService;
    
    @PostMapping("/{postId}/{userId}")
    public Map<String, Object> toggleLike(@PathVariable("postId") String postId, @PathVariable("userId") String userId) {
        boolean isLiked = likeService.toggleLike(postId, userId);
        int likeCount = likeService.getLikeCount(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("liked", isLiked);
        response.put("likeCount", likeCount);
        
        return response;
    }
    
    @GetMapping("/{postId}/{userId}")
    public Map<String, Object> getLikeStatus(@PathVariable("postId") String postId, @PathVariable("userId") String userId) {
        boolean isLiked = likeService.hasUserLikedPost(postId, userId);
        int likeCount = likeService.getLikeCount(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("liked", isLiked);
        response.put("likeCount", likeCount);
        
        return response;
    }
}
