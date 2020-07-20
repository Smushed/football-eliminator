import React, { Component } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import { RosterDisplay } from '../Roster';
import { WeekSearch } from '../Roster/SearchDropdowns';

import './homeStyle.css';
import Leaderboard from './Leaderboard';

//Stateful component to allow the grouplist to properly populate
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userDisplayed: '',
            userIdDisplayed: '',
            groupRosters: [],
            weekSelect: 1,
            groupPositions: [],
            leaderBoard: []
        };
    };

    componentDidMount() {
        if (this.props.week && this.props.season) {
            this.setState({ weekSelect: this.props.week });
            this.getLeaderBoard(this.props.season, this.props.week, this.props.group._id);
            // this.getAllRostersForGroup(this.props.season, this.props.week, this.props.group._id)
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.week !== prevProps.week) {
            this.setState({ weekSelect: this.props.week });
            this.getLeaderBoard(this.props.season, this.props.week, this.props.group._id);
            // this.getAllRostersForGroup(this.props.season, this.props.week, this.props.group._id)
        };
    };

    getAllRostersForGroup(season, week, groupId) {
        axios.get(`/api/getAllRostersForGroup/${season}/${week}/${groupId}`)
            .then(res => {
                this.setState({ groupRosters: res.data.rosters, groupPositions: res.data.groupPositions });
                return;
            });
    };

    // TODO START HERE WITH THE LEADERBOARD
    getLeaderBoard(season, week, groupId) {
        axios.get(`/api/getLeaderboard/${groupId}/${season}`)
            .then(res => {
                console.log(res)
                this.getAllRostersForGroup(season, this.props.week, groupId);
                // this.setState({ loading: false, userList: res.data });
                return;
            });
    };

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    customSeasonWeekSearch = (e) => {
        e.preventDefault();

        //Need to clear the playerIds when switching weeks. If not the program makes the array an array of undefined
        const userRoster = {};

        this.setState({ userRoster })

        this.getRoster(this.state.userIdDisplayed, this.state.weekSelect, this.state.userDisplayed);
    };

    render() {
        return (
            <div className='wrapper'>
                <Leaderboard
                    week={this.props.week}
                    season={this.props.season}
                    groupId={this.props.group._id}
                />
                <div className='groupRosterWrapper'>
                    {this.state.groupRosters.map(roster =>
                        <div key={roster.UID} className='homePageRoster'>
                            <div className='userNameOnRoster'>{roster.UN}</div>
                            <RosterDisplay
                                groupPositions={this.state.groupPositions}
                                roster={roster.R}
                                UN={roster.UN}
                                UID={roster.UID}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);