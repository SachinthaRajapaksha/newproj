package com.ds39.mastermind.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Set;

import com.ds39.mastermind.entity.Post;
import com.ds39.mastermind.repository.PostRepo;

@Service
public class PostService {

    @Autowired
    PostRepo postRepo;

    @Autowired
    UserService userService;
    
    public Post submitPostToDataBase(Post post) {
        return postRepo.save(post);
    }
    
    public ArrayList<Post> retrivePostFromDB(){
        ArrayList<Post> postList = postRepo.findAll();
        
        for(int i=0; i<postList.size(); i++) {
            Post postItem = postList.get(i);
            postItem.setUserName(userService.displayUserMetaData(postItem.getUserId()).getUserName());
        }
        Collections.sort(postList, (a,b) -> b.getId() - a.getId());
        return postList;
    }
    
    public ArrayList<Post> retrievePostsByUser(String userId) {
        ArrayList<Post> postList = postRepo.findByUserId(userId);
        
        for(int i=0; i<postList.size(); i++) {
            Post postItem = postList.get(i);
            postItem.setUserName(userService.displayUserMetaData(postItem.getUserId()).getUserName());
        }
        
        // Sort posts: pinned first, then by ID (newest first)
        Collections.sort(postList, (a, b) -> {
            if (a.isPinned() && !b.isPinned()) return -1;
            if (!a.isPinned() && b.isPinned()) return 1;
            return b.getId() - a.getId(); // If pin status is the same, sort by ID (newest first)
        });
        
        return postList;
    }
    
    @Transactional
    public boolean deletePost(String postId) {
        try {
          postRepo.deleteByPostId(postId);
          return true;
        } catch (Exception e) {
          System.err.println("Error deleting post: " + e.getMessage());
          e.printStackTrace();
          return false;
        }
      }
      
    
    public Post updatePost(Post updatedPost) {
        Post existingPost = postRepo.findByPostId(updatedPost.getPostId());
        if (existingPost != null) {
            // Update fields but preserve the ID and pinned status
            int id = existingPost.getId();
            boolean pinned = existingPost.isPinned();
            updatedPost.setId(id);
            updatedPost.setPinned(pinned);
            return postRepo.save(updatedPost);
        }
        return null;
    }
    
    // Add method to toggle pin status
    public Post togglePinPost(String postId, String userId) {
        Post postToToggle = postRepo.findByPostId(postId);
        
        if (postToToggle == null || !postToToggle.getUserId().equals(userId)) {
            return null; // Post doesn't exist or doesn't belong to user
        }
        
        // If we're pinning the post, unpin any other pinned posts by this user
        if (!postToToggle.isPinned()) {
            ArrayList<Post> pinnedPosts = postRepo.findByUserIdAndPinned(userId, true);
            for (Post post : pinnedPosts) {
                post.setPinned(false);
                postRepo.save(post);
            }
        }
        
        // Toggle the pin status
        postToToggle.setPinned(!postToToggle.isPinned());
        return postRepo.save(postToToggle);
    }

     public ArrayList<Post> searchPostsByHashtag(String query) {
        String[] terms = query.split("\\s+");
        Set<Post> uniquePosts = new HashSet<>();
        for (String term : terms) {
            String hashtag = "#" + term.toLowerCase();
            uniquePosts.addAll(postRepo.findByHashtagsContainingIgnoreCase(hashtag));
        }
        return new ArrayList<>(uniquePosts);
    }
}
