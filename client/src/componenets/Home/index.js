import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import { Link } from 'react-router-dom';

import { RosterDisplay } from '../Roster';
import './homeStyle.css';
import Leaderboard from './Leaderboard';
import PropTypes from 'prop-types';
import RosterCarousel from './RosterCarousel';
import * as Routes from '../../constants/routes';

const Home = ({ season, group, week, currentUser, noGroup, history }) => {

    const [leaderboard, updateLeaderboard] = useState([]);
    const [idealRoster, updateIdealRoster] = useState([]);
    const [bestRoster, updateBestRoster] = useState([]);
    const [bestRosterUser, updateBestRosterUser] = useState(``);
    const [leaderAvatar, updateLeaderAvatar] = useState(``);
    const [leaderRoster, updateLeaderRoster] = useState([]);
    const [weeklyGroupRosters, updateWeeklyGroupRosters] = useState([]);
    const [groupPositions, updateGroupPositions] = useState([]);

    useEffect(() => {
        if (noGroup) { history.push(Routes.groupPage); return; }

        if (week !== 0 && season !== ``) {
            if (currentUser.username) {
                getRostersForHome(season, week, group._id);
                getRoster(season, week, group.N, currentUser.username);
            }
        }
    }, [week, season, currentUser.username, group, noGroup]);

    const getRostersForHome = (season, week, groupId) => {
        getLeaderBoard(season, week, groupId);
        getIdealRoster(season, week, groupId);
        getBestCurrLeadRoster(season, week, groupId);
        getAllRostersForWeek(season, week, groupId);
    };

    const getLeaderBoard = (season, week, groupId) => {
        axios.get(`/api/group/leaderboard/${season}/${week}/${groupId}`)
            .then(res => {
                updateLeaderboard(res.data.leaderboard);
                getLeaderAvatar(res.data.leaderboard[0].UID);
                return;
            });
    };

    const getRoster = (season, week, groupname, username) => {
        axios.get(`/api/roster/user/${season}/${week}/${groupname}/${username}`)
            .then(res => {
                updateGroupPositions(res.data.groupPositions)
                return;
            });
    };

    const getIdealRoster = (season, week, groupId) => {
        axios.get(`/api/roster/ideal/${season}/${week}/${groupId}`)
            .then(res => {
                updateIdealRoster(res.data)
            });
    };

    const getBestCurrLeadRoster = (season, week, groupId) => {
        //This gets both the best roster from the previous week as well as the current leader's roster for the current week
        axios.get(`/api/group/roster/bestAndLead/${season}/${week}/${groupId}`)
            .then(res => {
                updateBestRosterUser(res.data.bestRoster.U);
                updateBestRoster(res.data.bestRoster.R);
                updateLeaderRoster(res.data.leaderRoster); //No need to set username here, already have it with leaderboard
            });
    };

    const getAllRostersForWeek = (season, week, groupId) => {
        axios.get(`/api/roster/group/all/${season}/${week}/${groupId}`)
            .then(res => {
                updateWeeklyGroupRosters(res.data);
            });
    };

    const getLeaderAvatar = (leaderId) => {
        axios.get(`/api/avatar/${leaderId}`)
            .then(res => {
                updateLeaderAvatar(res.data);
            });
    };

    const testEmail = () => {
        axios.get(`/api/email/test`);
    };

    const weekForLeaderboard = week === 0 ? 1 : week;
    return (
        <div className='wrapper'>
            <button onClick={() => testEmail()}>Test Email</button>
            <div className='homeSectionWrapper'>
                <div className='userAvatarWrapper'>
                    <div className='leaderName'>
                        <div className='leaderTitle'>Current Leader</div>
                        {leaderboard.length > 0 &&
                            leaderboard[0].UN
                        }
                    </div>
                    <img className='userAvatar' src={leaderAvatar} />
                </div>
                <div className='wrapperBorder'></div>
                <Leaderboard
                    week={weekForLeaderboard}
                    season={season}
                    leaderboard={leaderboard}
                    groupName={group.N}
                />
            </div>
            <div className='homeSectionWrapper'>
                <div>
                    <div className='largeScreenShow flexOn'>
                        <div className='rosterWrapper'>
                            <div className='rosterHomePageTitle'>
                                Last Week&apos;s Ideal Roster
                            </div>
                            <RosterDisplay
                                groupPositions={groupPositions}
                                roster={idealRoster}
                                pastLockWeek={true}
                            />
                        </div>
                        <div className='rosterWrapper'>
                            <div className='rosterHomePageTitle'>
                                Best from Week {week - 1} - {bestRosterUser}
                            </div>
                            <RosterDisplay
                                groupPositions={groupPositions}
                                roster={bestRoster}
                                pastLockWeek={true}
                            />
                        </div>
                    </div>
                    <div className='medScreenShow carouselWrapper'>
                        <RosterCarousel
                            week={weekForLeaderboard}
                            bestRosterUser={bestRosterUser}
                            bestRoster={bestRoster}
                            groupPositions={groupPositions}
                            idealRoster={idealRoster}
                            leaderboard={leaderboard}
                            leaderRoster={leaderRoster}
                        />
                    </div>
                </div>
            </div>
            <div className='homeSectionWrapper'>
                <div>
                    <div className='rosterGroupHeader'>
                        {group.N} Week {week} Rosters
                    </div>
                    <div className='rosterRowWrapper'>
                        {weeklyGroupRosters.map(inGroupRoster =>
                            <div className='bottomMargin rosterWrapper' key={inGroupRoster.UN}>
                                <div>
                                    <div className='rosterHomePageTitle'>
                                        <Link to={`/roster/${group.N}/${inGroupRoster.UN}`}>{inGroupRoster.UN}</Link> Roster
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
                </div>
            </div>
        </div>
    );
};

Home.propTypes = {
    season: PropTypes.string,
    group: PropTypes.object,
    week: PropTypes.number,
    currentUser: PropTypes.object,
    noGroup: PropTypes.bool,
    history: PropTypes.any
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);