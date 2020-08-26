import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

class GroupSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupList: [],
        };
    };
    componentDidMount() {
        this.getGroupList()
    };
    getGroupList = async () => {
        const groupList = await axios.get(`/api/getGroupList`);
        console.log(groupList)
        this.setState({ groupList })
    };
    render() {
        return (
            <div>Select Group</div>
        )
    };
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(GroupSelect);