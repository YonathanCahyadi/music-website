import React, { Component }  from 'react';
import './App.css';
import Login from "./components/Login";
import Home from "./components/Home";


class App extends Component {
  
  constructor(){
    super();
    const param = this.getHashParams();
    this.state = {
      access_token: param.access_token,
      refresh_token: param.refresh_token
    }
  }


  // get the passed access token and refresh token form the server side
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
}

  
  render(){
    return (
      <div className="App">
        {(this.state.access_token === undefined) ? 
        <Login /> : 
        <Home access_token={this.state.access_token}  refresh_token={this.state.refresh_token}/>}   
      </div>
    );
  }
}

export default App;
