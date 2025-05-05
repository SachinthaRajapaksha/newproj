// D:\skillProto\backend\src\main\java\com\pafproject\skillshare\Entity\Like.java
package com.ds39.mastermind.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"postId", "userId"})
})
public class Like {
    
    @Id
    @GeneratedValue
    private int id;
    
    private String postId;
    private String userId;
    
    public Like() {
        super();
    }
    
    public Like(String postId, String userId) {
        this.postId = postId;
        this.userId = userId;
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
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
}
