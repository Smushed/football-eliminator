import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { withAuthorization } from '../Session';
import axios from 'axios';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import './rosterStyle.css';
import './playerStyle.css';

import { WeekSearch, PositionSearch, PlayerSearch } from './SearchDropdowns';

const Alert = withReactContent(Swal);

class Roster extends Component {
    constructor(props) {
        super(props);
        //Must set state hard here to ensure that it is loaded properly when the component unmounts and remounts±
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            userRoster: [],
            availablePlayers: [],
            positionSelect: `QB`, //This is the default value for the position search
            playerSearch: ``,
            weekSelect: 0,
            weekOnPage: 0, //The week and season are here when the player searches for their roster. This updates ONLY when the player actually refreshes their roster
            currentUser: false,
            usernameOfPage: '',
            groupPositions: [],
            positionArray: [],
            maxPosition: {},
            usedPlayers: {},
            currentPositionUsedPlayers: [],
            positionMap: []
        };
    };

    componentDidMount() {
        if (this.props.week !== 0 && this.props.season !== '') {
            this.setState({ weekSelect: this.props.week });
            this.getRosterData(this.props.week);
            this.getUsedPlayers();
            this.checkCurrentUser();
            this.getCurrentUsername();
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            this.setState({ weekSelect: this.props.week });
            this.getRosterData(this.props.week);
            this.getUsedPlayers();
            this.checkCurrentUser();
            this.getCurrentUsername();
        };
    };

    componentWillUnmount() {
        this.doneLoading();
    };

    getUsedPlayers() {
        axios.get(`/api/getUsedPlayers/${this.props.match.params.userId}/${this.props.season}/${this.props.match.params.groupId}`)
            .then(res => {
                this.setState({ usedPlayers: res.data })
            }).catch(err => {
                console.log(err); //TODO better error handling
            });
    };

    getCurrentUsername() {
        axios.get(`/api/getUserById/${this.props.match.params.userId}`)
            .then(res => {
                this.setState({ usernameOfPage: res.data.UN })
            }).catch(err => {
                console.log(err); //TODO better error handling
            });
    };

    checkCurrentUser() {
        if (this.props.userId === this.props.match.params.userId) {
            this.setState({ currentUser: true });
        } else {
            this.setState({ currentUser: false });
        };
    };

    //We define loading and done loading here to have swal pop ups whenever we are pulling in data so the user can't mess with data while it's in a loading state
    loading() {
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

    doneLoading() {
        Alert.close()
    };

    clearPlayers = () => {
        //Gets rid of all the players that are sitting in state when the user goes to another week
        this.setState({ userRoster: [] });
    };

    getRosterData = (week) => {

        this.setState({ weekOnPage: week })
        if (this.props.week !== 0 && this.props.season !== ``) {
            this.loading();
            axios.get(`/api/userRoster/${this.props.match.params.groupId}/${this.props.match.params.userId}`,
                { params: { week, season: this.props.season } })
                .then(res => {
                    this.setState({ userRoster: res.data.userRoster, groupPositions: res.data.groupPositions, positionMap: res.data.groupMap, positionArray: res.data.positionArray });
                    this.countMaxPosition(res.data.groupMap, res.data.positionArray);
                    this.doneLoading();
                }).catch(err => {
                    console.log(`roster data error`, err); //TODO better error handling
                });
        };
    };

    countMaxPosition = (groupPositionMap, positionArray) => {
        var maxPosition = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, total: 0 };
        for (const posMap of groupPositionMap) {
            for (const pos of posMap) {
                maxPosition[positionArray[pos]]++
            };
        };
        maxPosition.total = groupPositionMap.length;
        this.setState({ maxPosition });
    };

    countLogic = (roster) => {
        let QBCount = 0;
        let RBCount = 0;
        let WRCount = 0;
        let TECount = 0;
        let KCount = 0;

        //We then go through the current user roster and populate it with data to sort it and get all the players
        for (let i = 0; i < roster.length; i++) {
            const position = roster[i].P;
            //For the RB And WR positions, there are three options each they can be in
            //RB/WR 1 & 2 as well as a flex position. All of which are undefined because we cannot have duplicate keys in an object
            //We use a switch statement for WR and RB and start pulling the data into the fake roster
            if (position === `RB`) {
                RBCount++;
            } else if (position === `WR`) {
                WRCount++;
            } else if (position === `QB`) {
                QBCount++;
            } else if (position === `TE`) {
                TECount++;
            } else if (position === `K`) {
                KCount++;
            };
        };
        return { QBCount, RBCount, WRCount, TECount, KCount }
    };

    tooManyPlayers = async (sortedUpdatedRoster, allowedMap, addedPlayer) => {
        return new Promise(async (res, rej) => {

            // let filteredRoster = [];
            // if (position === `Flex`) {
            //     filteredRoster = roster.filter(player => player.P === `RB` || player.P === `WR`);
            // } else {
            //     filteredRoster = roster.filter(player => player.P === position);
            // };

            // //Iterate over the filtered array and get the full data for the players to give the user a choice
            // //We need it in this format so swal will properly list the options
            // const fullPlayers = {};

            // for (let i = 0; i < filteredRoster.length; i++) {
            //     //First we have to initialize the object because of the bracket notation
            //     fullPlayers[filteredRoster[i].M] = ``;
            //     //THen we populate the full name from the state to give the player the chance to pick between the one they just added and the player on their roster
            //     fullPlayers[filteredRoster[i].M] = filteredRoster[i].N;
            // };

            // //chosenPlayer === the player the user would like to be dropped
            // const { value: chosenPlayer } = await Alert.fire({
            //     title: `Too many ${position}s`,
            //     input: `select`,
            //     inputPlaceholder: `Which player do you want to drop?`,
            //     inputOptions: fullPlayers,
            //     showCancelButton: true,
            // });

            // if (+chosenPlayer === +addedPlayer.M) {
            //     this.setState({ userRoster: originalRoster });
            //     return;
            // };

            // //If the player responded with the player they would like to drop then we will take them out of their current array and then set the new state
            // if (chosenPlayer) {
            //     const intChosenPlayer = parseInt(chosenPlayer);
            //     const intAddedPlayer = parseInt(addedPlayer.M);

            //     const availablePlayers = originalAvailablePlayers.slice(0);
            //     let droppedPlayerIndex = 0;
            //     let availDroppedPlayerIndex = -1;

            //     const droppedPlayer = roster.find((player, i) => {
            //         if (player.M === intChosenPlayer) {
            //             droppedPlayerIndex = i;
            //             return player;
            //         };
            //     });
            //     availablePlayers.find((player, i) => {
            //         if (player.M === intAddedPlayer) {
            //             availDroppedPlayerIndex = i;
            //         };
            //     });

            //     //Remove the player they chose from the array and then save it down into state
            //     if (availDroppedPlayerIndex >= 0) {
            //         availablePlayers.splice(availDroppedPlayerIndex, 1);
            //     };
            //     if (position === `Flex`) {
            //         const { RBCount, WRCount } = this.countLogic(originalRoster);
            //         if (RBCount === 3) {
            //             if (addedPlayer.P === `RB`) {
            //                 roster[droppedPlayerIndex] = { P: addedPlayer.P, M: addedPlayer.M, N: addedPlayer.N, T: addedPlayer.T };
            //                 roster.pop();
            //             } else {
            //                 if (droppedPlayerIndex === 5) {
            //                     roster[droppedPlayerIndex] = { P: addedPlayer.P, M: addedPlayer.M, N: addedPlayer.N, T: addedPlayer.T };
            //                     roster.pop();
            //                 } else {
            //                     roster[droppedPlayerIndex] = { P: roster[5].P, M: roster[5].M, N: roster[5].N, T: roster[5].T };
            //                     roster[5] = { P: addedPlayer.P, M: addedPlayer.M, N: addedPlayer.N, T: addedPlayer.T };
            //                     roster.pop();
            //                 };
            //             };
            //         } else if (WRCount === 3) {
            //             if (addedPlayer.P === `WR`) {
            //                 roster[droppedPlayerIndex] = { P: addedPlayer.P, M: addedPlayer.M, N: addedPlayer.N, T: addedPlayer.T };
            //             } else {
            //                 if (droppedPlayerIndex === 5) {
            //                     roster[droppedPlayerIndex] = { P: addedPlayer.P, M: addedPlayer.M, N: addedPlayer.N, T: addedPlayer.T };
            //                     roster.pop();
            //                 } else {
            //                     roster[droppedPlayerIndex] = { P: roster[5].P, M: roster[5].M, N: roster[5].N, T: roster[5].T };
            //                     roster[5] = { P: addedPlayer.P, M: addedPlayer.M, N: addedPlayer.N, T: addedPlayer.T };
            //                     roster.pop();
            //                 };
            //             };
            //         };
            //     } else {
            //         roster[droppedPlayerIndex] = { P: addedPlayer.P, M: addedPlayer.M, N: addedPlayer.N, T: addedPlayer.T };
            //         roster.pop();
            //     };

            //     //Add the player they dropped back to the available list of players
            //     if (droppedPlayer.P === this.state.positionSelect) {
            //         availablePlayers.unshift(droppedPlayer);
            //     };

            //     //Now we make one final check before moving things along. If everything is done right above this should be simple.
            //     const checkRoster = this.checkRoster(roster);

            //     //If the check failed, then we will have an issue and are going to revert the state back to the previous point
            //     if (checkRoster) {
            //         //We take the array of player IDs that are on the user roster and sort them
            //         this.setState({ userRoster: roster });

            //         //We need to new array to get the new player added and the old player so we can pull them out of the usedPlayersArray in the DB
            //         this.saveRosterToDb(roster, chosenPlayer, intAddedPlayer, false);

            //         this.setState({ availablePlayers: availablePlayers });
            //     } else {
            //         Alert.fire({
            //             type: 'warning',
            //             title: 'Roster Save Error!',
            //             text: 'Something went wrong with saving your roster! Please refresh and try again',
            //             confirmButtonColor: '#3085d6',
            //             confirmButtonText: 'Take me back'
            //         });
            //         this.setState({ userRoster: originalRoster });
            //     };
            // } else if (chosenPlayer === undefined) {
            //     //This is if the player has chosen to cancel out of the box above. We reload the old state to remove the player they just added
            //     this.setState({ userRoster: originalRoster, availablePlayers: originalAvailablePlayers });
            // } else {
            //     //This is if the player doesn't select one of the players and just presses accept
            //     await Alert.fire(`You must pick one or cancel`)
            //     this.tooManyPlayers(originalRoster, roster, position, originalAvailablePlayers);
            // };


            res();
        })
    };

    saveRosterToDb = async (roster, droppedPlayer, addedPlayer) => {
        this.loading()
        axios.put(`/api/updateUserRoster`,
            { userId: this.props.userId, roster, droppedPlayer, addedPlayer, week: this.state.weekSelect, season: this.props.season, groupId: this.props.match.params.groupId })
            .then(res => {
                this.doneLoading();
                this.setState({ userRoster: res.data })
                return;
            }).catch(err => {
                console.log(err)//TODO Better error handling
            });
    };

    checkLockPeriod = async () => {
        const response = await axios.get(`/api/checkLockPeriod`);
        if (response.data.LW === 0) {
            return true;
        };

        if (this.state.weekOnPage <= response.data.LW) {
            return false;
        };

        return true;
    };

    positionSearch = (e) => {
        e.preventDefault();

        this.loading();
        const userId = this.props.userId;
        axios.get(`/api/availablePlayers`,
            { params: { userId, searchedPosition: this.state.positionSelect, season: this.props.season, groupId: this.props.match.params.groupId } })
            .then(res => {
                const { usedPlayers, positionSelect } = this.state;
                this.setState({ availablePlayers: res.data });
                this.setState({ currentPositionUsedPlayers: usedPlayers[positionSelect] })
                this.doneLoading();
            });
    };

    customPlayerSearch = (e) => {
        e.preventDefault();

        console.log(this.state.playerSearch);
    };

    customSeasonWeekSearch = (e) => {
        e.preventDefault();

        const userRoster = [];

        this.setState({ userRoster })

        this.getRosterData(this.state.weekSelect, this.props.season);
    };

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    addPlayerToRoster = async (newRoster, addedPlayer) => {
        let sortedUpdatedRoster = newRoster.slice(0);
        const { positionMap } = this.state;
        const playerIndex = this.state.positionArray.indexOf(addedPlayer.P);
        const allowedMap = [];
        let added = false;
        for (let i = 0; i < positionMap.length; i++) {
            if (positionMap[i].includes(playerIndex)) {
                allowedMap[i] = true;
                if (sortedUpdatedRoster[i] === 0) {
                    sortedUpdatedRoster[i] = addedPlayer;
                    added = true;
                }
            } else {
                allowedMap[i] = false;
            };
        };
        if (!added) {
            this.tooManyPlayers(sortedUpdatedRoster, allowedMap, addedPlayer);
        } else {
            //TODO HAVE IT SAVE HERE RATHER THAN BOUNCE BACK
        }
    }

    addDropPlayer = async (mySportsId, addOrDrop) => {
        if (!this.state.currentUser) {
            Alert.fire({
                title: `Not your roster!`,
                type: `warning`,
            });
            return;
        };
        const isLocked = await this.checkLockPeriod();
        if (!isLocked) {
            Alert.fire({
                title: `Peroid is locked!`,
                type: `warning`,
                text: `Week ${this.state.weekOnPage} is locked. Please search a different week`,
            });
            return;
        };

        const newAvailablePlayers = this.state.availablePlayers.slice(0);
        let newRoster = this.state.userRoster.slice(0);

        if (addOrDrop === `add`) {
            let addedPlayerIndex = 0;

            const addedPlayer = newAvailablePlayers.find((player, i) => {
                if (player.M === mySportsId) {
                    addedPlayerIndex = i;
                    return player;
                };
            });

            newAvailablePlayers.splice(addedPlayerIndex, 1);
            this.addPlayerToRoster(newRoster, addedPlayer)
        } else if (addOrDrop === `drop`) {
            let droppedPlayerIndex = 0;
            const droppedPlayer = newRoster.find((player, i) => {
                if (player.M === mySportsId) {
                    droppedPlayerIndex = i;
                    return player;
                };
            });

            newRoster.splice(droppedPlayerIndex, 1);
            newAvailablePlayers.unshift(droppedPlayer);

            this.setState({ availablePlayers: newAvailablePlayers });
            this.saveRosterToDb(newRoster, mySportsId, false);

        };
    };

    render() {
        return (
            <div>
                <div className='centerText headerFont userNameRow'>
                    {this.state.usernameOfPage}'s Roster
                </div>
                <div className='smallSearchContainer'>
                    <div className='searchRow'>
                        Change Week
                        <WeekSearch weekSelect={this.state.weekSelect} handleChange={this.handleChange} customSeasonWeekSearch={this.customSeasonWeekSearch} />
                    </div>
                    <div className='searchRow'>
                        Position Search
                        <PositionSearch positionSelect={this.state.positionSelect} handleChange={this.handleChange} positionSearch={this.positionSearch} />
                    </div>
                    <div className='searchRow'>
                        Player Search
                        <PlayerSearch playerSearch={this.state.playerSearch} handleChange={this.handleChange} customPlayerSearch={this.customPlayerSearch} />
                    </div>
                </div>
                <div className='rosterContainer'>
                    <div className='rosterCol'>
                        <div className='searchRow largeScreenShow'>
                            Change Week
                            <WeekSearch weekSelect={this.state.weekSelect} handleChange={this.handleChange} customSeasonWeekSearch={this.customSeasonWeekSearch} />
                        </div>
                        <div className='sectionHeader'>
                            Week {this.state.weekOnPage} Roster
                        </div>
                        <RosterDisplay
                            groupPositions={this.state.groupPositions}
                            addDropPlayer={this.addDropPlayer}
                            roster={this.state.userRoster || {}}
                        />
                    </div>
                    <div className='rosterCol'>
                        <div className='searchRow largeScreenShow'>
                            Position Search
                            <PositionSearch positionSelect={this.state.positionSelect} handleChange={this.handleChange} positionSearch={this.positionSearch} />
                        </div>
                        <div className='sectionHeader'>
                            Available Players
                        </div>
                        {this.state.availablePlayers.map((player, i) => (
                            <PlayerDisplayRow player={player} key={i} addDropPlayer={this.addDropPlayer} evenOrOddRow={i % 2} />
                        ))}
                    </div>
                    <div className='rosterCol largeScreenShow'>
                        <div className='searchRow'>
                            Player Search
                            <PlayerSearch playerSearch={this.state.playerSearch} handleChange={this.handleChange} customPlayerSearch={this.customPlayerSearch} />
                        </div>
                        <div className='sectionHeader'>
                            Used Players
                        </div>
                        {this.state.currentPositionUsedPlayers.map((player, i) => (
                            <PlayerDisplayRow player={player} key={i} evenOrOddRow={i % 2} />
                        ))}
                    </div>
                </div>
            </div>
        );
    };
};

