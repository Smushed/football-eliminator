import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import fuzzysort from 'fuzzysort';

import {
  RosterDisplay,
  PlayerDisplayRow,
  PlayerDisplayTable,
} from './RosterDisplay';
import Session from '../Session';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './rosterStyle.css';
import './playerStyle.css';

import { loading, doneLoading } from '../LoadingAlert';
import { WeekSearch, PositionSearch, TeamSearch } from './SearchDropdowns';
import * as Routes from '../../constants/routes';
import { toast } from 'react-hot-toast';
import { AvatarContext } from '../Avatars';

const Alert = withReactContent(Swal);

const Roster = ({
  appLevelLockWeek,
  week,
  season,
  match,
  username,
  userId,
  history,
  noGroup,
}) => {
  const [userRoster, updateUserRoster] = useState([]);
  const [availablePlayers, updateAvaliablePlayers] = useState([]);
  const [positionSelect, updatePositionSelect] = useState('QB');
  const [teamSelect, updateTeamSelect] = useState('ARI');
  const [lastPosSearch, updateLastPosSearch] = useState('');
  const [weekSelect, updateWeekSelect] = useState(0);
  const [weekOnPage, updateWeekOnPage] = useState(0);
  const [currentUser, updateCurrentUser] = useState(false);
  const [usernameOfPage, updateUsernameOfPage] = useState('');
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

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel('Unmounted');
      }
    };
  }, []);

  useEffect(() => {
    if (noGroup) {
      history.push(Routes.groupPage);
      return;
    }

    if (week !== 0 && season !== '') {
      primaryPull(+week, match.params.username);
    }
  }, [week, season, match.params.username, noGroup]);

  useEffect(() => {
    if (playerSearch === '') {
      updateAvailPlayersToShow(availablePlayers);
      return;
    }
    const results = fuzzysort.go(playerSearch, availablePlayers, { key: 'N' });

    updateAvailPlayersToShow(results.map((player) => player.obj));
  }, [playerSearch]);

  useEffect(() => {
    const availPlayers = [...availablePlayers];
    updateAvailPlayersToShow(availPlayers);
  }, [availablePlayers]);

  const primaryPull = (week, username) => {
    updateWeekSelect(week);
    updateUsernameOfPage(username);
    getRosterData(week);
    checkCurrentUser();
    pullPlayers();
  };

  const getUsedPlayers = () => {
    axios
      .get(
        `/api/roster/players/used/${match.params.username}/${season}/${match.params.groupname}/${positionSelect}`,
        {
          cancelToken: axiosCancel.token,
        }
      )
      .then((res) => {
        updateUsedPlayers(res.data);
        const playerIds = res.data.map((player) => player.mySportsId);
        addPlayerAvatarsToPull(playerIds);
      })
      .catch((err) => {
        if (err.message !== 'Unmounted') {
          console.log(err);
        }
      });
  };

  const checkCurrentUser = () => {
    if (username === match.params.username) {
      updateCurrentUser(true);
    } else {
      updateCurrentUser(false);
    }
  };

  const getWeeklyMatchUps = (weekInput) => {
    axios
      .get(`/api/nfldata/matchups/${season}/${weekInput}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateWeeklyMatchups(res.data.matchups);
        updateSortedMatchups(res.data.sortedMatchups);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getRosterData = (weekInput) => {
    getWeeklyMatchUps(weekInput);
    updateWeekOnPage(weekInput);
    if (week !== 0 && season !== ``) {
      loading();
      axios
        .get(
          `/api/roster/user/${season}/${weekInput}/${match.params.groupname}/${match.params.username}`,
          { cancelToken: axiosCancel.token }
        )
        .then((res) => {
          const { userRoster, groupPositions, groupMap, positionArray } =
            res.data;
          const playerIds = userRoster.map((player) => player.mySportsId);
          addPlayerAvatarsToPull(playerIds);
          updateUserRoster(userRoster);
          updateGroupPositions(groupPositions);
          updatePositionMap(groupMap);
          updatePositionArray(positionArray);
          doneLoading();
        })
        .catch((err) => {
          if (err.message !== 'Unmounted') {
            console.log(err);
          }
          console.log('roster data error', err);
        });
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
      if (droppedPlayer.P === positionSelect) {
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
      axios
        .put('/api/roster/user/update', {
          userId: userId,
          roster,
          droppedPlayer,
          addedPlayer,
          week: weekSelect,
          season: season,
          groupname: match.params.groupname,
          position: pos,
        })
        .then((response) => {
          doneLoading();
          updateUserRoster(response.data);
          if (mustDrop) {
            updateMustDrop(false);
            updatePossiblePlayer(0);
            updatePossiblePlayers([]);
          }
          res(true);
        })
        .catch((err) => {
          if (err.message !== 'Unmounted') {
            doneLoading();
            console.log({ err });
            toast.error(`Roster can not be saved! ${err.response.data}`);
          }
          res(false);
        });
    });

  const checkLockPeriod = async (team) => {
    axios
      .get(`/api/roster/lock/${season}/${weekOnPage}/${team}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => res.data)
      .catch((err) => {
        if (err.message !== 'Unmounted') {
          console.log(err);
        }
      });
  };

  const positionSearch = (e) => {
    e.preventDefault();
    pullPlayers();
  };

  const searchByTeam = () => {
    axios
      .get(
        `/api/roster/getPlayersByTeam/${season}/${userId}/${match.params.groupname}/${teamSelect}`,
        { cancelToken: axiosCancel.token }
      )
      .then((res) => {
        const playerIds = res.data.map((player) => player.mySportsId);
        addPlayerAvatarsToPull(playerIds);
        updateAvaliablePlayers(res.data);
        updateAvailPlayersToShow(res.data);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
          toast.error(err.message);
        }
      });
  };

  const pullPlayers = () => {
    loading();
    axios
      .get('/api/roster/players/available', {
        params: {
          userId: userId,
          searchedPosition: positionSelect,
          season: season,
          groupname: match.params.groupname,
        },
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateLastPosSearch(positionSelect);
        const playerIds = res.data.map((player) => player.mySportsId);
        addPlayerAvatarsToPull(playerIds);
        updateAvaliablePlayers(res.data);
        updateAvailPlayersToShow(res.data);
        getUsedPlayers(positionSelect);
        doneLoading();
      })
      .catch((err) => {
        if (err.message !== 'Unmounted') {
          console.log(err);
        }
      });
  };

  const customSeasonWeekSearch = (e) => {
    e.preventDefault();
    updateUserRoster([]);
    getRosterData(weekSelect, season);
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
    if (!currentUser) {
      Alert.fire({
        title: 'Not your roster!',
        type: 'warning',
      });
      return;
    }
    const isLocked = true;
    // const isLocked = await checkLockPeriod(team);
    if (!isLocked) {
      Alert.fire({
        title: 'Locked!',
        type: 'warning',
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
    await Alert.fire({
      title: `Week ${weekOnPage} Matchups`,
      html: displayMatchups,
    });
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-12 fs-3 fw-bold text-center mt-2 mb-2'>
          {usernameOfPage}&apos;s Roster
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
            pastLockWeek={appLevelLockWeek >= weekOnPage}
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
