import React, { Component } from 'react';
import MusicSegment from "./MusicSegment";
import { Menu, Spin } from "antd";
import { HomeOutlined, LoadingOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
const axios = require('axios').default;


const SERVER_MUSIC_URL = process.env.REACT_APP_SERVER_MUSIC_URL;

class Home extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentPage: "Home",
            userInfo: null,
            userName: null,
            userAvatar: null,
            data: null
        };

        this.handleMenuClick = this.handleMenuClick.bind(this);

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

        axios.get(SERVER_MUSIC_URL, config)
        .then((res) => {

           this.setState({
                data: res.data.data

           });
           
        });
    }


    // make an API call
    componentDidMount(){
        this.getData();
    }

    handleMenuClick(e){
        this.setState({
            currentPage: e.key
        });
    }

    

    render() { 

        return ( 
            <div className="home">
                <Menu onClick={this.handleMenuClick} selectedKeys={this.state.currentPage} mode="horizontal">
                    <Menu.Item key="Home" icon={<HomeOutlined />}>Home</Menu.Item>
                </Menu>
                {(this.state.data != null) ? <MusicSegment data={this.state.data} /> : <Spin indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />}/>}
            </div>
         );
    }
}
 
export default Home;