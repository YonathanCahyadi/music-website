import React, { Component } from 'react';
import "./stylesheets/Login.css"
import SpotifyLogo from './resources/spotify-logo.png';

const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const SERVER_CALLBACK_URL = process.env.REACT_APP_SERVER_CALLBACK_URL;


// Construct the required URL
const authorization_url = "https://accounts.spotify.com/authorize?" +
"client_id=" + SPOTIFY_CLIENT_ID +
"&response_type=code" +
"&redirect_uri=" + SERVER_CALLBACK_URL;


class Login extends Component {


    render() { 
        return ( 
            <div>
                <div>
                    <img className="image" alt="spotify-logo" src={SpotifyLogo} />
                </div>
                <div className="login-button">
                    <a className="button" href={authorization_url}> Login </a>
                </div>
            </div>
         );
    }
}
 
export default Login;