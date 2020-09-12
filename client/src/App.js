import React, { Component } from 'react';
import './App.css';
import Login from "./components/Login";
import Home from "./components/Home";

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
    let access_token = sessionStorage.getItem('access-token');
    if (access_token) {
      this.setState({
        access_token: access_token
      })
    }else{
      this.getAccessToken(code);
    }
  }

  getAccessToken(code) {
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
        if (response.status === 200) {
          const { access_token, refresh_token } = response.data;
          // store the access token
          sessionStorage.setItem("access-token", access_token);
          sessionStorage.setItem("refresh-token", refresh_token);
          this.setState({
            access_token: access_token,
            refresh_token: refresh_token
          }, () =>{
            window.location.search = '';
          })
        } else {
          this.setState({
            pageStatus: false
          })
        }
      }).catch((e) => { // if there is an error
        this.setState({
          pageStatus: false
        })
      });

  }



  render() {
    let page = <p>Error ...</p>
    if ((this.state.pageStatus === true) && (this.state.access_token !== null)) {
      page = <Home access_token={this.state.access_token} refresh_token={this.state.refresh_token} />
    }

    return (
      <div className="App">
        {(this.state.access_token === null) ?
          <Login client_id={SPOTIFY_CLIENT_ID} callback_url={CALLBACK_URL} /> : page
        }
      </div>
    );
  }
}

export default App;
