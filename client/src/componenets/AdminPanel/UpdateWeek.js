import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';


class UpdateWeek extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEditor: false,
            playerEditor: false,
            weekSelect: 1,
            seasonSelect: ``
        };
    };
    render() {
        return (
            <div>

            </div>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AdminPanel);