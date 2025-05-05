import React, { Component } from 'react';
import "./SignUp.css";
import { storage, auth, createUserWithEmailAndPassword } from '../firebase';

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            emailId: '',
            name: '',
            userName: '',
            password: ''
        };
    }

    newSignUp = () => {
        createUserWithEmailAndPassword(auth, this.state.emailId, this.state.password)
            .then((userCredential) => {
                const user = userCredential.user;

                const payload = {
                    userId: user.uid,
                    userName: this.state.userName,
                    name: this.state.name,
                    profileImage: ""
                };

                fetch("http://localhost:8080/users", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem("users", JSON.stringify(user));
                    window.location.reload();
                })
                .catch(error => {
                    console.error("Error saving user:", error);
                });

            })
            .catch((error) => {
                console.error("Sign up error:", error.message);
            });
    }

    render() { 
        return ( 
            <div>
                <input 
                    className="logipage__text" 
                    onChange={(event) => this.setState({ emailId: event.currentTarget.value })} 
                    type="text" 
                    placeholder="Mobile number or Email" 
                />
                <input 
                    className="logipage__text" 
                    onChange={(event) => this.setState({ name: event.currentTarget.value })} 
                    type="text" 
                    placeholder="Full Name" 
                />
                <input 
                    className="logipage__text" 
                    onChange={(event) => this.setState({ userName: event.currentTarget.value })} 
                    type="text" 
                    placeholder="Username" 
                />
                <input 
                    className="logipage__text" 
                    onChange={(event) => this.setState({ password: event.currentTarget.value })} 
                    type="password" 
                    placeholder="Password" 
                />
                <button 
                    className="login__button" 
                    onClick={this.newSignUp}
                >
                    Sign up
                </button>
            </div>
        );
    }
}
 
export default SignUp;
