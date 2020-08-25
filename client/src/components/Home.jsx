import React, { Component } from 'react';
const axios = require('axios').default;

class Home extends Component {

    constructor(props){
        super(props);
        this.state = {
            data: null
        };
    }

    // get the data from the server side
    getData(){
        // construct the required parameters for the server side
        // GET request
        const config = { 
            params: {
                access_token: this.props.access_token,
                refresh_token: this.props.refresh_token
            }
        }

        axios.get("http://localhost:3000/api/music", config)
        .then((res) => {

           console.log(res.data)
           
        })
    }

    // make an API call
    componentDidMount(){
        this.getData();
    }

    render() { 
        return ( 
            <div className="home">
                <p1>{this.state.data}</p1>
            </div>
         );
    }
}
 
export default Home;