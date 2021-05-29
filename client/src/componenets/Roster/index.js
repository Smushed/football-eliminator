import React, { useState, useEffect } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import PropTypes from 'prop-types';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import './rosterStyle.css';
import './playerStyle.css';

import { WeekSearch, PositionSearch } from './SearchDropdowns';

const Alert = withReactContent(Swal);

const Roster = ({ latestLockWeek, updateLockWeekOnPull, week, season, match, username, userId }) => {
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
    const [mustDrop, updateMustDrop] = useState(false);
    const [possiblePlayer, updatePossiblePlayer] = useState(0);
    const [possiblePlayers, updatePossiblePlayers] = useState([]);

    useEffect(() => {
        if (week !== 0 && season !== '') {
            updateWeekSelect(+week);
            updateUsernameOfPage(match.params.username);
            getRosterData(week);
            getUsedPlayers();
            checkCurrentUser();
        }
    }, [week, season, match.params.username])


    const getUsedPlayers = () => {
        axios.get(`/api/getUsedPlayers/${match.params.username}/${season}/${match.params.groupname}`)
            .then(res => {
                updateUsedPlayers(res.data);
            }).catch(err => {
                console.log(err); //TODO better error handling
            });
    };

    const checkCurrentUser = () => {
        if (username === match.params.username) {
            updateCurrentUser(true);
        } else {
            updateCurrentUser(false);
        }
    };

    const getWeeklyMatchUps = async (weekInput) => {
        axios.get(`/api/getWeeklyMatchups/${season}/${weekInput}`)
            .then(res => {
                updateWeeklyMatchups(res.data);
            });

    };

    //We define loading and done loading here to have swal pop ups whenever we are pulling in data so the user can't mess with data while it's in a loading state
    const loading = () => {
        Alert.fire({
            title: 'Loading',
            text: 'Loading available players',
            imageUrl: 'https://media.giphy.com/media/3o7aDczpCChShEG27S/giphy.gif',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'Loading Football',
            showConfirmButton: false,
            showCancelButton: false
        });
    };

    const doneLoading = () => {
        Alert.close()
    };

    const getRosterData = (weekInput) => {
        getWeeklyMatchUps(weekInput);
        updateWeekOnPage(weekInput);
        if (week !== 0 && season !== ``) {
            loading();
            axios.get(`/api/userRoster/${season}/${weekInput}/${match.params.groupname}/${match.params.username}`)
                .then(res => {
                    const { userRoster, groupPositions, groupMap, positionArray } = res.data;
                    updateUserRoster(userRoster);
                    updateGroupPositions(groupPositions);
                    updatePositionMap(groupMap);
                    updatePositionArray(positionArray);
                    doneLoading();
                }).catch(err => {
                    console.log(`roster data error`, err); //TODO better error handling
                });
        }
    };

    const tooManyPlayers = async (currentRoster, allowedMap, addedPlayer) => {
        console.log(`tooManyPlayers`, currentRoster, allowedMap, addedPlayer)
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

    const saveRosterToDb = async (roster, droppedPlayer, addedPlayer) => {
        loading()
        axios.put(`/api/updateUserRoster`,
            { userId: userId, roster, droppedPlayer, addedPlayer, week: weekSelect, season: season, groupname: match.params.groupname })
            .then(res => {
                console.log(res.data)
                doneLoading();
                updateUserRoster(res.data);
                return;
            }).catch(err => {
                console.log(err)//TODO Better error handling
            });
    };

    const checkLockPeriod = async () => {
        const response = await axios.get(`/api/checkLockPeriod`);
        console.log(response.data)
        updateLockWeekOnPull(response.data.LW);
        if (response.data.LW === 0) {
            return true;
        }
        if (weekOnPage <= response.data.LW) {
            return false;
        }
        return true;
    };

    const positionSearch = (e) => {
        e.preventDefault();

        loading();
        axios.get(`/api/availablePlayers`,
            { params: { userId, searchedPosition: positionSelect, season: season, groupId: match.params.groupId } })
            .then(res => {
                updateLastPosSearch(positionSelect);
                updateAvaliablePlayers(res.data);
                if (!usedPlayers[positionSelect]) {
                    getUsedPlayers();
                } else {
                    updateCurrentPositionUsedPlayers(usedPlayers[positionSelect])
                }
                doneLoading();
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

    const addDropPlayer = async (mySportsId, addOrDrop) => {
        if (!currentUser) {
            Alert.fire({
                title: `Not your roster!`,
                type: `warning`,
            });
            return;
        }
        const isLocked = await checkLockPeriod();
        if (!isLocked) {
            Alert.fire({
                title: `Peroid is locked!`,
                type: `warning`,
                text: `Week ${weekOnPage} is locked. Please search a different week`,
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

    const showSingleMatchUp = async (team) => {
        const matchup = weeklyMatchups.find(match => (match.H === team || match.A === team));
        if (!matchup) {
            await Alert.fire({
                title: `${team} is on bye!`,
            });
            return;
        } else if (!matchup.H || !matchup.A) {
            return;
        }
        const display = `Home: ${matchup.H}<br />Away:${matchup.A}`
        await Alert.fire({
            title: `${team} week ${weekOnPage} match`,
            html: display
        })
    };

    return (
        <div>
            <div className='centerText headerFont usernameRow'>
                {usernameOfPage}&apos;s Roster
                </div>
            <div className='rosterPageContainer'>
                <div className='leftSearchRow'>
                    <div className='searchRow'>
                        Change Week
                            <WeekSearch
                            weekSelect={weekSelect}
                            handleChange={handleChange}
                            customSeasonWeekSearch={customSeasonWeekSearch}
                            disabled={mustDrop} />
                    </div>
                    <div className='searchRow largeScreenShow'>
                        Position Search
                            <PositionSearch
                            positionSelect={positionSelect}
                            handleChange={handleChange}
                            positionSearch={positionSearch}
                            disabled={mustDrop} />
                    </div>
                    <div className='searchRow largeScreenShow noMargin'>
                        <button className='btn btn-success' disabled={mustDrop} onClick={() => toggleShowUsedPlayers()}>Show Used Players</button>
                    </div>
                    <div className='searchRow largeScreenShow'>
                        <button className='btn btn-success' onClick={() => showMatchUps()}>Match Ups</button>
                    </div>
                </div>
                <div className='rosterContainer'>
                    <div className={`rosterCol ${mustDrop && `adjustRosterSpacing`}`}>
                        <div className='sectionHeader'>
                            {mustDrop ? `Too Many Players, drop one` : `Week ${weekOnPage} Roster`}
                        </div>
                        <RosterDisplay
                            pastLockWeek={latestLockWeek >= weekOnPage}
                            showSingleMatchUp={showSingleMatchUp}
                            groupPositions={groupPositions}
                            addDropPlayer={addDropPlayer}
                            roster={mustDrop ? possiblePlayers : userRoster}
                            mustDrop={mustDrop}
                        />
                        <div className={`usedPlayerCol ${mustDrop && `rosterHide`} ${!showUsedPlayers && ` zeroTransparent`}`}>
                            <div className='sectionHeader'>
                                Used {lastPosSearch ? lastPosSearch : 'Player'}s
                            </div>
                            {currentPositionUsedPlayers.map((player, i) => (
                                <PlayerDisplayRow
                                    showSingleMatchUp={showUsedPlayers && showSingleMatchUp}
                                    player={player} key={i}
                                    evenOrOddRow={i % 2} />
                            ))}
                        </div>
                    </div>
                    <div className={`rosterCol ${mustDrop && `thirtyTransparent`}`}>
                        <div className='sectionHeader'>
                            Available Players
                        </div>
                        {availablePlayers.map((player, i) => (
                            <PlayerDisplayRow
                                showSingleMatchUp={showSingleMatchUp}
                                player={player} key={i}
                                addDropPlayer={mustDrop ? false : addDropPlayer}
                                evenOrOddRow={i % 2} />
                        ))}
                    </div>

                </div>
            </div>
        </div>

    );
};

const CurrentRosterRow = ({ evenOrOddRow, player, position, showSingleMatchUp, addDropPlayer, pastLockWeek }) => (
    <div className={evenOrOddRow === 0 ? 'playerRow' : 'playerRow oddRow'}>
        <div className='positionBox'>
            {position}
        </div>
        <div className='playerContainer'>
            {player &&
                (player.M !== 0 ?
                    <div className='hasPlayerContainer'>
                        {player.N &&
                            <div className='playerCol'>
                                {player.N}
                            </div>
                        }
                        {player.T &&
                            <div onClick={() => (showSingleMatchUp && showSingleMatchUp(player.T))} className={`teamCol ${(showSingleMatchUp && `pointer`)}`}>
                                {player.T}
                            </div>
                        }
                        {pastLockWeek === true ?
                            <div className='scoreCol'>
                                {player.SC.toFixed(2)}
                            </div> :
                            addDropPlayer &&
                            <button className='addDropButton custom-button' onClick={() => addDropPlayer(player.M, 'drop')}>
                                Drop
                    </button>
                        }
                    </div>
                    : ``
                )}
        </div>
    </div >
);

const PlayerDisplayRow = ({ evenOrOddRow, player, showSingleMatchUp, addDropPlayer }) => (
    <div className={evenOrOddRow === 0 ? 'playerRow' : 'playerRow oddRow'}>
        <div className='playerCol'>
            {player.N && player.N}
        </div>
        <div onClick={() => (showSingleMatchUp && showSingleMatchUp(player.T))} className={`teamCol ${(showSingleMatchUp && `pointer`)}`}>
            {player.T && player.T}
        </div>
        <div className='posCol'>
            {player.P && player.P}
        </div>
        {addDropPlayer &&
            <button className='addDropButton custom-button' onClick={() => addDropPlayer(player.M, 'add')}>
                Add
            </button>
        }
    </div>
);

const RosterDisplay = ({ groupPositions, showSingleMatchUp, roster, addDropPlayer, mustDrop, pastLockWeek }) =>
    mustDrop ?
        roster.map((player, i) =>
            <CurrentRosterRow
                key={i}
                showSingleMatchUp={showSingleMatchUp}
                position={player.P}
                player={player}
                addDropPlayer={addDropPlayer}
                evenOrOddRow={i % 2}
            />) :
        groupPositions.map((position, i) => (
            <CurrentRosterRow
                key={i}
                pastLockWeek={pastLockWeek}
                showSingleMatchUp={showSingleMatchUp}
                position={position.N}
                player={roster[i]}
                addDropPlayer={addDropPlayer}
                evenOrOddRow={i % 2}
            />
        ));


Roster.propTypes = {
    latestLockWeek: PropTypes.number,
    updateLockWeekOnPull: PropTypes.func,
    week: PropTypes.number,
    season: PropTypes.string,
    match: PropTypes.any,
    username: PropTypes.string,
    userId: PropTypes.string
};

CurrentRosterRow.propTypes = {
    evenOrOddRow: PropTypes.number,
    player: PropTypes.object,
    position: PropTypes.string,
    showSingleMatchUp: PropTypes.func,
    addDropPlayer: PropTypes.func,
    pastLockWeek: PropTypes.bool
};

PlayerDisplayRow.propTypes = {
    evenOrOddRow: PropTypes.number,
    player: PropTypes.object,
    showSingleMatchUp: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func
    ]),
    addDropPlayer: PropTypes.func
};

RosterDisplay.propTypes = {
    groupPositions: PropTypes.array,
    showSingleMatchUp: PropTypes.func,
    roster: PropTypes.array,
    addDropPlayer: PropTypes.func,
    mustDrop: PropTypes.bool,
    pastLockWeek: PropTypes.bool
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);
export { RosterDisplay, PlayerDisplayRow };

        //             {/* <div className='rosterCol largeScreenShow'>
        //                 <div className='searchRow'>
        //                     <br />
        //                     
        //                 </div>
        //                 <div className='sectionHeader'>
        //                     Used Players
        //                 </div>
        //                 {this.state.currentPositionUsedPlayers.map((player, i) => (
        //                     <PlayerDisplayRow player={player} key={i} evenOrOddRow={i % 2} />
        //                 ))}
        //             </div> */}
        // {/*SMALL SCREEN COMMENTED OUT FOR NOW
        //         <div className='smallSearchContainer'>
        //             <div className='searchRow'>
        //                 Change Week
        //                 <WeekSearch weekSelect={this.state.weekSelect} handleChange={this.handleChange} customSeasonWeekSearch={this.customSeasonWeekSearch} />
        //             </div>
        //             <div className='searchRow'>
        //                 Position Search
        //                 <PositionSearch
        //                     positionSelect={this.state.positionSelect}
        //                     handleChange={this.handleChange}
        //                     positionSearch={this.positionSearch} />
        //             </div>
        //             <div className='searchRow'>
        //                 Player Search
        //                 <PlayerSearch
        //                     playerSearch={this.state.playerSearch}
        //                     handleChange={this.handleChange}
        //                     customPlayerSearch={this.customPlayerSearch} />
        //             </div>
        //         </div> */}