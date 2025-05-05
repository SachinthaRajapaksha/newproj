import React, { Component } from 'react';
import "./NavBar.css";
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import insta_log from "../../images/logo3.jpg";
import home from "../../images/home.svg";
import message from "../../images/message.svg";
import find from "../../images/find.svg";
import react from "../../images/love.svg";
import Avatar from '@mui/material/Avatar';
import pp from "../../images/pp1.png";
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: '',
            searchResults: [],
            showSuggestions: false,
            activeIcon: 'home'
        };
    }

    handleSearchChange = (e) => {
        const query = e.target.value;
        this.setState({ 
            searchQuery: query, 
            showSuggestions: query.length > 0 
        });

        if (query.length > 0) {
            fetch(`http://localhost:8080/users/search?username=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    this.setState({ searchResults: data });
                })
                .catch(error => {
                    console.error("Error searching users:", error);
                });
        } else {
            this.setState({ searchResults: [] });
        }
    };

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            const query = this.state.searchQuery.trim();
            if (query) {
                window.location.href = `/?search=${encodeURIComponent(query)}`;
            }
        }
    };

    handleLogout = () => {
        signOut(auth)
            .then(() => {
                localStorage.removeItem("users");
                window.location.reload();
            })
            .catch((error) => {
                console.error("Logout error:", error);
            });
    };

    setActiveIcon = (iconName) => {
        this.setState({ activeIcon: iconName });
    };

    renderSuggestions = () => {
        if (!this.state.showSuggestions) return null;

        return (
            <div className="search-suggestions">
                {this.state.searchResults.length === 0 ? (
                    <div className="no-results-message">
                        <div>No users found for "{this.state.searchQuery}"</div>
                    </div>
                ) : (
                    this.state.searchResults.map(user => (
                        <Link 
                            key={user.userId} 
                            to={`/profile/${user.userId}`} 
                            className="suggestion-item"
                            onClick={() => this.setState({ showSuggestions: false })}
                        >
                            <Avatar src={user.profileImage} className="suggestion-avatar" />
                            <div className="suggestion-details">
                                <div className="suggestion-username">{user.userName}</div>
                                <div className="suggestion-name">{user.name}</div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        );
    };

    render() { 
        return ( 
            <div className="navbar">
                <div className="navbar-container">
                    <div className="navbar-left">
                        <Link to="/" className="logo-link">
                            <img className="logo" src={insta_log} alt="App Logo" />
                        </Link>
                    </div>
                    
                    <div className="navbar-center">
                        <div className="search-container">
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search users or hashtags..." 
                                value={this.state.searchQuery}
                                onChange={this.handleSearchChange}
                                onKeyPress={this.handleKeyPress}
                            />
                            {this.renderSuggestions()}
                        </div>
                    </div>
                    
                    <div className="navbar-right">
                        <Link 
                            to="/" 
                            className={`nav-icon ${this.state.activeIcon === 'home' ? 'active' : ''}`}
                            onClick={() => this.setActiveIcon('home')}
                        >
                            <img src={home} alt="Home" />
                        </Link>
                        <Link 
                            to="/messages" 
                            className={`nav-icon ${this.state.activeIcon === 'message' ? 'active' : ''}`}
                            onClick={() => this.setActiveIcon('message')}
                        >
                            <img src={message} alt="Messages" />
                        </Link>
                        <Link 
                            to="/explore" 
                            className={`nav-icon ${this.state.activeIcon === 'explore' ? 'active' : ''}`}
                            onClick={() => this.setActiveIcon('explore')}
                        >
                            <img src={find} alt="Explore" />
                        </Link>
                        <Link 
                            to="/activity" 
                            className={`nav-icon ${this.state.activeIcon === 'activity' ? 'active' : ''}`}
                            onClick={() => this.setActiveIcon('activity')}
                        >
                            <img src={react} alt="Activity" />
                        </Link>
                        <Link 
                            to="/profile" 
                            className={`nav-icon ${this.state.activeIcon === 'profile' ? 'active' : ''}`}
                            onClick={() => this.setActiveIcon('profile')}
                        >
                            <Avatar src={pp} className="profile-avatar" />
                        </Link>
                        <button 
                            onClick={this.handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default NavBar;