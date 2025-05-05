package com.ds39.mastermind.controller;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ds39.mastermind.entity.Post;
import com.ds39.mastermind.service.PostService;

@CrossOrigin
@RestController
@RequestMapping("/post")
public class PostController {

    @Autowired
    PostService postService;
    
    @PostMapping("")
    private Post submitUserPost(@RequestBody Post post) {
        return postService.submitPostToDataBase(post);
    }
    
    @GetMapping("")
    private ArrayList<Post> getAllPost(){
        return postService.retrivePostFromDB();
    }
    
    @GetMapping("/user/{userId}")
    private ArrayList<Post> getPostsByUser(@PathVariable("userId") String userId) {
        return postService.retrievePostsByUser(userId);
    }
    
    @DeleteMapping("/{postId}")
    private ResponseEntity<String> deletePost(@PathVariable("postId") String postId) {
        boolean result = postService.deletePost(postId);
        if (result) {
            return new ResponseEntity<>("Post deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Failed to delete post", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("")
    private Post updatePost(@RequestBody Post post) {
        return postService.updatePost(post);
    }
    
    // Add endpoint for pinning/unpinning posts
    @PutMapping("/pin/{postId}/{userId}")
    private Post togglePinPost(@PathVariable("postId") String postId, @PathVariable("userId") String userId) {
        return postService.togglePinPost(postId, userId);
    }

    @GetMapping("/search")
    private ArrayList<Post> searchPosts(@RequestParam String query) {
        return postService.searchPostsByHashtag(query);
    }
}
