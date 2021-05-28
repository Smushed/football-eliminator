import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import { Collapse } from 'react-collapse';

import { RosterDisplay } from '../Roster';
import './homeStyle.css';
import Leaderboard from './Leaderboard';
import PropTypes from 'prop-types';

const Home = ({ season, group, week, currentUser }) => {

    const [leaderboard, updateLeaderboard] = useState([]);
    const [roster, updateRoster] = useState([]);
    const [idealRoster, updateIdealRoster] = useState([]);
    const [bestRoster, updateBestRoster] = useState([]);
    const [bestRosterUser, updateBestRosterUser] = useState(``);
    const [leaderRoster, updateLeaderRoster] = useState([]);
    const [weeklyGroupRosters, updateWeeklyGroupRosters] = useState([]);
    const [groupPositions, updateGroupPositions] = useState([]);
    const [groupRostersOpen, updateGroupRostersOpen] = useState(true);
    const [secondRowOpen, updateSecondRowOpen] = useState(true);

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
        getAllRostersForWeek(season, week, groupId);
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
                updateBestRosterUser(res.data.bestRoster.U);
                updateBestRoster(res.data.bestRoster.R);
                updateLeaderRoster(res.data.leaderRoster); //No need to set username here, already have it with leaderboard
            });
    };

    const getAllRostersForWeek = (season, week, groupId) => {
        axios.get(`/api/getAllRostersForGroup/${season}/${week}/${groupId}`)
            .then(res => {
                updateWeeklyGroupRosters(res.data);
            });
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
            <div className='rosterGroupHeaderWrapper'>
                <div className='rosterGroupHeader'>
                    Top Rosters
                    <button className='collapseButton btn btn-outline-info' onClick={() => updateSecondRowOpen(!secondRowOpen)}>
                        Collapse
                    </button>
                </div>
            </div>
            <Collapse isOpened={secondRowOpen}>
                <div className='rosterRowWrapper'>
                    <div className='userRosterHomePage'>
                        <div className='rosterHomePageTitle'>
                            Best from Week {weekForLeaderboard - 1} - {bestRosterUser}
                        </div>
                        <RosterDisplay
                            groupPositions={groupPositions}
                            roster={bestRoster}
                            pastLockWeek={true}
                        />
                    </div>
                    <div>
                        <div className='userRosterHomePage'>
                            <div className='rosterHomePageTitle'>
                                Last Week&apos;s Ideal
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
                            Current Lead Week {weekForLeaderboard} {leaderboard[0] && leaderboard[0].UN}
                        </div>
                        {leaderRoster.length > 0 &&
                            <RosterDisplay
                                groupPositions={groupPositions}
                                roster={leaderRoster}
                                pastLockWeek={true}
                            />
                        }
                    </div>
                </div>
            </Collapse>
            <div className='rosterGroupHeaderWrapper'>
                <div className='rosterGroupHeader'>
                    {group.N} Group Rosters
                    <button className='collapseButton btn btn-outline-info' onClick={() => updateGroupRostersOpen(!groupRostersOpen)}>
                        Collapse
                    </button>
                </div>
            </div>
            <Collapse isOpened={groupRostersOpen}>
                <div className='rosterRowWrapper'>
                    {weeklyGroupRosters.map(inGroupRoster =>
                        <div className='bottomMargin' key={inGroupRoster.UN}>
                            <div className='userRosterHomePage'>
                                <div className='rosterHomePageTitle'>
                                    {inGroupRoster.UN} Roster
                                </div>
                                <RosterDisplay
                                    groupPositions={groupPositions}
                                    roster={inGroupRoster.R}
                                    pastLockWeek={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Collapse>
        </Fragment>
    );
};

Home.propTypes = {
    season: PropTypes.string,
    group: PropTypes.object,
    week: PropTypes.number,
    currentUser: PropTypes.object
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);