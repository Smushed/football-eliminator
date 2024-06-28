import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import { RosterDisplay } from '../Roster/RosterDisplay';
import './homeStyle.css';
import RosterCarousel from './RosterCarousel';
import * as Routes from '../../constants/routes';
import { WeekSearch } from '../Roster/SearchDropdowns';
import Session from '../Session';
import { AvatarContext } from '../../contexts/Avatars';
import { CurrentUserContext } from '../../contexts/CurrentUser';
import Leaderboard from '../Leaderboard';
import { axiosHandler, httpErrorHandler } from '../../utils/axiosHandler';

const Home = ({ season, group, week, history }) => {
  const [idealRoster, updateIdealRoster] = useState([]);
  const [bestRoster, updateBestRoster] = useState({ username: '', roster: [] });
  const [weeklyGroupRosters, updateWeeklyGroupRosters] = useState([]);
  const [groupPositions, updateGroupPositions] = useState([]);
  const [weekSelect, updateWeekSelect] = useState(1);
  const [weekOnPage, updateWeekOnPage] = useState(1);
  const [initialPull, updateInitialPull] = useState(false);

  const { addPlayerAvatarsToPull, addUserAvatarsToPull } =
    useContext(AvatarContext);
  const { currentUser, userHasGroup } = useContext(CurrentUserContext);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    if (week !== 0 && season !== '' && currentUser.username && group) {
      updateWeekOnPage(week);
      updateWeekSelect(week);
      getAllRostersForWeek(season, week, group._id);
      getGroupPositions(group._id);
      if (!initialPull) {
        try {
          getIdealRoster(season, week, group._id);
          getBestCurrLeadRoster(season, week, group._id);
        } catch (err) {
          console.log(
            'Error doing initial pull of Leaderboard, Ideal and Leader. Error: ',
            err
          );
        }
        updateInitialPull(true);
      }
    }
  }, [week, season, currentUser.username, group]);

  useEffect(() => {
    if (!userHasGroup) {
      history.push(Routes.groupPage);
      return;
    }
  }, [userHasGroup]);

  const getGroupPositions = async (groupId) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/positions/${groupId}`,
        axiosCancel.token
      );
      updateGroupPositions(data);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const getIdealRoster = async (season, week, groupId) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/roster/ideal/${season}/${week}/${groupId}`,
        axiosCancel.token
      );
      updateIdealRoster(data);
      const playerIds = data.map((player) => player.mySportsId);
      addPlayerAvatarsToPull(playerIds);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const getBestCurrLeadRoster = async (season, week, groupId) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/roster/bestAndLead/${season}/${week}/${groupId}`,
        axiosCancel.token
      );
      if (!data.bestRoster) {
        return;
      }
      updateBestRoster(data.bestRoster);
      const playerIds = data.bestRoster.roster.map(
        (player) => player.mySportsId
      );
      addPlayerAvatarsToPull(playerIds);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const getAllRostersForWeek = async (season, week, groupId) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/roster/group/all/${season}/${week}/${groupId}`,
        axiosCancel.token
      );
      updateWeeklyGroupRosters(data);
      addUserAvatarsToPull(data.map((roster) => roster.userId));
      const playerIds = new Set();
      for (const roster of data) {
        for (const player of roster.roster) {
          if (player.mySportsId !== 0) {
            playerIds.add(player.mySportsId);
          }
        }
      }
      addPlayerAvatarsToPull(playerIds);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const handleChange = (e) => {
    e.target.name === 'weekSelect' && updateWeekSelect(e.target.value);
  };

  const searchWeek = () => {
    updateWeekOnPage(weekSelect);
    getAllRostersForWeek(season, weekSelect, group._id);
  };

  const weekForLeaderboard = week === 0 ? 1 : week;
  return (
    <div className='container'>
      <Leaderboard
        groupId={group._id}
        week={weekForLeaderboard}
        season={season}
      />
      <div className='row border pt-2'>
        <div className='col-lg-6 d-none d-lg-block'>
          <RosterDisplay
            headerText="Last Week's Ideal Roster"
            groupPositions={groupPositions}
            roster={idealRoster}
            pastLockWeek={true}
          />
        </div>
        <div className='col-lg-6 d-none d-lg-block'>
          <div className='row'>
            <div className='col-12'>
              <RosterDisplay
                headerText={`Best from Week ${week - 1} - ${
                  bestRoster.username
                }`}
                groupPositions={groupPositions}
                roster={bestRoster.roster}
                pastLockWeek={true}
              />
            </div>
          </div>
        </div>
        <div className='col-md-12 d-block d-lg-none'>
          <RosterCarousel
            week={weekForLeaderboard}
            bestRosterUser={bestRoster.username}
            bestRoster={bestRoster.roster}
            groupPositions={groupPositions}
            idealRoster={idealRoster}
          />
        </div>
      </div>
      <div className='row justify-content-center mt-1'>
        <div className='text-center fs-3 fw-bold pt-3 col-5'>
          {group.name} Week {weekOnPage} Rosters
        </div>
        <div className='col-4'>
          <div className='row'>
            <div className='col-12 text-center'>Change Week</div>
          </div>
          <WeekSearch
            weekSelect={weekSelect}
            handleChange={handleChange}
            customSeasonWeekSearch={searchWeek}
            disabled={false}
          />
        </div>
        <div className='d-flex flex-wrap justify-content-evenly row mt-1'>
          {weeklyGroupRosters.map((inGroupRoster) => (
            <div className='col-xs-12 col-lg-6' key={inGroupRoster.username}>
              <RosterDisplay
                groupPositions={groupPositions}
                roster={inGroupRoster.roster}
                pastLockWeek={true}
                headerText={`${
                  inGroupRoster.username +
                  (inGroupRoster.username.slice(-1) === 's' ? "'" : "'s")
                } Roster`}
                userId={inGroupRoster.userId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Session(Home);
