import React, { Component } from 'react';
import { Button } from 'antd';
import './stylesheets/Error.css'


class Error extends Component {
    state = {  }

    constructor(){
        super()
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    handleButtonClick(){
        window.location.href = this.props.comeback_url;
    }

    render() { 
        return ( 
            <div className="Error-container">
                <h3>Somethings went wrong...</h3>
                <Button  type="primary" onClick={this.handleButtonClick}>Go Back</Button>
            </div>
         );
    }
}
 
export default Error;
