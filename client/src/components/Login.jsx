import React, { Component } from 'react';
import "./stylesheets/Login.css"
import SpotifyLogo from './resources/spotify-logo.png';

const SPOTIFY_CLIENT_ID = "86f3cd84bbeb49889050b07f94a47b81";
const SERVER_CALLBACK_URL = "http://localhost:443/api/spotify/callback";


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
                    <img className="image" src={SpotifyLogo} />
                </div>
                <div className="login-button">
                    <a className="button" href={authorization_url}> Login </a>
                </div>
            </div>
         );
    }
}
 
export default Login;