package com.ds39.mastermind.repository;

import java.util.ArrayList;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.ds39.mastermind.entity.Post;

@Repository
public interface PostRepo extends CrudRepository<Post, Integer> {
    ArrayList<Post> findAll();
    ArrayList<Post> findByUserId(String userId);
    void deleteByPostId(String postId);
    Post findByPostId(String postId);
    ArrayList<Post> findByUserIdAndPinned(String userId, boolean pinned);
    ArrayList<Post> findByHashtagsContainingIgnoreCase(String hashtag);
}