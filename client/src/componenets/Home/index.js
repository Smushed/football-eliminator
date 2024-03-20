import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { RosterDisplay } from '../Roster/RosterDisplay';
import './homeStyle.css';
import PropTypes from 'prop-types';
import RosterCarousel from './RosterCarousel';
import * as Routes from '../../constants/routes';
import { WeekSearch } from '../Roster/SearchDropdowns';
import Session from '../Session';
import { AvatarContext } from '../Avatars';
import Leaderboard from '../Leaderboard';

const Home = ({ season, group, week, currentUser, noGroup, history }) => {
  const [idealRoster, updateIdealRoster] = useState([]);
  const [bestRoster, updateBestRoster] = useState([]);
  const [bestRosterUser, updateBestRosterUser] = useState(``);
  const [weeklyGroupRosters, updateWeeklyGroupRosters] = useState([]);
  const [groupPositions, updateGroupPositions] = useState([]);
  const [weekSelect, updateWeekSelect] = useState(1);
  const [weekOnPage, updateWeekOnPage] = useState(1);
  const [initialPull, updateInitialPull] = useState(false);

  const { addPlayerAvatarsToPull, addUserAvatarsToPull } =
    useContext(AvatarContext);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    if (week !== 0 && season !== `` && currentUser.username && group) {
      updateWeekOnPage(week);
      updateWeekSelect(week);
      getAllRostersForWeek(season, week, group._id);
      getGroupPositions(group._id);
      if (!initialPull) {
        try {
          pullIdealCurrLeader(season, week, group._id);
        } catch (err) {
          console.log(
            'Error doing initial pull of Leaderboard, Ideal and Leader. Error: ',
            err
          );
        }
        updateInitialPull(true);
      }
    }
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, [week, season, currentUser.username, group]);

  useEffect(() => {
    if (noGroup) {
      history.push(Routes.groupPage);
      return;
    }
  }, [noGroup]);

  const pullIdealCurrLeader = async (season, week, groupId) => {
    try {
      await getIdealRoster(season, week, groupId);
      await getBestCurrLeadRoster(season, week, groupId);
    } catch (err) {
      throw err;
    }
  };

  const getGroupPositions = (groupId) => {
    axios
      .get(`/api/group/positions/${groupId}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateGroupPositions(res.data);
        return;
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getIdealRoster = (season, week, groupId) =>
    axios
      .get(`/api/roster/ideal/${season}/${week}/${groupId}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateIdealRoster(res.data);
        const playerIds = res.data.map((player) => player.M);
        addPlayerAvatarsToPull(playerIds);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });

  const getBestCurrLeadRoster = (season, week, groupId) =>
    //This gets both the best roster from the previous week as well as the current leader's roster for the current week
    axios
      .get(`/api/group/roster/bestAndLead/${season}/${week}/${groupId}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        if (!res.data.bestRoster) {
          return;
        }
        const { U, R } = res.data.bestRoster;
        if (U) {
          updateBestRosterUser(U);
        }
        if (R) {
          updateBestRoster(R);
          const playerIds = R.map((player) => player.M);
          addPlayerAvatarsToPull(playerIds);
        }
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
        throw err;
      });

  const getAllRostersForWeek = (season, week, groupId) => {
    axios
      .get(`/api/roster/group/all/${season}/${week}/${groupId}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateWeeklyGroupRosters(res.data);
        addUserAvatarsToPull(res.data.map((roster) => roster.UID));
        const playerIds = [];
        for (const roster of res.data) {
          for (const player of roster.R) {
            if (player.M !== 0) {
              playerIds.push(player.M);
            }
          }
        }
        addPlayerAvatarsToPull(playerIds);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
        throw err;
      });
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
                headerText={`Best from Week ${week - 1} - ${bestRosterUser}`}
                groupPositions={groupPositions}
                roster={bestRoster}
                pastLockWeek={true}
              />
            </div>
          </div>
        </div>
        <div className='col-md-12 d-block d-lg-none'>
          <RosterCarousel
            week={weekForLeaderboard}
            bestRosterUser={bestRosterUser}
            bestRoster={bestRoster}
            groupPositions={groupPositions}
            idealRoster={idealRoster}
          />
        </div>
      </div>
      <div className='row justify-content-center mt-1'>
        <div className='text-center fs-3 fw-bold pt-2 col-4'>
          {group.N} Week {weekOnPage} Rosters
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
            <div className='col-xs-12 col-lg-6' key={inGroupRoster.UN}>
              <div className='text-center fs-3'>
                <Link to={`/roster/${group.N}/${inGroupRoster.UN}`}>
                  {inGroupRoster.UN}
                </Link>{' '}
                Roster
              </div>
              <RosterDisplay
                groupPositions={groupPositions}
                roster={inGroupRoster.R}
                pastLockWeek={true}
              />
            </div>
          ))}
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
  history: PropTypes.any,
};

export default Session(Home);
