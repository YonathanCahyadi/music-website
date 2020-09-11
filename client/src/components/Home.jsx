import React, { Component } from 'react';
import MusicSegment from "./MusicSegment";
import { Menu, Spin, Button, Select } from "antd";
import { HomeOutlined, LoadingOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import "./stylesheets/Home.css";
const axios = require('axios').default;
const supportedLang = require('./resources/SupportedLanguage.json');


const SERVER_MUSIC_URL = process.env.REACT_APP_SERVER_MUSIC_URL;

const { Option } = Select;

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: "Home",
            pageStatus: true,
            data: null,
            translatedLanguage: "Bahasa Indonesia",
            translatedLanguageKey: "id"
        };

        this.handleRefreshButton = this.handleRefreshButton.bind(this);
        this.handleLanguage = this.handleLanguage.bind(this);
    }


    // get the data from the server side
    getData() {
        // construct the required parameters for the server side
        const config = {
            params: {
                access_token: this.props.access_token,
                refresh_token: this.props.refresh_token,
            }
        }

        // request data from the server
        axios.get(SERVER_MUSIC_URL, config)
            .then((res) => {
                if (res.status === 400) { // if someting went wrong
                    this.setState({
                        pageStatus: false
                    })
                } else { // if everythins is OK

                    // get lyric translation
                    

                    // store the data in the session storage
                    sessionStorage.setItem("music-data", JSON.stringify(res.data.data))
                    // store the data in the state
                    this.setState({
                        data: res.data.data,
                    });
                }
            });

    }


    // make an API call
    componentDidMount() {

        // check the session storage
        let data = sessionStorage.getItem("music-data");
        if (data) {
            this.setState({
                data: JSON.parse(data)
            });
        } else {
            this.getData();
        }



    }



    handleRefreshButton() {
        this.setState({
            data: null
        }, () => {
            this.getData();
        })
    }

    handleLanguage(value, { key }) {
        this.setState({
            translatedLanguage: value,
            translatedLanguageKey: key
        })
    }

    render() {
        let page = <Spin className="Loading" indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />} />;
        if (this.state.pageStatus === false) {
            page = <p>Oops, somethings went wrong ...</p>;
        }

        return (
            <div className="home">
                {/* Menubar */}
                <Menu selectedKeys={this.state.currentPage} mode="horizontal">
                    <Menu.Item key="Home" icon={<HomeOutlined />}>Home</Menu.Item>
                    <Button type="primary" onClick={this.handleRefreshButton}>Refresh Recommendation</Button>
                    {/* Language Selection for Lyric */}
                    <Select defaultValue={this.state.translatedLanguage} style={{ width: 200, paddingLeft: "20px" }} onChange={this.handleLanguage}>
                        {supportedLang.data.map((lang) => {
                            return <Option value={lang.name} key={lang.code}>{lang.name}</Option>
                        })}
                    </Select>
                </Menu>

                {/* Content */}
                {((this.state.data !== null) && (this.state.pageStatus !== false)) ? <MusicSegment data={this.state.data} translatedLanguage={this.state.translatedLanguage} /> : page}
            </div>
        );
    }
}

export default Home;