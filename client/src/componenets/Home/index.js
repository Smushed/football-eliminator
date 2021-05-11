import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';

import { RosterDisplay } from '../Roster';
import './homeStyle.css';
import Leaderboard from './Leaderboard';

const Home = ({ isAdmin, season, group, week, positionOrder, username }) => {

    const [leaderboard, updateLeaderboard] = useState([]);
    const [roster, updateRoster] = useState([]);
    const [groupPositions, updateGroupPositions] = useState([]);

    useEffect(() => {
        if (week && season) {
            getLeaderBoard(season, week, group._id);
            getRoster(season, week, group.N, username);
        };
    }, [week, season, username, group])

    const getLeaderBoard = (season, week, groupId) => {
        axios.get(`/api/getLeaderBoard/${season}/${week}/${groupId}`)
            .then(res => {
                updateLeaderboard(res.data.leaderboard);
                return;
            });
    };

    const getRoster = (season, week, groupname, username) => {
        axios.get(`/api/userRoster/${season}/${week}/${groupname}/${username}`)
            .then(res => {
                console.log(res.data)
                updateRoster(res.data.userRoster);
                updateGroupPositions(res.data.groupPositions)
                return;
            });
    }

    const weekForLeaderboard = week === 0 ? 1 : week;
    return (
        <Fragment>
            <div className='wrapper'>
                <Leaderboard
                    week={weekForLeaderboard}
                    season={season}
                    leaderboard={leaderboard}
                    groupName={group.N}
                />
                <div className='userRosterHomePage'>
                    <div className='rosterHomePageTitle'>
                        Your Week {weekForLeaderboard} Roster
                </div>
                    <RosterDisplay
                        groupPositions={groupPositions}
                        roster={roster}
                    />
                </div>
            </div>
            <div className='wrapper'>
                <div>
                    Best roster from last week
                </div>
                <div>
                    Ideal Roster from last week
                </div>
                <div>
                    Current Leader Roster
                </div>
            </div>
        </Fragment>
    );
};


// import { WeekSearch } from '../Roster/SearchDropdowns';
// <div className='weekSearchOnHome'>
// <div className='weekDisplay'>
//     Week Shown: {this.state.weekDisplay}
// </div>
// <div className='weekSearchInputOnHome'>
//     <WeekSearch handleChange={this.handleChange} customSeasonWeekSearch={this.customSeasonWeekSearch} weekSelect={this.state.weekSelect} />
// </div>
// </div>

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);