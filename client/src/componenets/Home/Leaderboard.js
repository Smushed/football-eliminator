import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { withRouter } from 'react-router-dom';

import './leaderBoardStyle.css'

class Leaderboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userList: [],
            loading: false,
        };
    };

    componentDidMount() {
        if (typeof this.props.season !== `undefined` && this.props.season !== false) { // season here because it's the last prop we pass in. Probably not the best way
            this.getDataForLeaderboard(this.props.week, this.props.season);
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            this.getDataForLeaderboard(this.props.week, this.props.season);
        };
    };

    componentWillUnmount() {
        //TODO Fix this when the user gets off the homepage before it loads, there is a memory leak because the leaderboard data still comes in
        //https://codepen.io/dashtinejad/pen/Lxejpq
    }

    //Must break out these requests into individual functions so axios can do them async
    getAllUsers() {
        return axios.get(`/api/getAllUsers`);
    };

    getAllRosters(season) {
        if (season === ``) {
            return;
        };
        return axios.get(`/api/getAllRosters/${season}`);
    };

    getDataForLeaderboard = (week, season) => {
        this.setState({ loading: true });

        //Handling if this was called too early
        if (season === ``) { return };
        axios.get(`/api/getLeaderboard/${this.props.groupId}/${season}`)
            .then(res => {
                this.setState({ loading: false, userList: res.data });
            });
    };

    redirect = (userId) => {
        const redirectValue = '/roster/' + userId;

        this.props.history.push(redirectValue);
    };

    render() {
        const columns = [
            { Header: `Username`, accessor: `UN`, show: true },
            { Header: `email`, accessor: `E`, show: true },
            { Header: `Last Week's Score`, accessor: `WS[${(this.props.week - 1).toString()}]`, show: true },
            { Header: `Total Score`, accessor: `TS`, show: true }];

        const defaultSorted = [{ id: 'totalScore', desc: true }];
        return (
            <div>
                <ReactTable
                    data={this.state.userList}
                    columns={columns}
                    defaultSorted={defaultSorted}
                    loading={this.state.loading}
                    defaultPageSize={20}
                    className="-highlight textCenter"

                    //TODO Enable an on click to have a pop up to view their weekly stats
                    getTdProps={(state, rowInfo) => {
                        return {
                            onClick: () => {
                                if (!rowInfo) { return };
                                this.props.userClicked(rowInfo.original.userId, rowInfo.original.username)
                            }
                        };
                    }}
                />
            </div>
        )
    };
};

export default withRouter(Leaderboard);
