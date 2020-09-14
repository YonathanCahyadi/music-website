import React, { Component } from 'react';
import './App.css';
import Login from "./components/Login";
import Home from "./components/Home";
import Error from "./components/Error";

const axios = require('axios');

const SPOTIFY_SECRET = process.env.REACT_APP_SPOTIFY_SECRET;
const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CALLBACK_URL = process.env.REACT_APP_CALLBACK_URL;




class App extends Component {

  state = {
    access_token: null,
    refresh_token: null,
    pageStatus: true
  }

  constructor() {
    super();
  }

  componentDidMount() {

    // Get the of the url param
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get("code");
    // check if access token is already in the session storeage
    let access_token = sessionStorage.getItem('access-token');
    if (access_token) { // if already exist set the state to the existing access token
      this.setState({
        access_token: access_token
      })
    } else { // else get the access token from the spotify API
      this.getAccessToken(code);
    }
  }

  // function to get the access token from the sportify API
  getAccessToken(code) {
    // contruct the necesarry information
    const token_url = "https://accounts.spotify.com/api/token?" +
      "grant_type=authorization_code" +
      "&code=" + code +
      "&redirect_uri=" + CALLBACK_URL;

    const authorization = Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_SECRET).toString('base64');
    const headers = {
      headers: {
        'Authorization': `Basic ${authorization}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    // get the access token and refresh token
    axios.post(token_url, null, headers)
      .then((response) => {
        if (response.status === 200) { // If everythings is fine
          const { access_token, refresh_token } = response.data;
          // store the access token and refresh token
          sessionStorage.setItem("access-token", access_token);
          sessionStorage.setItem("refresh-token", refresh_token);
          this.setState({
            access_token: access_token,
            refresh_token: refresh_token
          }, () => {
            window.location.search = '';
          })
        } else { // If there is something wrong with Spotify API response
          this.setState({
            pageStatus: false
          })
        }
      }).catch((e) => { // if there is an error when getting the response form the Spotify API
        this.setState({
          pageStatus: false
        })
      });

  }



  render() {
    // only show the Home Page if everything is OK
    // If somethings gone wrong show the Error Page
    let page = <Error comeback_url={CALLBACK_URL} />
    if ((this.state.pageStatus === true) && (this.state.access_token !== null)) {
      page = <Home access_token={this.state.access_token} refresh_token={this.state.refresh_token} />
    }

    return (
      <div className="App">
        {/** Take user to the Home page only if user already authenticated */}
        {(this.state.access_token === null) ?
          <Login client_id={SPOTIFY_CLIENT_ID} callback_url={CALLBACK_URL} /> : page
        }
      </div>
    );
  }
}

export default App;
