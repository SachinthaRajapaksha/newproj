import React, { Component } from 'react';
import "./Profile.css";
import Post from "../Post/Post";
import { Avatar } from '@mui/material';
import coverPlaceholder from "../../images/cover-placeholder.jpg";
import avatarPlaceholder from "../../images/avatar-placeholder.png";
import EditPostModal from "../EditPostModal/EditPostModal";
import DeleteConfirmModal from "../DeleteConfirmModal/DeleteConfirmModal";
import KebabMenu from "../KebabMenu/KebabMenu";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: null,
            posts: [],
            showEditModal: false,
            showDeleteModal: false,
            selectedPost: null,
            loading: true
        };
    }

    componentDidMount() {
        this.fetchUserData();
        this.fetchUserPosts();
    }

    fetchUserData = () => {
        const userData = JSON.parse(localStorage.getItem("users"));
        if (userData && userData.uid) {
            fetch(`http://localhost:8080/users/${userData.uid}`)
                .then(response => response.json())
                .then(data => {
                    this.setState({ userData: data });
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                });
        }
    }

    fetchUserPosts = () => {
        const userData = JSON.parse(localStorage.getItem("users"));
        if (userData && userData.uid) {
            fetch(`http://localhost:8080/post/user/${userData.uid}`)
                .then(response => response.json())
                .then(data => {
                    this.setState({ posts: data, loading: false });
                })
                .catch(error => {
                    console.error("Error fetching user posts:", error);
                    this.setState({ loading: false });
                });
        }
    }

    handleEditPost = (post) => {
        this.setState({
            showEditModal: true,
            selectedPost: post
        });
    }

    handlePinPost = (post) => {
        const userData = JSON.parse(localStorage.getItem("users"));
        if (userData && userData.uid) {
          fetch(`http://localhost:8080/post/pin/${post.postId}/${userData.uid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          .then(response => {
            if (response.ok) {
              // Refresh posts after pinning/unpinning
              this.fetchUserPosts();
            } else {
              console.error("Error pinning/unpinning post");
            }
          })
          .catch(error => {
            console.error("Error:", error);
          });
        }
      }
    
      
    handleCloseEditModal = (refreshNeeded) => {
        this.setState({ showEditModal: false });
        if (refreshNeeded) {
            this.fetchUserPosts();
        }
    }

    handleDeletePost = (post) => {
        this.setState({
          showDeleteModal: true,
          selectedPost: post
        });
      }
      

    handleCloseDeleteModal = (deleted) => {
        this.setState({ showDeleteModal: false });
        if (deleted) {
            this.fetchUserPosts();
        }
    }

    render() {
        const { userData, posts, loading } = this.state;
        const currentUser = JSON.parse(localStorage.getItem("users"));
        
        return (
            <div className="profile__page-container">
                {/* Back button positioned at top left */}
                <div className="profile__back-button-container">
                    <Link to="/" className="profile__back-button">
                        <ArrowBackIcon />
                        <span>Back to Home</span>
                    </Link>
                </div>
                
                <div className="profile__container">
                    <div className="profile__header">
                        <div className="profile__cover">
                            <img src={coverPlaceholder} alt="Cover" className="cover-image" />
                        </div>
                        <div className="profile__info">
                            <Avatar 
                                src={avatarPlaceholder} 
                                className="profile__avatar"
                            />
                            <div className="profile__details">
                                <h2 className="profile__username">{userData?.userName || "User"}</h2>
                                <p className="profile__name">{userData?.name || ""}</p>
                            </div>
                        </div>
                    </div>
                    <hr className="profile__separator" />
                    <div className="profile__content">
                        <div className="profile__posts">
                            <h3 className="profile__section-title">Posts</h3>
                            
                            {loading ? (
                                <div className="profile__loading">Loading posts...</div>
                            ) : posts.length === 0 ? (
                                <div className="profile__no-posts">No posts yet</div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post.postId} className="profile__post-container">
                                        <div className="post__header-with-options">
                                        {post.pinned && (
                                            <div className="post__pinned-indicator">
                                            <span className="pinned-icon">📌</span>
                                            <span>Pinned Post</span>
                                            </div>
                                        )}
                                            <Post
                                                id={post.postId}
                                                userName={post.userName}
                                                postImages={post.imagePaths || []}
                                                postVideos={post.videoPaths || []}
                                                caption={post.caption}
                                                hashtags={post.hashtags}
                                                likes={post.likeCount}
                                                profileImage={avatarPlaceholder}
                                            />
                                            
                                            {currentUser && currentUser.uid === post.userId && (
                                                <div className="post__kebab-menu">
                                                    <KebabMenu 
                                                        onEdit={() => this.handleEditPost(post)}
                                                        onDelete={() => this.handleDeletePost(post)}
                                                        onPin={() => this.handlePinPost(post)}
                                                        isPinned={post.pinned}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                
                {this.state.showEditModal && (
                    <EditPostModal 
                        post={this.state.selectedPost}
                        userData={currentUser}
                        onClose={this.handleCloseEditModal}
                    />
                )}
                
                {this.state.showDeleteModal && (
                    <DeleteConfirmModal 
                        postId={this.state.selectedPost?.postId}
                        onClose={this.handleCloseDeleteModal}
                    />
                )}
            </div>
        );
    }
}

export default Profile;
