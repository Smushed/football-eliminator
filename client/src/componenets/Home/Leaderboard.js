import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class Leaderboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userList: [],
            loading: false,
        };
    };

    componentDidMount() {
        if (typeof this.props.season !== `undefined` && this.props.season == true) { // season here because it's the last prop we pass in. Probably not the best way
            this.getDataForLeaderboard(this.props.week, this.props.season);
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            console.log(`didupdate`, this.props.season)
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
        return axios.get(`/api/getAllRosters/${season}`);
    };

    getDataForLeaderboard = (week, season) => {
        this.setState({ loading: true });
        let userList = [];
        axios.all([this.getAllUsers(), this.getAllRosters(season)])
            .then(axios.spread(async (allUsers, rosterData) => {
                //Now that we have the userList and all the user's rosters
                for (let i = 0; i < allUsers.data.length; i++) {
                    //userDetail is going to be each element in the array
                    const userDetail = { userId: allUsers.data[i]._id, username: allUsers.data[i].username, email: allUsers.data[i].email };
                    // Here we count down from the week we are currently on to grab all the players that the user has used
                    const previousWeekPlayers = {};
                    console.log(rosterData.data)
                    for (let ii = week; ii > 0; ii--) {
                        //For this we drill into the object of roster data that was returned from the DB.
                        //We look up this user's roster through their id which is a key
                        previousWeekPlayers[ii] = rosterData.data[allUsers.data[i]._id].roster[ii];
                    };

                    //We then take the roster that we populated above and send it to the DB
                    const weekScores = await axios.get(`/api/weeklyRosterScore`,
                        { params: { userRoster: previousWeekPlayers, week, season } });

                    let totalScore = 0;
                    for (let iii = week; iii > 0; iii--) {
                        //Now iterate over the weeks and pull out the total score
                        totalScore += parseFloat(weekScores.data[iii]); //Must be Float because there are decimals in the scores
                    };
                    userDetail.weekScores = weekScores.data;
                    userDetail.totalScore = totalScore;

                    userList.push(userDetail);
                };
                this.setState({ userList, loading: false });
            }));
    };

    render() {
        const columns = [
            { Header: `Username`, accessor: `username`, show: true },
            { Header: `email`, accessor: `email`, show: true },
            { Header: `Last Week's Score`, accessor: `weekScores[${this.props.week}]`, show: true },
            { Header: `Total Score`, accessor: `totalScore`, show: true }];

        const defaultSorted = [{ id: 'totalScore', desc: true }];
        return (
            <div>
                <ReactTable
                    data={this.state.userList}
                    columns={columns}
                    defaultSorted={defaultSorted}
                    loading={this.state.loading}
                    filterable
                    defaultPageSize={20}
                    className="-highlight"

                //TODO Enable an on click to have a pop up to view their weekly stats
                // getTdProps={(state, rowInfo) => {
                //     return {
                //         onClick: () => {
                //             console.log(rowInfo.original)
                //             this.setState({ selectedUser: rowInfo.original._id })
                //         }
                //     }
                // }}
                /></div>
        )
    };
};

export default (Leaderboard);
