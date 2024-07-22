import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import fuzzysort from 'fuzzysort';

import { RosterDisplay, PlayerDisplayTable } from './RosterDisplay';
import Session from '../Session';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './rosterStyle.css';
import './playerStyle.css';

import { loading, doneLoading } from '../LoadingAlert';
import { WeekSearch, PositionSearch, TeamSearch } from './SearchDropdowns';
import { toast } from 'react-hot-toast';
import { AvatarContext } from '../../contexts/Avatars';
import { CurrentUserContext, NFLScheduleContext } from '../../App.js';
import { useParams } from 'react-router-dom';
import { axiosHandler, httpErrorHandler } from '../../utils/axiosHandler.js';
import { useHistory } from 'react-router-dom';
import * as Routes from '../../constants/routes.js';

const Alert = withReactContent(Swal);

const Roster = () => {
  const [userRoster, updateUserRoster] = useState([]);
  const [availablePlayers, updateAvaliablePlayers] = useState([]);
  const [positionSelect, updatePositionSelect] = useState('QB');
  const [teamSelect, updateTeamSelect] = useState('ARI');
  const [lastPosSearch, updateLastPosSearch] = useState('');
  const [weekSelect, updateWeekSelect] = useState(0);
  const [weekOnPage, updateWeekOnPage] = useState(0);
  const [groupPositions, updateGroupPositions] = useState([]);
  const [positionArray, updatePositionArray] = useState([]);
  const [usedPlayers, updateUsedPlayers] = useState([]);
  const [showUsedPlayers, updateShowUsedPlayers] = useState(true);
  const [positionMap, updatePositionMap] = useState([]);
  const [weeklyMatchups, updateWeeklyMatchups] = useState([]);
  const [sortedMatchups, updateSortedMatchups] = useState([]);
  const [mustDrop, updateMustDrop] = useState(false);
  const [possiblePlayer, updatePossiblePlayer] = useState(0);
  const [possiblePlayers, updatePossiblePlayers] = useState([]);
  const [activePlayerSearch, updateActivatePlayerSearch] = useState(true);
  const [playerSearch, updatePlayerSearch] = useState('');
  const [availPlayersToShow, updateAvailPlayersToShow] = useState([]);

  const { addPlayerAvatarsToPull } = useContext(AvatarContext);
  const { currentUser } = useContext(CurrentUserContext);
  const { currentNFLTime } = useContext(NFLScheduleContext);

  const params = useParams();
  const history = useHistory();

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel('Unmounted');
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser.grouplist) {
      if (currentUser.grouplist.length === 0) {
        history.push(Routes.groupList);
      }
    }
  }, [currentUser.grouplist]);

  useEffect(() => {
    if (currentNFLTime.week !== 0 && currentNFLTime.season !== '') {
      primaryPull(+currentNFLTime.week, params.username);
    }
  }, [currentNFLTime, params.username, currentUser.grouplist]);

  useEffect(() => {
    if (playerSearch === '') {
      updateAvailPlayersToShow(availablePlayers);
      return;
    }
    const results = fuzzysort.go(playerSearch, availablePlayers, {
      key: 'name',
    });

    updateAvailPlayersToShow(results.map((player) => player.obj));
  }, [playerSearch]);

  useEffect(() => {
    const availPlayers = [...availablePlayers];
    updateAvailPlayersToShow(availPlayers);
  }, [availablePlayers]);

  const primaryPull = (week) => {
    updateWeekSelect(week);
    getRosterData(week);
    pullPlayers();
  };

  const getUsedPlayers = async () => {
    try {
      const { data } = await axiosHandler.get(
        `/api/roster/players/used/${params.username}/${currentNFLTime.season}/${params.groupname}/${positionSelect}`,
        axiosCancel.token
      );
      updateUsedPlayers(data);
      const playerIds = data.map((player) => player.mySportsId);
      addPlayerAvatarsToPull(playerIds);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const getWeeklyMatchUps = async (weekInput) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/nfldata/matchups/${currentNFLTime.season}/${weekInput}`,
        axiosCancel.token
      );
      updateWeeklyMatchups(data.matchups);
      updateSortedMatchups(data.sortedMatchups);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const getRosterData = async (weekInput) => {
    try {
      getWeeklyMatchUps(weekInput);
      updateWeekOnPage(weekInput);
      if (currentNFLTime.week !== 0 && currentNFLTime.season !== ``) {
        loading();
        const { data } = await axiosHandler.get(
          `/api/roster/user/${currentNFLTime.season}/${weekInput}/${params.groupname}/${params.username}`,
          axiosCancel.token
        );
        addPlayerAvatarsToPull(
          data.userRoster.map((player) => player.mySportsId)
        );
        updateUserRoster(data.userRoster);
        updateGroupPositions(data.groupPositions);
        updatePositionMap(data.groupMap);
        updatePositionArray(data.positionArray);
        doneLoading();
      }
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const tooManyPlayers = (currentRoster, allowedMap, addedPlayer) => {
    window.scrollTo(0, 0);
    const possibleDrops = [];
    for (let i = 0; i < allowedMap.length; i++) {
      if (allowedMap[i]) {
        possibleDrops.push(currentRoster[i]);
      }
    }
    possibleDrops.push(addedPlayer);

    updateMustDrop(true);
    updatePossiblePlayer(addedPlayer);
    updatePossiblePlayers(possibleDrops);
  };

  const chosePlayerForRoster = async (chosenPlayer) => {
    let droppedPlayerIndex = 0;
    const currentRoster = [...userRoster];
    const droppedPlayer = currentRoster.find((player, i) => {
      if (+player.mySportsId === +chosenPlayer) {
        droppedPlayerIndex = i;
        return player;
      }
    });
    if (droppedPlayer) {
      let availDroppedPlayerIndex = -1;

      const availablePlayersCopy = [...availablePlayers];
      availablePlayersCopy.find((player, i) => {
        if (+player.mySportsId === +possiblePlayer.mySportsId) {
          availDroppedPlayerIndex = i;
        }
      });
      if (availDroppedPlayerIndex >= 0) {
        availablePlayersCopy.splice(availDroppedPlayerIndex, 1);
      }
      if (droppedPlayer.position === positionSelect) {
        availablePlayersCopy.unshift(droppedPlayer);
      }
      currentRoster[droppedPlayerIndex] = {
        position: possiblePlayer.position,
        mySportsId: possiblePlayer.mySportsId,
        name: possiblePlayer.name,
        team: possiblePlayer.team,
      };

      const newUsedPlayers = usedPlayers.filter(
        (player) => player.mySportsId !== droppedPlayer.mySportsId
      );
      newUsedPlayers.push(possiblePlayer);

      const saveSuccessful = await saveRosterToDb(
        currentRoster,
        droppedPlayer.mySportsId,
        possiblePlayer.mySportsId,
        droppedPlayer.position
      );

      if (saveSuccessful) {
        updateAvaliablePlayers(availablePlayersCopy);
        updateUsedPlayers(newUsedPlayers);
        updateMustDrop(false);
      }
    } else {
      //The user has selected the player who is not on their team
      updateUserRoster(currentRoster);
      updateMustDrop(false);
    }
  };

  const saveRosterToDb = (roster, droppedPlayer, addedPlayer, pos) =>
    new Promise((res, rej) => {
      loading();
      axiosHandler
        .put('/api/roster/user/update', {
          userId: currentUser.userId,
          roster: roster,
          droppedPlayer: droppedPlayer,
          addedPlayer: addedPlayer,
          week: weekSelect,
          season: currentNFLTime.season,
          groupname: params.groupname,
          position: pos,
        })
        .then(({ data }) => {
          doneLoading();
          updateUserRoster(data);
          if (mustDrop) {
            updateMustDrop(false);
            updatePossiblePlayer(0);
            updatePossiblePlayers([]);
          }
          res(true);
        })
        .catch((err) => {
          doneLoading();
          toast.error(`Roster can not be saved! ${err.response.data}`);
          res(false);
        });
    });

  const checkLockPeriod = async (team) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/roster/lock/${currentNFLTime.season}/${weekOnPage}/${team}`,
        axiosCancel.token
      );
      return data;
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const positionSearch = (e) => {
    e.preventDefault();
    pullPlayers();
  };

  const searchByTeam = async () => {
    try {
      const { data } = await axiosHandler.get(
        `/api/roster/getPlayersByTeam/${currentNFLTime.season}/${params.username}/${params.groupname}/${teamSelect}`,
        axiosCancel.token
      );
      addPlayerAvatarsToPull(data.map((player) => player.mySportsId));
      updateAvaliablePlayers(data);
      updateAvailPlayersToShow(data);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const pullPlayers = async () => {
    try {
      loading();
      const { data } = await axiosHandler.get(
        '/api/roster/players/available',
        axiosCancel.token,
        {
          username: params.username,
          searchedPosition: positionSelect,
          season: currentNFLTime.season,
          groupname: params.groupname,
        }
      );
      updateLastPosSearch(positionSelect);
      addPlayerAvatarsToPull(data.map((player) => player.mySportsId));
      updateAvaliablePlayers(data);
      updateAvailPlayersToShow(data);
      getUsedPlayers(positionSelect);
    } catch (err) {
      httpErrorHandler(err);
    } finally {
      doneLoading();
    }
  };

  const customSeasonWeekSearch = (e) => {
    e.preventDefault();
    updateUserRoster([]);
    getRosterData(weekSelect, currentNFLTime.season);
  };

  const toggleShowUsedPlayers = () => {
    updateShowUsedPlayers(!showUsedPlayers);
  };

  const handleChange = (e) => {
    e.target.name === 'playerSearch' && updatePlayerSearch(e.target.value);
    e.target.name === 'weekSelect' && updateWeekSelect(e.target.value);
    e.target.name === 'positionSelect' && updatePositionSelect(e.target.value);
    e.target.name === 'teamSelect' && updateTeamSelect(e.target.value);
  };

  const addPlayerToRoster = async (
    newRoster,
    addedPlayer,
    newAvailablePlayers
  ) => {
    let sortedUpdatedRoster = [...newRoster];
    const playerPosition = positionArray.indexOf(addedPlayer.position);
    const allowedMap = [];
    let added = false;
    for (let i = 0; i < positionMap.length; i++) {
      if (positionMap[i].includes(playerPosition)) {
        //Checks the roster for how many spots the player is allowed to go into
        allowedMap[i] = true;
        if (!added) {
          if (sortedUpdatedRoster[i].mySportsId === 0) {
            //If there is an open spot add the player
            sortedUpdatedRoster[i] = addedPlayer;
            added = true;
          }
        }
      } else {
        allowedMap[i] = false;
      }
    }
    if (!added) {
      tooManyPlayers(sortedUpdatedRoster, allowedMap, addedPlayer);
    } else {
      const saveSuccessful = await saveRosterToDb(
        sortedUpdatedRoster,
        0,
        addedPlayer.mySportsId,
        addedPlayer.position
      );
      if (saveSuccessful) {
        updateAvaliablePlayers(newAvailablePlayers);
        if (addedPlayer.position === positionSelect) {
          const newUsedPlayers = [...usedPlayers];
          newUsedPlayers.push(addedPlayer);
          updateUsedPlayers(newUsedPlayers);
        }
      }
    }
  };

  const addDropPlayer = async (mySportsId, team, addOrDrop) => {
    if (params.username !== currentUser.username) {
      Alert.fire({
        title: 'Not your roster!',
        icon: 'warning',
      });
      return;
    }
    const isNotLocked = await checkLockPeriod(team);
    if (!isNotLocked) {
      Alert.fire({
        title: 'Locked!',
        text: `${team} has started for week ${weekOnPage}. Select a different player or week`,
        confirmButtonText: 'Close',
      });
      return;
    }

    if (mustDrop) {
      //User has too many players on their roster, they are dropping to make room
      chosePlayerForRoster(mySportsId);
      return;
    }

    const newAvailablePlayers = [...availablePlayers];
    let newRoster = [...userRoster];

    if (addOrDrop === 'add') {
      let addedPlayerIndex = 0;

      const addedPlayer = newAvailablePlayers.find((player, i) => {
        if (player.mySportsId === mySportsId) {
          addedPlayerIndex = i;
          return player;
        }
      });

      newAvailablePlayers.splice(addedPlayerIndex, 1);
      addPlayerToRoster(newRoster, addedPlayer, newAvailablePlayers);
    } else if (addOrDrop === `drop`) {
      let droppedPlayerIndex = 0;
      const droppedPlayer = newRoster.find((player, i) => {
        if (player.mySportsId === mySportsId) {
          droppedPlayerIndex = i;
          return player;
        }
      });
      const copiedUsedPlayers = [...usedPlayers];
      const newUsedPlayers = copiedUsedPlayers.filter(
        (player) => player.mySportsId !== mySportsId
      );
      if (droppedPlayer.position === positionSelect) {
        updateUsedPlayers(newUsedPlayers);
      }
      newRoster[droppedPlayerIndex] = { mySportsId: 0, score: 0 };
      newAvailablePlayers.unshift(droppedPlayer);

      const saveSuccessful = await saveRosterToDb(
        newRoster,
        mySportsId,
        false,
        droppedPlayer.position
      );
      if (saveSuccessful) {
        updateAvaliablePlayers(newAvailablePlayers);
      }
    }
  };

  const showMatchUps = async () => {
    let displayMatchups = 'Home   -   Away<br />';
    for (let i = 0; i < weeklyMatchups.length; i++) {
      displayMatchups += `<br/>${weeklyMatchups[i].home}  -  ${weeklyMatchups[i].away}`;
    }
    Alert.fire({
      title: `Week ${weekOnPage} Matchups`,
      html: displayMatchups,
    });
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-12 fs-3 fw-bold text-center mt-2 mb-2'>
          {params.username}&apos;s Roster
        </div>
      </div>
      <div className='row justify-content-center mb-2'>
        <div className='col-6 col-lg-4'>
          <div className='row'>
            <div className='col-12 text-center'>Change Week</div>
          </div>
          <WeekSearch
            weekSelect={weekSelect}
            handleChange={handleChange}
            customSeasonWeekSearch={customSeasonWeekSearch}
            disabled={mustDrop}
          />
        </div>
      </div>
      <div className='row'>
        <div className='col-12'>
          <div className='row justify-content-center'>
            <div className='col-sm-12 col-md-4 col-lg-2 text-center mt-1 mb-1'>
              <button
                className='btn btn-success'
                disabled={mustDrop}
                onClick={() => toggleShowUsedPlayers()}
              >
                {showUsedPlayers ? 'Hide' : 'Show'} Used Players
              </button>
            </div>
            <div className='col-sm-12 col-md-4 col-lg-2 text-center mt-1 mb-1'>
              <button
                className='btn btn-success'
                onClick={() => updateActivatePlayerSearch(!activePlayerSearch)}
              >
                {activePlayerSearch ? `Hide` : `Show`} Player Search
              </button>
            </div>
            <div className='col-sm-12 col-md-4 col-lg-2 text-center mt-1 mb-1'>
              <button
                className='btn btn-success'
                onClick={() => showMatchUps()}
              >
                Show Match Ups
              </button>
            </div>
          </div>

          <div className='row justify-content-center mt-2 mb-1'>
            <div className='col-12 col-md-4'>
              <div className='row'>
                <div className='col-sm-12 col-md-8 text-center'>
                  Position Search
                </div>
              </div>
              <div className='row'>
                <PositionSearch
                  positionSelect={positionSelect}
                  handleChange={handleChange}
                  positionSearch={positionSearch}
                  disabled={mustDrop}
                />
              </div>
            </div>
            <div className='col-12 col-md-4'>
              <div className='row'>
                <div className='col-sm-12 col-md-8 text-center'>
                  Search by Team
                </div>
              </div>
              <div className='row'>
                <TeamSearch
                  teamSelect={teamSelect}
                  handleChange={handleChange}
                  searchByTeam={searchByTeam}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='row justify-content-center fadeOut'>
        <div className={'col-sm-12 col-md-6 col-xl-4 fadeOut'}>
          <RosterDisplay
            headerText={
              mustDrop
                ? 'Too Many Players, drop one'
                : `Week ${weekOnPage} Roster`
            }
            pastLockWeek={currentNFLTime.lockWeek >= weekOnPage}
            groupPositions={groupPositions}
            addDropPlayer={addDropPlayer}
            roster={mustDrop ? possiblePlayers : userRoster}
            mustDrop={mustDrop}
          />
          <div
            className={`usedPlayerCol ${mustDrop && 'thirtyTransparent'} ${
              !showUsedPlayers && ` displayNone`
            }`}
          >
            <PlayerDisplayTable
              headerText={`Used ${lastPosSearch ? lastPosSearch : 'Player'}s`}
              playerList={usedPlayers}
            />
          </div>
        </div>
        <div
          className={`col-sm-12 col-md-6 col-xl-4 fadeOut ${
            mustDrop && 'rosterHide'
          }`}
        >
          <PlayerDisplayTable
            headerText='Available Players'
            playerList={availPlayersToShow}
            sortedMatchups={sortedMatchups}
            addDropPlayer={mustDrop ? false : addDropPlayer}
            showInput={activePlayerSearch}
            inputValue={playerSearch}
            handleChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Session(Roster);
