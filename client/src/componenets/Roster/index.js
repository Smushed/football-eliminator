import React, { useState, useEffect } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import PropTypes from 'prop-types';
import fuzzysort from 'fuzzysort';

import { RosterDisplay, PlayerDisplayRow, PlayerDisplayTable } from './RosterDisplay';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import './rosterStyle.css';
import './playerStyle.css';

import { loading, doneLoading } from '../LoadingAlert';
import { WeekSearch, PositionSearch } from './SearchDropdowns';
import * as Routes from '../../constants/routes';

const Alert = withReactContent(Swal);

const Roster = ({ appLevelLockWeek, week, season, match, username, userId, history, noGroup, updateLockWeek }) => {
    const [userRoster, updateUserRoster] = useState([]);
    const [availablePlayers, updateAvaliablePlayers] = useState([]);
    const [positionSelect, updatePositionSelect] = useState(`QB`); //This is the default value for the position search
    const [lastPosSearch, updateLastPosSearch] = useState(``);
    const [weekSelect, updateWeekSelect] = useState(0);
    const [weekOnPage, updateWeekOnPage] = useState(0); //The week and season are here when the player searches for their roster. This updates ONLY when the player actually refreshes their roster
    const [currentUser, updateCurrentUser] = useState(false);
    const [usernameOfPage, updateUsernameOfPage] = useState('');
    const [groupPositions, updateGroupPositions] = useState([]);
    const [positionArray, updatePositionArray] = useState([]);
    const [usedPlayers, updateUsedPlayers] = useState({});
    const [showUsedPlayers, updateShowUsedPlayers] = useState(true);
    const [currentPositionUsedPlayers, updateCurrentPositionUsedPlayers] = useState([]);
    const [positionMap, updatePositionMap] = useState([])
    const [weeklyMatchups, updateWeeklyMatchups] = useState([]);
    const [sortedMatchups, updateSortedMatchups] = useState([]);
    const [mustDrop, updateMustDrop] = useState(false);
    const [possiblePlayer, updatePossiblePlayer] = useState(0);
    const [possiblePlayers, updatePossiblePlayers] = useState([]);
    const [activePlayerSearch, updateActivatePlayerSearch] = useState(false);
    const [playerSearch, updatePlayerSearch] = useState(``);
    const [availPlayersToShow, updateAvailPlayersToShow] = useState([]);

    const axiosCancel = axios.CancelToken.source();

    useEffect(() => {
        if (noGroup) { history.push(Routes.groupPage); return; }

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

        updateAvailPlayersToShow(results.map(player => player.obj));
    }, [playerSearch]);

    useEffect(() => {
        return function cancelAPICalls() {
            if (axiosCancel) {
                axiosCancel.cancel(`Unmounted`);
            }
        }
    }, [])

    const primaryPull = (week, username) => {
        updateWeekSelect(week);
        updateUsernameOfPage(username);
        getRosterData(week);
        getUsedPlayers();
        checkCurrentUser()
    }

    const getUsedPlayers = () => {
        axios.get(`/api/players/used/${match.params.username}/${season}/${match.params.groupname}`, { cancelToken: axiosCancel.token })
            .then(res => {
                updateUsedPlayers(res.data);
            }).catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
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
        axios.get(`/api/matchups/${season}/${weekInput}`, { cancelToken: axiosCancel.token })
            .then(res => {
                updateWeeklyMatchups(res.data.matchups);
                updateSortedMatchups(res.data.sortedMatchups);
            })
            .catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
            });

    };

    const getRosterData = (weekInput) => {
        getWeeklyMatchUps(weekInput);
        updateWeekOnPage(weekInput);
        if (week !== 0 && season !== ``) {
            loading();
            axios.get(`/api/roster/user/${season}/${weekInput}/${match.params.groupname}/${match.params.username}`, { cancelToken: axiosCancel.token })
                .then(res => {
                    const { userRoster, groupPositions, groupMap, positionArray } = res.data;
                    updateUserRoster(userRoster);
                    updateGroupPositions(groupPositions);
                    updatePositionMap(groupMap);
                    updatePositionArray(positionArray);
                    doneLoading();
                }).catch(err => {
                    if (err.message !== `Unmounted`) { console.log(err); }
                    console.log(`roster data error`, err);
                });
        }
    };

    const tooManyPlayers = (currentRoster, allowedMap, addedPlayer) => {
        window.scrollTo(0, 0)
        const possibleDrops = [];
        for (let i = 0; i < allowedMap.length; i++) { //Allowed Map is an array of bool which will map to the rosters to be able to pick players
            if (allowedMap[i]) {
                possibleDrops.push(currentRoster[i]);
            }
        }
        possibleDrops.push(addedPlayer);

        updateMustDrop(true);
        updatePossiblePlayer(addedPlayer);
        updatePossiblePlayers(possibleDrops);

    };

    const chosePlayerForRoster = (chosenPlayer) => {
        let droppedPlayerIndex = 0;
        const currentRoster = [...userRoster];
        const droppedPlayer = currentRoster.find((player, i) => {
            if (+player.M === +chosenPlayer) {
                droppedPlayerIndex = i;
                return player;
            }
        });
        if (droppedPlayer) {
            let availDroppedPlayerIndex = -1;

            const availablePlayersCopy = [...availablePlayers];
            availablePlayersCopy.find((player, i) => {
                if (+player.M === +possiblePlayer.M) {
                    availDroppedPlayerIndex = i;
                }
            });
            if (availDroppedPlayerIndex >= 0) {
                availablePlayersCopy.splice(availDroppedPlayerIndex, 1);
            }
            if (droppedPlayer.P === positionSelect) {
                availablePlayersCopy.unshift(droppedPlayer);
            }
            currentRoster[droppedPlayerIndex] = { P: possiblePlayer.P, M: possiblePlayer.M, N: possiblePlayer.N, T: possiblePlayer.T };

            const usedPlayers = currentPositionUsedPlayers.filter(player => player.M !== droppedPlayer.M)
            usedPlayers.push(possiblePlayer);

            saveRosterToDb(currentRoster, droppedPlayer.M, possiblePlayer.M);
            updateAvaliablePlayers(availablePlayersCopy);
            updateCurrentPositionUsedPlayers(usedPlayers);
            updateMustDrop(false);
        } else {
            //The user has selected the player who is not on their team            
            updateUserRoster(currentRoster);
            updateMustDrop(false);
        }
    };

    const saveRosterToDb = (roster, droppedPlayer, addedPlayer) => {
        console.log({ roster, droppedPlayer, addedPlayer })
        loading()
        axios.put(`/api/user/roster`,
            {
                userId: userId,
                roster,
                droppedPlayer,
                addedPlayer,
                week: weekSelect,
                season: season,
                groupname: match.params.groupname
            },
            {
                cancelToken: axiosCancel.token
            })
            .then(res => {
                doneLoading();
                updateUserRoster(res.data);
                return;
            }).catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
            });
    };

    const checkLockPeriod = async (team) => {
        return true;
        axios.get(`/api/lock/general`, { cancelToken: axiosCancel.token })
            .then(res => updateLockWeek(res.data.LW))
            .catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
            });
        const { data } = await axios.get(`/api/lock/${season}/${weekOnPage}/${team}`);
        return data;
    };

    const positionSearch = (e) => {
        e.preventDefault();

        loading();
        axios.get(`/api/roster/players/available`,
            {
                params: { userId, searchedPosition: positionSelect, season: season, groupname: match.params.groupname },
                cancelToken: axiosCancel.token
            })
            .then(res => {
                updateLastPosSearch(positionSelect);
                updateAvaliablePlayers(res.data);
                updateAvailPlayersToShow(res.data);
                if (!usedPlayers[positionSelect]) {
                    getUsedPlayers();
                } else {
                    updateCurrentPositionUsedPlayers(usedPlayers[positionSelect])
                }
                doneLoading();
            })
            .catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
            });
    };

    const customSeasonWeekSearch = (e) => {
        e.preventDefault();
        updateUserRoster([]); //Blank it out before searching and pulling again
        getRosterData(weekSelect, season);
    };

    const toggleShowUsedPlayers = () => {
        updateShowUsedPlayers(!showUsedPlayers);
    };

    const handleChange = (e) => {
        e.target.name === 'playerSearch' && updatePlayerSearch(e.target.value);
        e.target.name === 'weekSelect' && updateWeekSelect(e.target.value);
        e.target.name === 'positionSelect' && updatePositionSelect(e.target.value);
    };

    const addPlayerToRoster = async (newRoster, addedPlayer, newAvailablePlayers) => {
        let sortedUpdatedRoster = [...newRoster];
        const playerPosition = positionArray.indexOf(addedPlayer.P);
        const allowedMap = [];
        let added = false;
        for (let i = 0; i < positionMap.length; i++) {
            if (positionMap[i].includes(playerPosition)) { //Checks the roster for how many spots the player is allowed to go into
                allowedMap[i] = true;
                if (!added) { //If they are not already added, add them. If they are ignore this
                    if (sortedUpdatedRoster[i].M === 0) { //If there is an open spot add the player
                        sortedUpdatedRoster[i] = addedPlayer;
                        added = true;
                    }
                }
            } else {
                allowedMap[i] = false;
            }
        }
        //Checks if we added a player without dropping one
        if (!added) {
            tooManyPlayers(sortedUpdatedRoster, allowedMap, addedPlayer);
        } else {
            saveRosterToDb(sortedUpdatedRoster, 0, addedPlayer.M);
            const newUsedPlayers = { ...usedPlayers };
            if (!newUsedPlayers[addedPlayer.P]) {
                newUsedPlayers[addedPlayer.P] = [];
            }
            newUsedPlayers[addedPlayer.P].push(addedPlayer);
            updateAvaliablePlayers(newAvailablePlayers);
            updateUsedPlayers(newUsedPlayers);
        }
    };

    const addDropPlayer = async (mySportsId, team, addOrDrop) => {
        console.log({ mySportsId, team, addOrDrop })
        if (!currentUser) {
            Alert.fire({
                title: `Not your roster!`,
                type: `warning`,
            });
            return;
        }
        const isLocked = await checkLockPeriod(team);
        if (!isLocked) {
            Alert.fire({
                title: `Locked!`,
                type: `warning`,
                text: `${team} has started for week ${weekOnPage}. Select a different player or week`,
            });
            return;
        }

        if (mustDrop) { //User has too many players on their roster, they are dropping to make room
            chosePlayerForRoster(mySportsId);
            return;
        }

        const newAvailablePlayers = [...availablePlayers];
        let newRoster = [...userRoster];

        if (addOrDrop === `add`) {
            let addedPlayerIndex = 0;

            const addedPlayer = newAvailablePlayers.find((player, i) => {
                if (player.M === mySportsId) {
                    addedPlayerIndex = i;
                    return player;
                }
            });

            newAvailablePlayers.splice(addedPlayerIndex, 1);
            addPlayerToRoster(newRoster, addedPlayer, newAvailablePlayers);
        } else if (addOrDrop === `drop`) {
            let droppedPlayerIndex = 0;
            const droppedPlayer = newRoster.find((player, i) => {
                if (player.M === mySportsId) {
                    droppedPlayerIndex = i;
                    return player;
                }
            });

            newRoster[droppedPlayerIndex] = { M: 0, S: 0 };
            newAvailablePlayers.unshift(droppedPlayer);

            updateAvaliablePlayers(newAvailablePlayers);
            saveRosterToDb(newRoster, mySportsId, false);
        }
    };

    const showMatchUps = async () => {
        let displayMatchups = `Home   -   Away<br />`;
        for (let i = 0; i < weeklyMatchups.length; i++) {
            displayMatchups += `<br/>${weeklyMatchups[i].H}  -  ${weeklyMatchups[i].A}`
        }
        await Alert.fire({
            title: `Week ${weekOnPage} Matchups`,
            html: displayMatchups,
        });
    };

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-12 fs-3 text-center'>
                    {usernameOfPage}&apos;s Roster
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='row'>
                        <div className='col-12'>
                            <div className='row justify-content-center mt-2 mb-2'>
                                <div className='col-sm-12 col-md-4 col-lg-2 text-center'>
                                    <button className='btn btn-success' disabled={mustDrop} onClick={() => toggleShowUsedPlayers()}>Show Used Players</button>
                                </div>
                                <div className='col-sm-12 col-md-4 col-lg-2 text-center'>
                                    <button className='btn btn-success' onClick={() => showMatchUps()}>Match Ups</button>
                                </div>
                                <div className='col-sm-12 col-md-4 col-lg-2 text-center'>
                                    <button className='btn btn-success' onClick={() => updateActivatePlayerSearch(!activePlayerSearch)}>Show Player Search</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='row justify-content-center'>
                        <div className='col-6 mt-1 mb-2'>
                            {activePlayerSearch &&
                                <div className='playerSearchBox input-group input-group-lg'>
                                    <span className='input-group-text rosterFieldDescription'>
                                        Player:
                                    </span>
                                    <input className='form-control' name='playerSearch' value={playerSearch} type='text' onChange={handleChange} />
                                </div>
                            }
                        </div>
                    </div>

                    <div className='row justify-content-center'>
                        <div className='col-4'>
                            <div className='row'>
                                <div className='col-12 text-center'>
                                    Change Week
                                </div>
                            </div>
                            <WeekSearch
                                weekSelect={weekSelect}
                                handleChange={handleChange}
                                customSeasonWeekSearch={customSeasonWeekSearch}
                                disabled={mustDrop} />
                        </div>
                        <div className='col-4'>
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
                                    disabled={mustDrop} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row justify-content-center'>
                <div className='col-sm-12 col-md-4 me-3 rosterTransition'>
                    <RosterDisplay
                        headerText={mustDrop ? `Too Many Players, drop one` : `Week ${weekOnPage} Roster`}
                        pastLockWeek={appLevelLockWeek >= weekOnPage}
                        groupPositions={groupPositions}
                        addDropPlayer={addDropPlayer}
                        roster={mustDrop ? possiblePlayers : userRoster}
                        mustDrop={mustDrop}
                    />
                    <div className={`usedPlayerCol ${mustDrop && `rosterHide`} ${!showUsedPlayers && ` zeroTransparent`}`}>
                        <PlayerDisplayTable
                            headerText={`Used ${lastPosSearch ? lastPosSearch : 'Player'}s`}
                            playerList={currentPositionUsedPlayers}
                        />
                    </div>
                </div>
                <div className={`col-sm-12 col-md-4 rosterTransition ${mustDrop && `rosterHide`}`}>
                    <PlayerDisplayTable
                        headerText='Available Players'
                        playerList={availPlayersToShow}
                        sortedMatchups={sortedMatchups}
                        addDropPlayer={mustDrop ? false : addDropPlayer}
                    />
                </div>
            </div>
        </div >
    );
};

Roster.propTypes = {
    updateLockWeek: PropTypes.func,
    appLevelLockWeek: PropTypes.number,
    week: PropTypes.number,
    season: PropTypes.string,
    match: PropTypes.any,
    username: PropTypes.string,
    userId: PropTypes.string,
    history: PropTypes.object,
    noGroup: PropTypes.bool
};

PlayerDisplayRow.propTypes = {
    evenOrOddRow: PropTypes.number,
    player: PropTypes.object,
    addDropPlayer: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func
    ]),
    sortedMatchups: PropTypes.object
};

RosterDisplay.propTypes = {
    groupPositions: PropTypes.array,
    roster: PropTypes.array,
    addDropPlayer: PropTypes.func,
    mustDrop: PropTypes.bool,
    pastLockWeek: PropTypes.bool
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);