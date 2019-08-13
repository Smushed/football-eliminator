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
    };

    getAllRosters(season) {
        return axios.get(`/api/getAllRosters/${season}`);
    };

    getDataForLeaderboard(week, season) {
        //TODO When done testing set the season back to the input
        const dummySeason = `2018-2019-regular`
        let userList = [];
        // TODO Start here and add a userRoster Grabber
        axios.all([this.getAllUsers(), this.getAllRosters(dummySeason)])
            .then(axios.spread((allUsers, rosterData) => {
                userList = allUsers.data;
                console.log(rosterData)
            }));
    }

    render() {
        return (
            <div>{this.props.week} {this.props.season}</div>
        )
    };
};

export default (Leaderboard);
