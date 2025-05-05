import React, { Component } from 'react';
import "./InfoSection.css";
import Avatar from '@mui/material/Avatar';
import imageSrc from "../../images/pp1.png"

class InfoSection extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() { 
        return ( 
        <div>
            <div className="info__container">
                <Avatar src={imageSrc} className="info__image"/>
                <div className="info_content">
                    <div className="info_username"> Randunu Dissanayake</div>
                    <div className="info_description"> Proffesional cook</div>
                </div>
            </div>
        </div> );
    }
}
 
export default InfoSection;