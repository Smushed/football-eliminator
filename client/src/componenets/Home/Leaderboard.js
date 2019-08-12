import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class Leaderboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            this.getDataForLeaderboard(this.props.week, this.props.season);
        };
    };

    //Must break out these requests into individual functions so axios can do them async
    getAllUsers() {
        return axios.get(`/api/getAllUsers`);
    }

    getDataForLeaderboard(week, season) {
        let userList = [];
        // TODO Start here and add a userRoster Grabber
        axios.all([this.getAllUsers()])
            .then(axios.spread((allUsers) => {
                userList = allUsers.data;
            }));
    }

    render() {
        return (
            <div>{this.props.week} {this.props.season}</div>
        )
    };
};

export default (Leaderboard);
