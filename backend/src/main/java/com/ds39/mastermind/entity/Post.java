package com.ds39.mastermind.entity;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;

@Entity(name="Post")
public class Post {
    @Id
    @GeneratedValue
    private int Id;
    private String postId;
    private String userId;
    private String userName;
    
    @ElementCollection
    @CollectionTable(name = "post_images", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "image_path")
    private List<String> imagePaths = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "post_videos", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "video_path")
    private List<String> videoPaths = new ArrayList<>();
    
    private Timestamp timeStamp;
    private int likeCount;
    
    @Column(length = 1000)
    private String caption;
    private String hashtags;
    
    // Add pinned field
    private boolean pinned = false;

    public Post() {
        super();
    }

    public Post(int id, String postId, String userId, List<String> imagePaths, List<String> videoPaths, 
                Timestamp timeStamp, int likeCount, String caption, String hashtags, boolean pinned) {
        super();
        Id = id;
        this.postId = postId;
        this.userId = userId;
        this.imagePaths = imagePaths;
        this.videoPaths = videoPaths;
        this.timeStamp = timeStamp;
        this.likeCount = likeCount;
        this.caption = caption;
        this.hashtags = hashtags;
        this.pinned = pinned;
    }
    
    // Add getters and setters for pinned field
    public boolean isPinned() {
        return pinned;
    }
    
    public void setPinned(boolean pinned) {
        this.pinned = pinned;
    }
    
    // Existing getters and setters
    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getHashtags() {
        return hashtags;
    }

    public void setHashtags(String hashtags) {
        this.hashtags = hashtags;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getId() {
        return Id;
    }

    public void setId(int id) {
        Id = id;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getImagePaths() {
        return imagePaths;
    }

    public void setImagePaths(List<String> imagePaths) {
        this.imagePaths = imagePaths;
    }

    public List<String> getVideoPaths() {
        return videoPaths;
    }

    public void setVideoPaths(List<String> videoPaths) {
        this.videoPaths = videoPaths;
    }

    public Timestamp getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(Timestamp timeStamp) {
        this.timeStamp = timeStamp;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }
}
