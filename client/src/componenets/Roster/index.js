import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

import { Row, Col } from 'reactstrap';

//Start here and use React DND

class Roster extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const userIDFromURL = this.props.match.params.userID;
        if (typeof userIDFromURL !== 'undefined') {
            this.getRosterData(userIDFromURL);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.userID !== prevProps.userID) {
            const userIDFromURL = this.props.match.params.userID;
            this.getRosterData(userIDFromURL);
        }
    }

    getRosterData = (userIDFromURL) => {
        if (userIDFromURL === this.props.userID) {
            console.log(`working`)
        }
    }

    render() {
        return (
            <div>
                working
            </div>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);