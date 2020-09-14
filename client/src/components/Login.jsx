import React, { Component } from 'react';
import { Button } from 'antd';
import "./stylesheets/Login.css"
import SpotifyLogo from './resources/spotify-logo.png';





class Login extends Component {

    constructor() {
        super();
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    handleButtonClick() {
        // Construct the required URL
        const AUTHORIZATION_URL = "https://accounts.spotify.com/authorize?" +
            "client_id=" + this.props.client_id +
            "&response_type=code" +
            "&redirect_uri=" + this.props.callback_url;
        
        // redirect to spotify login page
        window.location.href = AUTHORIZATION_URL;
    }

    render() {
        return (
            <div>
                <div>
                    <img className="image" alt="spotify-logo" src={SpotifyLogo} />
                </div>
                <div className="login-button">
                    <Button type="primary" onClick={this.handleButtonClick}>Login</Button>
                </div>
            </div>
        );
    }
}

export default Login;