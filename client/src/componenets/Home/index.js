import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import Session from '../../contexts/Firebase/Session/index.js';
import Leaderboard from '../Leaderboard';
import { useHistory } from 'react-router-dom';
import RosterCarousel from './RosterCarousel';
import * as Routes from '../../constants/routes.js';
import { WeekSearch } from '../Tools/SearchDropdowns.js';
import { AvatarContext } from '../../contexts/Avatars';
import { RosterDisplay } from '../Roster/RosterDisplay';
import { CurrentUserContext } from '../../contexts/CurrentUser';
import { NFLScheduleContext } from '../../contexts/NFLSchedule';
import { axiosHandler, httpErrorHandler } from '../../utils/axiosHandler';

const Home = () => {
  const [idealRoster, setIdealRoster] = useState([]);
  const [bestRoster, setBestRoster] = useState({ username: '', roster: [] });
  const [weeklyGroupRosters, setWeeklyGroupRosters] = useState([]);
  const [groupPositions, setGroupPositions] = useState([]);
  const [weekSelect, setWeekSelect] = useState(1);
  const [weekOnPage, setWeekOnPage] = useState(1);
  const [initialPull, setInitialPull] = useState(false);

  const { addPlayerAvatarsToPull, addUserAvatarsToPull } =
    useContext(AvatarContext);
  const { currentUser, currentGroup } = useContext(CurrentUserContext);
  const { currentNFLTime } = useContext(NFLScheduleContext);

  const axiosCancel = axios.CancelToken.source();
  const history = useHistory();

  useEffect(() => {
    if (currentUser.grouplist) {
      if (currentUser.grouplist.length === 0) {
        history.push(Routes.groupList);
      }
    }
  }, [currentUser.grouplist]);

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    if (
      currentNFLTime.week !== 0 &&
      currentNFLTime.season !== '' &&
      currentUser.username &&
      currentGroup._id !== undefined
    ) {
      setWeekOnPage(currentNFLTime.week);
      setWeekSelect(currentNFLTime.week);
      getAllRostersForWeek(
        currentNFLTime.season,
        currentNFLTime.week,
        currentGroup._id
      );
      getGroupPositions(currentGroup._id);
      if (!initialPull) {
        try {
          getIdealRoster(
            currentNFLTime.season,
            currentNFLTime.week,
            currentGroup._id
          );
          getBestRoster(
            currentNFLTime.season,
            currentNFLTime.week,
            currentGroup._id
          );
        } catch (err) {
          console.log(
            'Error doing initial pull of Leaderboard, Ideal and Leader. Error: ',
            err
          );
        }
        setInitialPull(true);
      }
    }
  }, [currentNFLTime, currentUser.username, currentGroup]);

  const getGroupPositions = async (groupId) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/positions/${groupId}`,
        axiosCancel.token
      );
      setGroupPositions(data);
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
      setIdealRoster(data);
      const playerIds = data.map((player) => player.mySportsId);
      addPlayerAvatarsToPull(playerIds);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const getBestRoster = async (season, week, groupId) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/roster/best/${season}/${week}/${groupId}`,
        axiosCancel.token
      );
      if (!data.bestRoster) {
        return;
      }
      setBestRoster(data.bestRoster);
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
      setWeeklyGroupRosters(data);
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
    e.target.name === 'weekSelect' && setWeekSelect(e.target.value);
  };

  const searchWeek = () => {
    setWeekOnPage(weekSelect);
    getAllRostersForWeek(currentNFLTime.season, weekSelect, currentGroup._id);
  };

  const weekForLeaderboard =
    currentNFLTime.week === 0 ? 1 : currentNFLTime.week;
  return (
    <div className='container'>
      <Leaderboard groupId={currentGroup._id} weekToShow={weekForLeaderboard} />
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
                headerText={`Best from Week ${currentNFLTime.week - 1} - ${
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
          {currentGroup.name} Week {weekOnPage} Rosters
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
                link={`roster/Eliminator/${inGroupRoster.username}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Session(Home);
