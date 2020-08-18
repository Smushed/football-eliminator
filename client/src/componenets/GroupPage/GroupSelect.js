import React, { Component } from 'react';
import { withAuthorization } from '../Session';

class GroupSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    };
    render() {
        return (
            <div>Select Group</div>
        )
    };
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(GroupSelect);