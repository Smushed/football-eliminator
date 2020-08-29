import React, { Component } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import { RosterDisplay } from '../Roster';
import { WeekSearch } from '../Roster/SearchDropdowns';

import './homeStyle.css';
import Leaderboard from './Leaderboard';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userDisplayed: '',
            userIdDisplayed: '',
            groupRosters: [],
            weekSelect: 1,
            weekDisplay: 1,
            groupPositions: [],
            leaderboard: []
        };
    };

    componentDidMount() {
        if (this.props.week && this.props.season) {
            this.setState({ weekSelect: this.props.week, weekDisplay: this.props.week });
            this.getLeaderBoard(this.props.season, this.props.week, this.props.group._id);
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.week !== prevProps.week) {
            this.setState({ weekSelect: this.props.week, weekDisplay: this.props.week });
            this.getLeaderBoard(this.props.season, this.props.week, this.props.group._id);
        };
    };

    getLeaderBoard(season, week, groupId) {
        //Sending true to pull back the leaderboard as well
        axios.get(`/api/getAllRostersForGroup/${season}/${week}/${groupId}/true`)
            .then(res => {
                this.setState({ groupRosters: res.data.rosters, groupPositions: res.data.groupPositions, leaderboard: res.data.leaderboard });
                return;
            });
    };

    updateRosterWeek(season, week, groupId) {
        axios.get(`/api/getAllRostersForGroup/${season}/${week}/${groupId}/false`)
            .then(res => {
                this.setState({ groupRosters: res.data.rosters, weekDisplay: week });
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

        this.updateRosterWeek(this.props.season, this.state.weekSelect, this.props.group._id);
    };

    render() {
        const weekForLeaderboard = this.props.week === 0 ? 1 : this.props.week;
        return (
            <div className='wrapper'>
                <Leaderboard
                    week={weekForLeaderboard}
                    season={this.props.season}
                    leaderboard={this.state.leaderboard}
                    groupName={this.props.group.N}
                />
                <div className='weekSearchOnHome'>
                    <div className='weekDisplay'>
                        Week Shown: {this.state.weekDisplay}
                    </div>
                    <div className='weekSearchInputOnHome'>
                        <WeekSearch handleChange={this.handleChange} customSeasonWeekSearch={this.customSeasonWeekSearch} weekSelect={this.state.weekSelect} />
                    </div>
                </div>
                <div>
                    {this.state.groupRosters.map(roster =>
                        <div key={roster.UID} className='homePageRoster'>
                            <div className='userNameOnRoster'>{roster.UN}</div>
                            <RosterDisplay
                                groupPositions={this.state.groupPositions}
                                roster={roster.R}
                                UN={roster.UN}
                                GID={this.props.group._id}
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