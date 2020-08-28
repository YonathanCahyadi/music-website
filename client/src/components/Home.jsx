import React, { Component } from 'react';
import MusicSegment from "./MusicSegment";
import { Menu, Spin, Avatar } from "antd";
import { HomeOutlined, LoadingOutlined, UserOutlined  } from "@ant-design/icons";
import "antd/dist/antd.css";
const axios = require('axios').default;


const SERVER_MUSIC_URL = "http://localhost:3000/api/music";
const SERVER_USER_URL = "http://localhost:3000/api/user";

class Home extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentPage: "Home",
            userAvatar: <UserOutlined /> ,
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

           }, () => console.log(this.state.data));
           
        });
    }

    getUserInfo(){
        const config = { 
            params: {
                access_token: this.props.access_token,
                refresh_token: this.props.refresh_token
            }
        }

        axios.get(SERVER_USER_URL, config)
             .then((res) => {
                this.setState({
                        userInfo: res.data.info,
                        userName: res.data.info.userName,
                        userAvatar: res.data.info.userAvatar
                }, () => console.log(this.state.userInfo) );
             });
    }

    // make an API call
    componentDidMount(){
        this.getData();
        this.getUserInfo();
    }

    handleMenuClick(e){
        this.setState({
            currentPage: e.key
        });
    }

    

    render() { 

        let menu;
        if(this.userAvatar != null){
            menu = <Menu.Item key={this.state.userName} icon={<Avatar src={this.state.userAvatar} shape="circle" />}  >{this.state.userName}</Menu.Item>
        }else {
            menu = <Menu.Item key={this.state.userName} icon={<UserOutlined />} >{this.state.userName}</Menu.Item>
        }

        return ( 
            <div className="home">
                <Menu onClick={this.handleMenuClick} selectedKeys={this.state.currentPage} mode="horizontal">
                    <Menu.Item key="Home" icon={<HomeOutlined />}>Home</Menu.Item>
                    { menu }
                </Menu>
                {(this.state.data != null) ? <MusicSegment data={this.state.data} /> : <Spin indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />}/>}
            </div>
         );
    }
}
 
export default Home;