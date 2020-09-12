import React, { Component } from 'react';
import { List, Collapse, Alert, Card, Col, Row, Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import "./stylesheets/MusicSegment.css";

const { Panel } = Collapse;


class MusicSegment extends Component {
    state = {
        data: []
    }

    componentDidMount() {
        this.mapData();
    }

    componentDidUpdate(prevProps){
        if(this.props.translatedLyric != prevProps.translatedLyric){
            this.mapData();
        }
    }

    mapData(){
        let temp = [];
        this.props.data.map((t, i) => {
            temp.push({
                title: t.songTitle,
                songUrl: t.songUrl,
                description: t.artistName,
                albumImages: t.artistImages,
                previewUrl: t.previewUrl,
                popularity: t.popularity,
                lyric: t.lyric,
                translatedLyric: (this.props.translatedLyric !== null) ? this.props.translatedLyric[i] : <Spin className="Loading" indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />} />
            })
        })

        this.setState({
            data: temp
        })
    }

    render() {
        return (
            <div className="music-segment" >
                <List
                    itemLayout="vertical"
                    size="medium"
                    dataSource={this.state.data}
                    renderItem={item => (
                        <List.Item
                            key={item.title}
                            extra={<img alt={item.title} src={item.albumImages} width={200} />}
                        >
                            <List.Item.Meta
                                title={<h2><a href={item.songUrl}>{item.title}</a></h2>}
                                description={<p>{item.description}</p>}
                            />

                            {(item.previewUrl != null) ?
                                <audio controls src={item.previewUrl} /> :
                                <Alert message="Sorry, preview for this track is not available." type="info" />}

                            {(item.lyric != null) ?
                                <Collapse>
                                    <Panel header="Lyric" key={item.title}>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Card title="English" bordered={false}>
                                                    {item.lyric}
                                                </Card>
                                            </Col>
                                            <Col span={12}>
                                                <Card title={this.props.translatedLanguage} bordered={false}>
                                                    { (this.props.translatedLyricLoading !== true) ? item.translatedLyric : <Spin className="Loading" indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />} />}
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Panel>
                                </Collapse> :
                                <Alert message="Sorry, lyric for this track is not available." type="info" />
                            }

                        </ List.Item>
                    )}

                />
            </div>
        );
    }
}

export default MusicSegment;