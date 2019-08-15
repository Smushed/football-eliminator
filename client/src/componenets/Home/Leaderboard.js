import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class Leaderboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userList: []
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

    getDataForLeaderboard = (week, season) => {
        //TODO When done testing set the season back to the input
        //TODO All below there are dummySeason and dummyWeeks. Be sure to change this
        const dummySeason = `2018-2019-regular`;
        const dummyWeek = 3;
        let userList = [];
        axios.all([this.getAllUsers(), this.getAllRosters(dummySeason)])
            .then(axios.spread(async (allUsers, rosterData) => {
                const userList = []; //userList is going to be saved to state and iterated upon
                //Now that we have the userList and all the user's rosters
                for (let i = 0; i < allUsers.data.length; i++) {
                    //userDetail is going to be each element in the array
                    const userDetail = { userId: allUsers.data[i]._id, username: allUsers.data[i].username, email: allUsers.data[i].email }
                    console.log(userDetail)
                    console.log(rosterData.data[allUsers.data[i]._id])
                    // Here we count down from the week we are currently on to grab all the players that the user has used
                    const previousWeekPlayers = {};
                    for (let ii = dummyWeek; ii > 0; ii--) {
                        //For this we drill into the object of roster data that was returned from the DB.
                        //We look up this user's roster through their id which is a key
                        previousWeekPlayers[ii] = rosterData.data[allUsers.data[i]._id].roster[ii]
                    }
                    const weekScore = await axios.get(`/api/weeklyRosterScore`,
                        { params: { userRoster: previousWeekPlayers, week: dummyWeek, season: dummySeason } });
                    console.log(weekScore)
                }
                //Now that I have all the data I can go throught the rosterData and parse it for player's stats.
                //I need to feed in the week that it is currently in and iterate over all the previous weeks and pull down their stats.
                //I can probably do something on the client side to end up with an object as detailed below
                //data: {
                //1:[#,#,#,#,#,#,#,#],
                //2:[#,#,#,#,#] Where each week is an array of numbers. The player roster that I can then iterate over
                //}
                //To get this I should iterate over rosterData and compile all the players in all the previous weeks and crunch them down
            }));
    }

    render() {
        return (
            <div>{this.props.week} {this.props.season}</div>
        )
    };
};

export default (Leaderboard);
