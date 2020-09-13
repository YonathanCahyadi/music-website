import React, { Component } from 'react';
import MusicSegment from "./MusicSegment";
import { Menu, Spin, Button, Select } from "antd";
import { HomeOutlined, LoadingOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import "./stylesheets/Home.css";
import Error from './Error';
const axios = require('axios').default;
const supportedLang = require('./resources/SupportedLanguage.json');


const SERVER_MUSIC_URL = process.env.REACT_APP_SERVER_MUSIC_URL;
const CALLBACK_URL = process.env.REACT_APP_CALLBACK_URL;

const { Option } = Select;

class Home extends Component {

    state = {
        currentPage: "Home",
        pageStatus: true,
        data: null,
        translatedLanguage: sessionStorage.getItem("translated-language") ? sessionStorage.getItem("translated-language") : "Bahasa Indonesia",
        translatedLanguageKey: sessionStorage.getItem("translated-language-key") ? sessionStorage.getItem("translated-language-key") : "id",
        translatedLyricLoading: true,
        translatedLyric: null
    };

    constructor() {
        super();
        this.handleRefreshButton = this.handleRefreshButton.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
    }

    // make an API call
    componentDidMount() {

        // check the session storage
        let data = sessionStorage.getItem("music-data");
        let translatedLyric = sessionStorage.getItem("music-translated-lyric");


        if (data && translatedLyric) { // use data from the session
            this.setState({
                data: JSON.parse(data),
                translatedLyric: JSON.parse(translatedLyric),
                translatedLyricLoading: false
            });
        } else { // get the data from the server
            this.getData();
        }
    }


    // get the data from the server side and get the translated lyric from google API
    getData() {
        // construct the required parameters for the server side
        const config = {
            params: {
                access_token: this.props.access_token
            }
        }

        // request data from the server
        return axios.get(SERVER_MUSIC_URL, config)
            .then((res) => {
                if (res.status === 200) {// if everythings is OK

                    // get lyric translation
                    this.getTranslationAndSave(res.data.data);
                    // store the data in the session storage
                    sessionStorage.setItem("music-data", JSON.stringify(res.data.data))
                    // store the data in the state
                    this.setState({
                        data: res.data.data
                    });
                    
                } else { // if something went wrong
                    this.setState({
                        pageStatus: false
                    })

                }
            })
    }

    // get translated lyric based on provided data
    getTranslation(data) {
        // https://codelabs.developers.google.com/codelabs/cloud-translation-intro/index.html#0

        // get lyric translation
        const TRANSLATE_API_KEY = process.env.REACT_APP_TRANSLATE_API_KEY;
        const URL_TRANSLATE = `https://translation.googleapis.com/language/translate/v2?target=${this.state.translatedLanguageKey}&key=${TRANSLATE_API_KEY}&q=`;

        return Promise.all(data.map((d) => {
            return axios.get(URL_TRANSLATE + encodeURI(d.lyric)).then(({ data }) =>
                data.data.translations[0].translatedText
            )
        }))
    }

    // get translated lyric and save the result in session storage and state
    getTranslationAndSave(data) {
        this.getTranslation(data) // get the new lyric translation
            .then((translatedLyric) => {
                // set the new translated lyric
                sessionStorage.setItem("music-translated-lyric", JSON.stringify(translatedLyric));
                this.setState({
                    translatedLyric: translatedLyric,
                    translatedLyricLoading: false
                })
            })
    }


    // this function will get an new recommendation song for the user
    handleRefreshButton() {
        this.setState({
            data: null,
            translatedLyric: null,
            translatedLyricLoading: true
        }, () => {
            this.getData();
        })
    }

    // this function will handle the language change
    // will update the selected language and get a new translation 
    handleLanguageChange(value, { key }) {
        // update the session storage
        sessionStorage.setItem("translated-language", value);
        sessionStorage.setItem("translated-language-key", key);

        // update the dropdown option
        this.setState({
            translatedLanguage: value,
            translatedLanguageKey: key,
            translatedLyric: null,
            translatedLyricLoading: true
        }, () => {
            // get the new translated lyric
            this.getTranslationAndSave(this.state.data);
        })
    }

    render() {
        // show page only if everything is OK
        // if something is wrong show the Error Page
        let page = <Spin className="Loading" indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />} />;
        if (this.state.pageStatus === false) {
            page = <Error comeback_url={CALLBACK_URL} />;
        }

        return (
            <div className="home">
                {/* Menubar */}
                <Menu selectedKeys={this.state.currentPage} mode="horizontal">
                    <Menu.Item key="Home" icon={<HomeOutlined />}>Home</Menu.Item>
                    <Button type="primary" onClick={this.handleRefreshButton}>Refresh Recommendation</Button>
                    {/* Language Selection for Lyric */}
                    <Select defaultValue={this.state.translatedLanguage} style={{ width: 200, paddingLeft: "20px" }} onChange={this.handleLanguageChange}>
                        {supportedLang.data.map((lang) => {
                            return <Option value={lang.name} key={lang.code}>{lang.name}</Option>
                        })}
                    </Select>
                </Menu>

                {/* Content */}
                {((this.state.data !== null) && (this.state.pageStatus !== false)) ?
                    <MusicSegment data={this.state.data} translatedLanguage={this.state.translatedLanguage} translatedLyric={this.state.translatedLyric} translatedLyricLoading={this.state.translatedLyricLoading} /> : page}
            </div>
        );
    }
}

export default Home;