const CurrentRosterRow = (props) => (
    <div className={props.evenOrOddRow === 0 ? 'playerRow' : 'playerRow oddRow'}>
        <div className='positionBox'>
            {props.position}
        </div>
        {props.player ?
            <div className='playerContainer'>
                {props.player.N &&
                    <div className='playerCol'>
                        {props.player.N}
                    </div>
                }
                {props.player.T &&
                    <div className='teamCol'>
                        {props.player.T}
                    </div>
                }
                {props.player.score ?
                    <div className='scoreCol'>
                        {props.player.score}
                    </div>
                    :
                    props.addDropPlayer &&
                    <button className='addDropButton btn btn-outline-success btn-sm' onClick={() => props.addDropPlayer(props.player.M, 'drop')}>
                        Drop
                    </button>
                }
            </div>
            : ``
        }
    </div>
);

const PlayerDisplayRow = (props) => (
    <div className={props.evenOrOddRow === 0 ? 'playerRow playerContainer' : 'playerRow playerContainer oddRow'}>
        <div className='playerCol'>
            {props.player.N && props.player.N}
        </div>
        <div className='teamCol'>
            {props.player.T && props.player.T}
        </div>
        <div className='posCol'>
            {props.player.P && props.player.P}
        </div>
        {props.addDropPlayer &&
            <button className='addDropButton btn btn-outline-success btn-sm' onClick={() => props.addDropPlayer(props.player.M, 'add')}>
                Add
            </button>
        }
    </div>
);

const RosterDisplay = (props) => (
    <Fragment>
        {props.groupPositions.map((position, i) => (
            <CurrentRosterRow
                key={i}
                position={position.N}
                player={props.roster[i]}
                addDropPlayer={props.addDropPlayer}
                evenOrOddRow={i % 2}
            />
        ))}
        {props.UID &&
            <div className='usedPlayerButton'>
                <Link to={`/usedPlayers/${props.UID}`}>
                    <button className='btn btn-info'>
                        {props.UN}'s used Players
                    </button>
                </Link>
            </div>
        }
    </Fragment>
);


const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);
export { RosterDisplay, PlayerDisplayRow };