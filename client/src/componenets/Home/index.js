import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';

import { RosterDisplay } from '../Roster';
import './homeStyle.css';
import Leaderboard from './Leaderboard';
import PropTypes from 'prop-types';

const Home = ({ season, group, week, currentUser }) => {

    const [leaderboard, updateLeaderboard] = useState([]);
    const [roster, updateRoster] = useState([]);
    const [idealRoster, updateIdealRoster] = useState([]);
    const [groupPositions, updateGroupPositions] = useState([]);

    useEffect(() => {
        if (week !== 0 && season !== ``) {
            if (currentUser) {
                getRostersForHome(season, week, group._id)
                getRoster(season, week, group.N, currentUser.username);
            }
        }
    }, [week, season, currentUser.username, group])

    const getRostersForHome = (season, week, groupId) => {
        getLeaderBoard(season, week, groupId);
        getIdealRoster(season, week, groupId);
        getBestCurrLeadRoster(season, week, groupId);
    };

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
                updateRoster(res.data.userRoster);
                updateGroupPositions(res.data.groupPositions)
                return;
            });
    };

    const getIdealRoster = (season, week, groupId) => {
        axios.get(`/api/getIdealRoster/${season}/${week}/${groupId}`)
            .then(res => {
                updateIdealRoster(res.data)
            });
    };

    const getBestCurrLeadRoster = (season, week, groupId) => {
        //This gets both the best roster from the previous week as well as the current leader's roster for the current week
        axios.get(`/api/getBestCurrLeadRoster/${season}/${week}/${groupId}`)
            .then(res => {
                console.log(res)
            })
    };

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
                    {roster.length > 0 &&
                        <RosterDisplay
                            groupPositions={groupPositions}
                            roster={roster}
                            pastLockWeek={true} //This sets it so the score will show
                        />
                    }
                </div>
            </div>
            <div className='secondRowWrapper'>
                <div className='userRosterHomePage'>
                    <div className='rosterHomePageTitle'>
                        Best roster from week {weekForLeaderboard}
                    </div>
                    <RosterDisplay
                        groupPositions={groupPositions}
                        roster={roster}
                        pastLockWeek={true}
                    />
                </div>
                <div>
                    <div className='userRosterHomePage'>
                        <div className='rosterHomePageTitle'>
                            Ideal Roster from last week
                        </div>
                        {idealRoster.length > 0 &&
                            <RosterDisplay
                                groupPositions={groupPositions}
                                roster={idealRoster}
                                pastLockWeek={true}
                            />
                        }
                    </div>
                </div>
                <div className='userRosterHomePage'>
                    <div className='rosterHomePageTitle'>
                        Current Leader&apos;s Week {weekForLeaderboard} Roster
                    </div>
                    <RosterDisplay
                        groupPositions={groupPositions}
                        roster={roster}
                        pastLockWeek={true}
                    />
                </div>
            </div>
        </Fragment>
    );
};

Home.propTypes = {
    season: PropTypes.string,
    group: PropTypes.object,
    week: PropTypes.number,
    currentUser: PropTypes.object
}


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