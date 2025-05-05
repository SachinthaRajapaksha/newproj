import React, { Component } from 'react';
import "../LoginPage/LoginPage.css";
import { auth, signInWithEmailAndPassword } from "../firebase"; // Import the function

class SignIN extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            emailId: '',
            password: ''
        };
    }

    login = () => {
        signInWithEmailAndPassword(auth, this.state.emailId, this.state.password) // Correct v9 syntax
            .then((userCredential) => {
                const user = userCredential.user;
                localStorage.setItem("users", JSON.stringify(user));
                window.location.reload();
            })
            .catch((error) => {
                console.error("Login error:", error.message);
                alert(`Login failed: ${error.message}`); // Show error to user
            });
    };

    render() { 
        return ( 
            <div>
                <input 
                    className="logipage__text" 
                    onChange={(event) => this.setState({ emailId: event.target.value })} 
                    type="text" 
                    placeholder="Phone number, username, or email" 
                />
                <input 
                    className="logipage__text" 
                    onChange={(event) => this.setState({ password: event.target.value })} 
                    type="password" 
                    placeholder="Password" 
                />
                <button className="login__button" onClick={this.login}>Log In</button>
            </div> 
        );
    }
}
 
export default SignIN;