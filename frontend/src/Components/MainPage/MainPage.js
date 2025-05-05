import React, { Component } from 'react';
import "./MainPage.css";
import Post from '../Post/Post';
import uploadImage from "../../images/upload.png";
import CreatePostModal from '../CreatePostModal/CreatePostModal';

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            postArray: [],
            showModal: false
        };
    }

    componentDidMount() {
        this.getPost();
    }

    getPost = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        
        let fetchUrl = 'http://localhost:8080/post';
        if (searchQuery) {
            fetchUrl = `http://localhost:8080/post/search?query=${encodeURIComponent(searchQuery)}`;
        }

        fetch(fetchUrl)
            .then(response => response.json())
            .then(data => {
                this.setState({ postArray: data });
            });
    }

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal });
    }

    handleModalClose = (shouldRefresh) => {
        this.setState({ showModal: false });
        if (shouldRefresh) {
            this.getPost();
        }
    }

    render() {

        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        const hasSearch = !!searchQuery;

        return (
            <div>
                <div className="mainpage__container">
                    <div className="mainpage__divider"></div>
                    <div className="fileupload">
                        <div 
                            className="create-post-button"
                            onClick={this.toggleModal}
                        >
                            <img 
                                className="mainpage__uploadicon" 
                                src={uploadImage} 
                                alt="Upload" 
                            />
                            <span>Share some skills</span>
                        </div>
                    </div>
                    <div className="mainpage__divider"></div>
                </div>
                
                {this.state.postArray.length > 0 ? (
                    this.state.postArray.map((item) => (
                        <Post 
                            key={item.postId}
                            id={item.postId}
                            userName={item.userName}
                            postImages={item.imagePaths}
                            postVideos={item.videoPaths}
                            likes={item.likeCount}
                            caption={item.caption}
                            hashtags={item.hashtags}
                        />
                    ))
                ) : hasSearch ? (
                    <div className="no-posts-message">
                        No posts found matching your search
                    </div>
                ) : null}

                {this.state.showModal && 
                    <CreatePostModal 
                        onClose={this.handleModalClose} 
                        userData={JSON.parse(localStorage.getItem("users"))}
                    />
                }
            </div>
        );
    }
}

export default MainPage;