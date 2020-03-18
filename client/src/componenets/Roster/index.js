import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Container, Button, Row, Col, Label } from 'reactstrap';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import './rosterStyle.css';
import './playerStyle.css';

import UsedPlayerButton from '../UsedPlayers/UsedPlayerButton';
import { WeekSearch, PositionSearch, TeamSearch } from './SearchDropdowns';

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
            teamSelect: `ARI`,
            weekSelect: 0,
            seasonSelect: 0,
            weekOnPage: 0, //The week and season are here when the player searches for their roster. This updates ONLY when the player actually refreshes their roster
            seasonOnPage: ``,
            currentUser: false,
            usernameOfPage: '',
            groupPositions: [],
            dbReadyRoster: { //We populate this when we go to sort the user's roster. This is the way it's saved into the database
                QB: 0,
                RB1: 0,
                RB2: 0,
                WR1: 0,
                WR2: 0,
                Flex: 0,
                TE: 0,
                K: 0
            }
        };
    };

    componentDidMount() {
        if (this.props.week !== 0 && this.props.season !== '') {
            this.setState({ weekSelect: this.props.week, seasonSelect: this.props.season });
            this.getRosterData(this.props.week, this.props.season);
            // this.checkCurrentUser();
            // this.getCurrentUsername();
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            this.setState({ weekSelect: this.props.week, seasonSelect: this.props.season });
            this.getRosterData(this.props.week, this.props.season);
            // this.checkCurrentUser();
            // this.getCurrentUsername();
        };
    };

    getCurrentUsername() {
        axios.get(`/api/getUserById/${this.props.match.params.userId}`)
            .then(res => {
                this.setState({ usernameOfPage: res.data.local.username })
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
        let { userRoster } = this.state;

        userRoster = [];

        this.setState({ userRoster });
    };

    getRosterData = (week, season) => {

        this.loading();
        this.setState({ weekOnPage: week, seasonOnPage: season })
        //We want to go and grab the roster no matter what
        //This is in case another user comes to the profile and wants to view their picks
        //We pass in a params along with the API call stating if this is the current user or not
        if (this.props.week !== 0 && this.props.season !== ``) {
            //Inside here after the current roster is hit, then go in and pull the other data
            //Make the pull available players easily hit from other places as well, since I want a dropdown that defaults to this week
            //But can be changed in case people want to update more than just this week at once.
            axios.get(`/api/userRoster/${this.props.match.params.groupId}/${this.props.match.params.userId}`,
                { params: { week, season } })
                .then(res => {
                    console.log(res.data)
                    this.setState({ userRoster: res.data.userRoster, groupPositions: res.data.groupPositions });
                    this.sortRoster(res.data);
                    this.doneLoading();
                }).catch(err => {
                    console.log(`roster data error`, err); //TODO better error handling
                });
        };
    };

    //This is to check if the player has too many of a certain position on their roster
    countRoster = (originalRoster, updatedRoster, originalAvailablePlayers, addedPlayer) => {
        let QBCount = 0;
        let RBCount = 0;
        let WRCount = 0;
        let TECount = 0;
        let KCount = 0;

        //We then go through the current user roster and populate it with data to sort it and get all the players
        for (let i = 0; i < updatedRoster.length; i++) {
            const position = updatedRoster[i].position;
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

        //Checks if any positions have too many on the roster then feed the data into the function to handle this
        //Probably a bettwe way to do this, but unsure of how.
        //Also need to feed in the originalRoster in case the player cancels out and we are to reload the original state
        if (QBCount > 1) {
            this.tooManyPlayers(originalRoster, updatedRoster, `QB`, originalAvailablePlayers, addedPlayer);
            return false; //Return false here because we are splitting and handling this with the tooManyPlayers and no longer need to save it in the onDragEnd
        } else if (WRCount > 3) {
            this.tooManyPlayers(originalRoster, updatedRoster, `WR`, originalAvailablePlayers, addedPlayer);
            return false;
        } else if (RBCount > 3) {
            this.tooManyPlayers(originalRoster, updatedRoster, `RB`, originalAvailablePlayers, addedPlayer);
            return false;
        } else if (RBCount + WRCount > 5) {
            //Here we want the WR or RB to be over three. If they already have 3 on their roster, it means that one is already in their flex
            //If they only have two then they can sub one of the other positions and put it in their flex
            this.tooManyPlayers(originalRoster, updatedRoster, `Flex`, originalAvailablePlayers, addedPlayer);
            return false;
        } else if (TECount > 1) {
            this.tooManyPlayers(originalRoster, updatedRoster, `TE`, originalAvailablePlayers, addedPlayer);
            return false;
        } else if (KCount > 1) {
            this.tooManyPlayers(originalRoster, updatedRoster, `K`, originalAvailablePlayers, addedPlayer);
            return false;
        };
        return true;
    };

    tooManyPlayers = async (originalRoster, roster, position, originalAvailablePlayers, addedPlayer) => {
        //Pull out all the players for the position that has too many in it right now
        let filteredRoster = [];
        if (position === `Flex`) {
            //If the position is flex, that means there are two of the current position and they can either swap it for RB or console.warn();
            filteredRoster = roster.filter(player => player.position === `RB` || player.position === `WR`);
        } else {
            filteredRoster = roster.filter(player => player.position === position);
        };

        //Iterate over the filtered array and get the full data for the players to give the user a choice
        //We need it in this format so swal will properly list the options
        const fullPlayers = {};

        for (let i = 0; i < filteredRoster.length; i++) {
            //First we have to initialize the object because of the bracket notation
            fullPlayers[filteredRoster[i].mySportsId] = {};
            //THen we populate the full name from the state to give the player the chance to pick between the one they just added and the player on their roster
            fullPlayers[filteredRoster[i].mySportsId] = filteredRoster[i].full_name;
        };

        //chosenPlayer === the player the user would like to be dropped
        const { value: chosenPlayer } = await Alert.fire({
            title: `Too many ${position}s`,
            input: `select`,
            inputPlaceholder: `Which player do you want to drop?`,
            inputOptions: fullPlayers,
            showCancelButton: true,
        });

        //If the player responded with the player they would like to drop then we will take them out of their current array and then set the new state
        if (chosenPlayer) {
            const intChosenPlayer = parseInt(chosenPlayer);
            const intAddedPlayer = parseInt(addedPlayer);

            const availablePlayers = originalAvailablePlayers.slice(0);
            let droppedPlayerIndex = 0;
            let availDroppedPlayerIndex = -1;

            const droppedPlayer = roster.find((player, i) => {
                if (player.mySportsId === intChosenPlayer) {
                    droppedPlayerIndex = i;
                    return player;
                };
            });
            availablePlayers.find((player, i) => {
                if (player.mySportsId === intAddedPlayer) {
                    availDroppedPlayerIndex = i;
                };
            });

            //Remove the player they chose from the array and then save it down into state
            if (availDroppedPlayerIndex >= 0) {
                availablePlayers.splice(availDroppedPlayerIndex, 1);
            };

            roster.splice(droppedPlayerIndex, 1);

            //Add the player they dropped back to the available list of players
            if (droppedPlayer.position === this.state.positionSelect) {
                availablePlayers.unshift(droppedPlayer);
            };

            //Now we make one final check before moving things along. If everything is done right above this should be simple.
            const checkRoster = this.checkRoster(roster);

            //If the check failed, then we will have an issue and are going to revert the state back to the previous point
            if (checkRoster) {
                //We take the array of player IDs that are on the user roster and sort them
                //SortRoster also saves down dbReadyRoster so we should be good to save it below
                this.sortRoster(roster);

                //Here we feed the new sorted array along with the player to be deleted from the old array. The state is updated in the sortRoster function
                //We need to new array to get the new player added and the old player so we can pull them out of the usedPlayersArray in the DB
                this.saveRosterToDb(this.state.dbReadyRoster, chosenPlayer, false);

                this.setState({ availablePlayers: availablePlayers });
            } else {
                Alert.fire({
                    type: 'warning',
                    title: 'Roster Save Error!',
                    text: 'Something went wrong with saving your roster! Please refresh and try again',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Take me back'
                });
                this.setState({ userRoster: originalRoster });
            };
        } else if (chosenPlayer === undefined) {
            //This is if the player has chosen to cancel out of the box above. We reload the old state to remove the player they just added
            this.setState({ userRoster: originalRoster, availablePlayers: originalAvailablePlayers });
        } else {
            //This is if the player doesn't select one of the players and just presses accept
            await Alert.fire(`You must pick one or cancel`)
            this.tooManyPlayers(originalRoster, roster, position, originalAvailablePlayers);
        };
    };

    checkRoster = (roster) => {
        //This is a true false check to verify the roster data before saving it to the database
        let response = true;
        let QBCount = 0;
        let RBCount = 0;
        let WRCount = 0;
        let TECount = 0;
        let KCount = 0;

        //We then go through the current user roster and populate it with data to sort it and get all the players
        for (let i = 0; i < roster.length; i++) {
            const position = roster[i].position;
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

        //This checks if the player has too many of any one position or if their overall roster is over 8
        if (QBCount > 1 || RBCount > 3 || WRCount > 3 || (RBCount + WRCount) > 5 || TECount > 1 || KCount > 1 || roster.length > 8) {
            response = false;
        };

        return response;
    };

    sortRoster = (roster) => {
        //While we are sorting the roster we are also getting the object ready to be stored in the database
        //This sortRoster will be run before we ever go to save anything into the DB so it should populate the state correctly when we go to put it in
        const dbReadyRoster = {}; //It's saved as an object in the database

        //Here we iterate through the roster of the player and put them into an object for the order we want
        for (const player of roster) {
            const position = player.position;
            //If the position is QB, TE, or K then we can just put them directly in
            if (position === `QB`) {
                dbReadyRoster.QB = player;
                //If it's RB or WR then we need to assign it manually to the 1, 2 and flex spots
                //First we need to check the RB/WR 1 & 2 spots then assign it into the flex spot
            } else if (position === `RB`) {
                if (!dbReadyRoster.RB1) {
                    dbReadyRoster.RB1 = player;
                } else if (!dbReadyRoster.RB2) {
                    dbReadyRoster.RB2 = player;
                } else if (!dbReadyRoster.Flex) {
                    dbReadyRoster.Flex = player;
                }
            } else if (position === `WR`) {
                if (!dbReadyRoster.WR1) {
                    dbReadyRoster.WR1 = player;
                } else if (!dbReadyRoster.WR2) {
                    dbReadyRoster.WR2 = player;
                } else if (!dbReadyRoster.Flex) {
                    dbReadyRoster.Flex = player;
                };
            } else if (position === `TE`) {
                dbReadyRoster.TE = player;
            } else if (position === `K`) {
                dbReadyRoster.K = player;
            };
        };

        this.setState({ dbReadyRoster, userRoster: roster });

        return;
    };

    saveRosterToDb = async (dbReadyRoster, droppedPlayer, saveWithNoDrop) => {
        //This will not always have a chosenPlayer because if the user is reorganizing the players currently on their roster it will not have a player to be dropped
        //The saveWithNoDrop var is if the user has a blank week roster, it ensures we save it to the usedPlayerArray because we will be feeding droppedPlayer of 0
        axios.put(`/api/updateUserRoster`,
            { userId: this.props.userId, dbReadyRoster, droppedPlayer, week: this.state.weekSelect, season: this.state.seasonSelect, saveWithNoDrop })
            .then(res => {
                return
            }).catch(err => {
                console.log(err)//TODO Better error handling
            });
    };

    checkLockPeriod = async () => {
        return true;
        const response = await axios.get(`/api/checkLockPeriod`);
        //If this week is already passed the lock date then return bad request
        if (this.state.weekOnPage <= response.data.lockWeek) {
            return false;
        };

        //TODO Maybe make this a loop to iterate over many years or back out last year
        if (this.state.seasonOnPage === response.data.lockYear) {
            return false;
        };

        //If the week and the season are not locked then we can return true, that the week they are trying to edit is not locked
        return true;
    };

    //This triggers off the Form on the roster below that allows the user to search for the position they would like to add to their roster
    positionSearch = (e) => {
        e.preventDefault();

        this.loading();
        const userId = this.props.userId;
        axios.get(`/api/availablePlayers`,
            { params: { userId, searchedPosition: this.state.positionSelect, season: this.state.seasonSelect } })
            .then(res => {
                this.setState({ availablePlayers: res.data });
                this.doneLoading();
            });
    };

    customSeasonWeekSearch = (e) => {
        e.preventDefault();

        //Need to clear the playerIds when switching weeks. If not the program makes the array an array of undefined
        const userRoster = [];

        this.setState({ userRoster })

        this.getRosterData(this.state.weekSelect, this.state.seasonSelect);
    };

    searchByTeam = (e) => {
        e.preventDefault();

        this.loading();

        axios.get(`/api/getPlayersByTeam/${this.props.match.params.groupId}/${this.props.userId}/${this.state.teamSelect}/${this.props.season}`)
            .then(res => {
                this.setState({ availablePlayers: res.data });
                this.doneLoading();
            });
    }

    //This is to handle the change for the Input Type in the position search below
    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    addDropPlayer = async (mySportsId, addOrDrop) => {
        //First check if the user is on a differnent page and if the peroid is locked
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
        const newRoster = this.state.userRoster.slice(0);

        //First I need to copy the state as is
        //Then find the player the user wants to add or drop
        //Then if they are dropping just add the player to the available player list
        if (addOrDrop === `add`) {
            let addedPlayerIndex = 0;

            const addedPlayer = newAvailablePlayers.find((player, i) => {
                if (player.mySportsId === mySportsId) {
                    addedPlayerIndex = i;
                    return player;
                };
            });

            newAvailablePlayers.splice(addedPlayerIndex, 1);
            newRoster.push(addedPlayer);

            //The line above is the one that is causing issues. It can handle one add / drop but not any more
            const needToSave = this.countRoster(this.state.userRoster, newRoster, this.state.availablePlayers, addedPlayer.mySportsId);
            const correctRoster = this.checkRoster(newRoster);

            //We use this is the player has less than a complete roster
            if (correctRoster && needToSave) {
                this.sortRoster(newRoster);
                this.setState({ availablePlayers: newAvailablePlayers });
                //Is a 0 here because if they added a player earlier to the DB that would have already been picked up by countRoster
                //The true is to indicate we need to save a player down without dropping one in the usedPlayer array in the DB
                this.saveRosterToDb(this.state.dbReadyRoster, 0, true);
            };
        } else if (addOrDrop === `drop`) {
            let droppedPlayerIndex = 0;
            const droppedPlayer = newRoster.find((player, i) => {
                if (player.mySportsId === mySportsId) {
                    droppedPlayerIndex = i;
                    return player;
                };
            });

            newRoster.splice(droppedPlayerIndex, 1);
            newAvailablePlayers.unshift(droppedPlayer);

            const needToSave = this.countRoster(this.state.userRoster, newRoster, this.state.availablePlayers);
            const correctRoster = this.checkRoster(newRoster);

            //We use this is the player has less than a complete roster
            if (correctRoster && needToSave) {
                this.sortRoster(newRoster);
                this.setState({ availablePlayers: newAvailablePlayers });
                //Is a 0 here because if they added a player earlier to the DB that would have already been picked up by countRoster
                //The true is to indicate we need to save a player down without dropping one in the usedPlayer array in the DB
                this.saveRosterToDb(this.state.dbReadyRoster, mySportsId, false);
            };
        };
    };

    render() {
        const currentRoster = this.state.dbReadyRoster;
        const rosterPlayers = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'Flex', 'TE', 'K'];
        return (
            <Container fluid={true} className='lineHeight'>
                <Row>

                    <Col md='3' className='noMargin'>
                        <Label for='weekSelect'>Select Week</Label>
                        <WeekSearch weekSelect={this.state.weekSelect} handleChange={this.handleChange} customSeasonWeekSearch={this.customSeasonWeekSearch} />

                        <PositionSearch positionSelect={this.state.positionSelect} handleChange={this.handleChange} positionSearch={this.positionSearch} />

                        <TeamSearch handleChange={this.handleChange} searchByTeam={this.searchByTeam} teamSelect={this.state.teamSelect} />

                        <UsedPlayerButton userId={this.props.match.params.userId} username={this.state.usernameOfPage} />

                    </Col>

                    <Col md='9'>
                        <Row className='topRow'>
                            <Col xs='12'>
                                <div className='centerText headerFont'>
                                    {this.state.usernameOfPage}'s Roster
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md='1' />
                            <Col md='5'>
                                <RosterDisplay rosterPlayers={rosterPlayers} addDropPlayer={this.addDropPlayer} currentRoster={currentRoster} nameCol={'9'} scoreCol={'0'} />
                            </Col>
                            <Col md='5'>
                                <Row>
                                    <Col xs='12'>
                                        <div className='colHeader'>
                                            Available Players
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col xs='12'>
                                        {this.state.availablePlayers.map((player, i) => (
                                            <AvailablePlayerRow player={player} key={i} addDropPlayer={this.addDropPlayer} />
                                        ))
                                        }
                                    </Col>
                                </Row>
                            </Col>
                            <Col md='1' />
                        </Row>
                    </Col>
                </Row>
            </Container >
        );
    };
};

const CurrentRosterRow = (props) => (
    <Row className='playerRow'>
        <Col xs='2'>
            <div className='positionBox'>
                {props.position}
            </div>
        </Col>
        <Col xs='9'>
            {props.player ?
                <Row>
                    <Col xs={props.nameCol}>
                        <div className='player'>
                            {props.player.full_name + `, ` + props.player.team}
                        </div>
                    </Col>
                    <Col xs={props.scoreCol}>
                        {props.player.score &&
                            props.player.score
                        }
                    </Col>
                    {props.addDropPlayer &&
                        <Col xs='3'>
                            <Button className='addDropButton' color='outline-success' size='sm' onClick={() => props.addDropPlayer(props.player.mySportsId, 'drop')}>
                                Drop
                            </Button>
                        </Col>
                    }
                </Row>
                : ``
            }
        </Col>
    </Row>
);

const AvailablePlayerRow = (props) => (
    <Row className='playerRow'>
        <Col xs='8'>
            <div className='player'>

                {props.player.full_name + `, ` + props.player.team + `, ` + props.player.position}
            </div>
        </Col>
        <Col xs='3'>
            <Button className='addDropButton' color='outline-success' size='sm' onClick={() => props.addDropPlayer(props.player.mySportsId, 'add')}>
                Add
            </Button>
        </Col>
    </Row>
);

const RosterDisplay = (props) => (
    <Fragment>
        {props.rosterPlayers.map(position => (
            <CurrentRosterRow key={position} position={position} player={props.currentRoster[position]} addDropPlayer={props.addDropPlayer} nameCol={props.nameCol} scoreCol={props.scoreCol} />
        ))}
    </Fragment>
);


const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);
export { RosterDisplay };