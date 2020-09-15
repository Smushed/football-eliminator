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
            usedPlayers: {},
            currentPositionUsedPlayers: [],
            positionMap: [],
            weeklyMatchups: []
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

    getWeeklyMatchUps = async (week) => {
        axios.get(`/api/getWeeklyMatchups/${this.props.season}/${week}`)
            .then(res => {
                this.setState({ weeklyMatchups: res.data })
            });

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
        this.getWeeklyMatchUps(week);
        this.setState({ weekOnPage: week })
        if (this.props.week !== 0 && this.props.season !== ``) {
            this.loading();
            axios.get(`/api/userRoster/${this.props.match.params.groupId}/${this.props.match.params.userId}`,
                { params: { week, season: this.props.season } })
                .then(res => {
                    this.setState({ userRoster: res.data.userRoster, groupPositions: res.data.groupPositions, positionMap: res.data.groupMap, positionArray: res.data.positionArray });
                    this.doneLoading();
                }).catch(err => {
                    console.log(`roster data error`, err); //TODO better error handling
                });
        };
    };

    tooManyPlayers = async (currentRoster, allowedMap, addedPlayer) => {
        const possibleDrops = [];
        for (let i = 0; i < allowedMap.length; i++) {
            if (allowedMap[i]) {
                possibleDrops.push(currentRoster[i]);
            };
        };
        possibleDrops.push(addedPlayer)
        const playersForSwal = {};

        for (const player of possibleDrops) {
            playersForSwal[player.M] = ``;
            playersForSwal[player.M] = player.N;
        };

        const { value: chosenPlayer } = await Alert.fire({
            title: `Too many players`,
            input: `select`,
            inputPlaceholder: `Which player do you want to drop?`,
            inputOptions: playersForSwal,
            showCancelButton: true,
        });
        let droppedPlayerIndex = 0;
        const droppedPlayer = currentRoster.find((player, i) => {
            if (+player.M === +chosenPlayer) {
                droppedPlayerIndex = i;
                return player;
            };
        });

        if (droppedPlayer) {
            let availDroppedPlayerIndex = -1;

            const availablePlayers = this.state.availablePlayers.slice(0);
            availablePlayers.find((player, i) => {
                if (+player.M === +addedPlayer.M) {
                    availDroppedPlayerIndex = i;
                };
            });
            if (availDroppedPlayerIndex >= 0) {
                availablePlayers.splice(availDroppedPlayerIndex, 1);
            };
            if (droppedPlayer.P === this.state.positionSelect) {
                availablePlayers.unshift(droppedPlayer);
            };
            currentRoster[droppedPlayerIndex] = { P: addedPlayer.P, M: addedPlayer.M, N: addedPlayer.N, T: addedPlayer.T };

            const usedPlayers = this.state.currentPositionUsedPlayers.filter(player => player.M !== droppedPlayer.M)
            usedPlayers.push(addedPlayer);

            this.saveRosterToDb(currentRoster, droppedPlayer.M, addedPlayer.M);
            this.setState({ availablePlayers, currentPositionUsedPlayers: usedPlayers })
        } else {
            //The user has selected the player who is not on their team            
            this.setState({ userRoster: currentRoster });
        };
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
                if (!usedPlayers[positionSelect]) {
                    this.getUsedPlayers();
                } else {
                    this.setState({ currentPositionUsedPlayers: usedPlayers[positionSelect] });
                };
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

    addPlayerToRoster = async (newRoster, addedPlayer, newAvailablePlayers) => {
        let sortedUpdatedRoster = newRoster.slice(0);
        const { positionMap } = this.state;
        const playerIndex = this.state.positionArray.indexOf(addedPlayer.P);
        const allowedMap = [];
        let added = false;
        for (let i = 0; i < positionMap.length; i++) {
            if (positionMap[i].includes(playerIndex)) {
                allowedMap[i] = true;
                if (!added) { //If they are not already added, add them. If they are ignore this
                    if (sortedUpdatedRoster[i] === 0) {
                        sortedUpdatedRoster[i] = addedPlayer;
                        added = true;
                    };
                };
            } else {
                allowedMap[i] = false;
            };
        };
        //Checks if we added a player without dropping one
        if (!added) {
            this.tooManyPlayers(sortedUpdatedRoster, allowedMap, addedPlayer);
        } else {
            this.saveRosterToDb(sortedUpdatedRoster, 0, addedPlayer.M);
            const newUsedPlayers = { ...this.state.usedPlayers };
            newUsedPlayers[addedPlayer.P].push(addedPlayer);
            this.setState({ availablePlayers: newAvailablePlayers, usedPlayers: newUsedPlayers });
        };
    };

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
            this.addPlayerToRoster(newRoster, addedPlayer, newAvailablePlayers);
        } else if (addOrDrop === `drop`) {
            let droppedPlayerIndex = 0;
            const droppedPlayer = newRoster.find((player, i) => {
                if (player.M === mySportsId) {
                    droppedPlayerIndex = i;
                    return player;
                };
            });

            newRoster[droppedPlayerIndex] = 0;
            newAvailablePlayers.unshift(droppedPlayer);

            this.setState({ availablePlayers: newAvailablePlayers });
            this.saveRosterToDb(newRoster, mySportsId, false);

        };
    };

    showMatchUps = async () => {
        const { weeklyMatchups } = this.state;
        let displayMatchups = `Home   -   Away<br />`;
        for (let i = 0; i < weeklyMatchups.length; i++) {
            displayMatchups += `<br/>${weeklyMatchups[i].H}  -  ${weeklyMatchups[i].A}`
            if (weeklyMatchups[i].W !== ``) {
                displayMatchups += `<br/>Weather: ${weeklyMatchups[i].W.charAt(0).toUpperCase() + weeklyMatchups[i].W.slice(1)}`
            };
            displayMatchups += `<br />`
        };
        await Alert.fire({
            title: `Week ${this.state.weekOnPage} Matchups`,
            html: displayMatchups,
        });
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
                            <br />
                            <button className='btn btn-primary' onClick={() => this.showMatchUps()}>Match Ups</button>
                            {/* Player Search
                            <PlayerSearch playerSearch={this.state.playerSearch} handleChange={this.handleChange} customPlayerSearch={this.customPlayerSearch} /> */}
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
                {props.player.S ?
                    <div className='scoreCol'>
                        {props.player.S}
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
                <Link to={`/usedPlayers/${props.GID}/${props.UID}`}>
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