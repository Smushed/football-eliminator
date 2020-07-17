import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { RosterDisplay } from '../Roster';
import * as Routes from '../../constants/routes';
import { WeekSearch } from '../Roster/SearchDropdowns';

import './homeStyle.css';

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
            this.getAllRostersForGroup(this.props.season, this.props.week, this.props.group._id)
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.week !== prevProps.week) {
            this.setState({ weekSelect: this.props.week });
            this.getAllRostersForGroup(this.props.season, this.props.week, this.props.group._id)
        };
    };

    getAllRostersForGroup(season, week, groupId) {
        axios.get(`/api/getAllRostersForGroup/${season}/${week}/${groupId}`)
            .then(res => {
                console.log(res.data)
                this.setState({ groupRosters: res.data.rosters, groupPositions: res.data.groupPositions });
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
                <div className='groupRosterWrapper'>
                    {console.log(this.state.groupRosters)}
                    {this.state.groupRosters.map(roster =>
                        <div key={roster.UID} className='homePageRoster'>
                            <div className='userNameOnRoster'>{roster.UN}</div>
                            <RosterDisplay
                                groupPositions={this.state.groupPositions}
                                roster={roster.R}
                            />
                        </div>
                    )}
                    {this.state.groupRosters.map(roster =>
                        <div key={roster.UID} className='homePageRoster'>
                            <div>{roster.UN}</div>
                            <RosterDisplay
                                groupPositions={this.state.groupPositions}
                                roster={roster.R}
                            />
                        </div>
                    )}
                    {this.state.groupRosters.map(roster =>
                        <div key={roster.UID} className='homePageRoster'>
                            <div>{roster.UN}</div>
                            <RosterDisplay
                                groupPositions={this.state.groupPositions}
                                roster={roster.R}
                            />
                        </div>
                    )}
                    {this.state.groupRosters.map(roster =>
                        <div key={roster.UID} className='homePageRoster'>
                            <div>{roster.UN}</div>
                            <RosterDisplay
                                groupPositions={this.state.groupPositions}
                                roster={roster.R}
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