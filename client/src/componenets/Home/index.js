import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';

import { RosterDisplay } from '../Roster';
import './homeStyle.css';
import Leaderboard from './Leaderboard';

const Home = ({ isAdmin, season, group, week, positionOrder, userId }) => {

    const [leaderboard, setLeaderboard] = useState([]);
    const [roster, setRoster] = useState([]);

    useEffect(() => {
        if (week && season) {
            getLeaderBoard(season, week, group._id);
            getRoster(season, week, group._id, userId);
        };
    }, [week, season, userId])

    const getLeaderBoard = (season, week, groupId) => {
        axios.get(`/api/getLeaderBoard/${season}/${week}/${groupId}`)
            .then(res => {
                setLeaderboard(res.data.leaderboard);
                return;
            });
    };

    const getRoster = (season, week, groupId, userId) => {
        console.log(userId)
        axios.get(`/api/userRoster/${season}/${week}/${groupId}/${userId}`)
            .then(res => {
                console.log(res);
                return;
            });
    }

    const weekForLeaderboard = week === 0 ? 1 : week;
    return (
        <div className='wrapper'>
            <Leaderboard
                week={weekForLeaderboard}
                season={season}
                leaderboard={leaderboard}
                groupName={group.N}
            />
            {/* <RosterDisplay
                groupPositions={this.state.groupPositions}
                roster={roster.R}
                UN={roster.UN}
                GID={group._id}
                UID={roster.UID}
            /> */}
            {/* <div>
                {this.state.groupRosters.map(roster =>
                    <div key={roster.UID} className='homePageRoster'>
                        <div className='userNameOnRoster'>{roster.UN}</div>

                    </div>
                )}
            </div> */}
        </div>
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