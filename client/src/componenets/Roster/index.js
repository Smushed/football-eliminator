import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Label, Input, Container, Button, Row, Col } from 'reactstrap';

import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import './rosterStyle.css';

import UsedPlayerButton from '../UsedPlayers/UsedPlayerButton';
import AutoComplete from '../AutoComplete';

const Alert = withReactContent(Swal);

class Roster extends Component {
    constructor(props) {
        super(props);
        //Must set state hard here to ensure that it is loaded properly when the component unmounts and remounts±
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            userRoster: {
            },
            columns: {
                'userRoster': {
                    id: 'userRoster',
                    title: 'On Roster',
                    playerIds: [] //These have the be the same as the keys above & the same as the mySportsId
                },
                'available': {
                    id: 'available',
                    title: 'Available',
                    playerIds: []
                },
            },
            //Able to order the columns
            columnOrder: ['userRoster', 'available'],
            positionSelect: `QB`, //This is the default value for the position search
            teamSearch: ``,
            teamArray: [],
            weekSelect: 0,
            seasonSelect: 0,
            weekOnPage: 0, //The week and season are here when the player searches for their roster. This updates ONLY when the player actually refreshes their roster
            seasonOnPage: ``,
            currentUser: false,
            usernameOfPage: '',
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
            this.checkCurrentUser();
            this.getCurrentUsername();
            this.getTeams();
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            this.setState({ weekSelect: this.props.week, seasonSelect: this.props.season });
            this.getRosterData(this.props.week, this.props.season);
            this.checkCurrentUser();
            this.getCurrentUsername();
            this.getTeams();
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

    getTeams() {
        axios.get(`/api/getTeams`)
            .then(res => {
                this.setState({ teamArray: res.data });
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
        let { userRoster, columns } = this.state;

        columns.userRoster.playerIds = [];
        columns.available.playerIds = [];
        userRoster = {};

        this.setState({ userRoster, columns });
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
            axios.get(`/api/userRoster/${this.props.match.params.userId}`,
                { params: { week, season } })
                .then(res => {
                    let columns = { ...this.state.columns };
                    //We need to make a copy of the columns object and update it
                    //React doesn't like us updating nested state otherwise
                    columns.userRoster.playerIds = res.data.playerArray;
                    delete res.data.playerArray;

                    //Save what we got from the database into state
                    this.setState({ userRoster: res.data, columns });
                    this.doneLoading();

                }).catch(err => {
                    console.log(`roster data error`, err.response.data); //TODO better error handling
                });
        };
    };

    //This is to check if the player has too many of a certain position on their roster
    countRoster = (originalRoster) => {
        const userRoster = this.state.columns.userRoster.playerIds;
        let QBCount = 0;
        let RBCount = 0;
        let WRCount = 0;
        let TECount = 0;
        let KCount = 0;

        //We then go through the current user roster and populate it with data to sort it and get all the players
        for (let i = 0; i < userRoster.length; i++) {
            const position = this.state.userRoster[userRoster[i]].position;
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
            this.tooManyPlayers(originalRoster, userRoster, `QB`, QBCount);
            return false; //Return false here because we are splitting and handling this with the tooManyPlayers and no longer need to save it in the onDragEnd
        } else if (WRCount > 3) {
            this.tooManyPlayers(originalRoster, userRoster, `WR`, WRCount);
            return false;
        } else if (RBCount > 3) {
            this.tooManyPlayers(originalRoster, userRoster, `RB`, RBCount);
            return false;
        } else if (RBCount + WRCount > 5) {
            //Here we want the WR or RB to be over three. If they already have 3 on their roster, it means that one is already in their flex
            //If they only have two then they can sub one of the other positions and put it in their flex
            this.tooManyPlayers(originalRoster, userRoster, `Flex`);
            return false;
        } else if (TECount > 1) {
            this.tooManyPlayers(originalRoster, userRoster, `TE`, TECount);
            return false;
        } else if (KCount > 1) {
            this.tooManyPlayers(originalRoster, userRoster, `K`, KCount);
            return false;
        };
        return true;
    };

    tooManyPlayers = async (originalRoster, roster, position, count) => {
        //Pull out all the players for the position that has too many in it right now
        let filteredRoster = [];
        if (position === `Flex`) {
            //If the position is flex, that means there are two of the current position and they can either swap it for RB or console.warn();
            filteredRoster = roster.filter(player => this.state.userRoster[player].position === `RB` || this.state.userRoster[player].position === `WR`);
        } else {
            filteredRoster = roster.filter(player => this.state.userRoster[player].position === position);
        };

        //Iterate over the filtered array and get the full data for the players to give the user a choice
        //We need it in this format so swal will properly list the options
        const fullPlayers = {};

        for (let i = 0; i < filteredRoster.length; i++) {
            //First we have to initialize the object because of the bracket notation
            fullPlayers[filteredRoster[i]] = {};
            //THen we populate the full name from the state to give the player the chance to pick between the one they just added and the player on their roster
            fullPlayers[filteredRoster[i]] = this.state.userRoster[filteredRoster[i]].full_name;
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

            //We need to make a copy of the columns object and update it
            //React doesn't like us updating nested state otherwise
            const columns = this.state.columns;
            //Remove the player they chose from the array and then save it down into state
            const playerIndex = columns.userRoster.playerIds.indexOf(parseInt(chosenPlayer));
            columns.userRoster.playerIds.splice(playerIndex, 1);
            //Add the player they dropped back to the available list of players
            if (this.state.userRoster[chosenPlayer].position === this.state.positionSelect) {
                columns.available.playerIds.unshift(chosenPlayer);
            };

            //Now we make one final check before moving things along. If everything is done right above this should be simple.
            const checkRoster = await this.checkRoster(columns.userRoster.playerIds);

            //If the check failed, then we will have an issue and are going to revert the state back to the previous point
            if (checkRoster) {
                //We take the array of player IDs that are on the user roster and sort them
                columns.userRoster.playerIds = await this.sortRoster(columns.userRoster.playerIds);

                //Here we feed the new sorted array along with the player to be deleted from the old array. The state is updated in the sortRoster function
                //We need to new array to get the new player added and the old player so we can pull them out of the usedPlayersArray in the DB
                this.saveRosterToDb(this.state.dbReadyRoster, chosenPlayer, false);

                this.setState({ columns });
            } else {
                Alert.fire({
                    type: 'warning',
                    title: 'Roster Save Error!',
                    text: 'Something went wrong with saving your roster! Please refresh and try again',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Take me back'
                });
                this.setState({ columns: originalRoster });
            };
        } else if (chosenPlayer === undefined) {
            //This is if the player has chosen to cancel out of the box above. We reload the old state to remove the player they just added
            this.setState({ columns: originalRoster });
        } else {
            //This is if the player doesn't select one of the players and just presses accept
            await Alert.fire(`You must pick one or cancel`)
            this.tooManyPlayers(originalRoster, roster, position, count);
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
            const position = this.state.userRoster[roster[i]].position;
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
        //We want to organize the roster here to be as follows: QB, RB1, RB2, WR1, WR2, Flex, TE, K
        //Takes the array of players and iterates over them, creating a new sorted array
        const sortedRoster = [0, 0, 0, 0, 0, 0, 0, 0];

        //While we are sorting the roster we are also getting the object ready to be stored in the database
        //This sortRoster will be run before we ever go to save anything into the DB so it should populate the state correctly when we go to put it in
        const dbReadyRoster = {}; //It's saved as an object in the database

        //Here we iterate through the roster of the player and put them into an object for the order we want
        for (const player of roster) {
            const position = this.state.userRoster[player].position
            //If the position is QB, TE, or K then we can just put them directly in
            if (position === `QB`) {
                sortedRoster[0] = player;
                dbReadyRoster.QB = player;
                //If it's RB or WR then we need to assign it manually to the 1, 2 and flex spots
                //First we need to check the RB/WR 1 & 2 spots then assign it into the flex spot
            } else if (position === `RB`) {
                if (sortedRoster[1] === 0) {
                    sortedRoster[1] = player;
                    dbReadyRoster.RB1 = player;
                } else if (sortedRoster[2] === 0) {
                    sortedRoster[2] = player;
                    dbReadyRoster.RB2 = player;
                } else if (sortedRoster[5] === 0) {
                    sortedRoster[5] = player;
                    dbReadyRoster.Flex = player;
                }
            } else if (position === `WR`) {
                if (sortedRoster[3] === 0) {
                    sortedRoster[3] = player;
                    dbReadyRoster.WR1 = player;
                } else if (sortedRoster[4] === 0) {
                    sortedRoster[4] = player;
                    dbReadyRoster.WR2 = player;
                } else if (sortedRoster[5] === 0) {
                    sortedRoster[5] = player;
                    dbReadyRoster.Flex = player;
                };
            } else if (position === `TE`) {
                sortedRoster[6] = player;
                dbReadyRoster.TE = player;
            } else if (position === `K`) {
                sortedRoster[7] = player;
                dbReadyRoster.K = player;
            };
        };

        const sortedNoDummyData = sortedRoster.filter(id => id !== 0);

        this.setState({ dbReadyRoster });

        //Until testing is complete, just send back the same roster
        return sortedNoDummyData;
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

    onDragEnd = async result => {
        const { destination, source, draggableId } = result;
        //If the drag was cancelled then back out of this
        if (!destination) {
            return;
        };

        //If the destination of the drag was the same as the start then back out of onDragEnd
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        };

        //Check if the peroid the user is trying to change is locked
        const isLocked = await this.checkLockPeriod();
        if (!isLocked) {
            Alert.fire({
                title: `Peroid is locked!`,
                type: `warning`,
                text: `Week ${this.state.weekOnPage} is locked. Please search a different week`,
            });
            return;
        }

        if (!this.state.currentUser) {
            Alert.fire({
                title: `Not your roster!`,
                type: `warning`,
            });
            return;
        }

        //Get the column out of the state so we don't mutate the state
        //Must be the start and finish since there is a chance that we are moving between two columns
        //Start and finish is where the drag started and where it finishes
        const start = this.state.columns[source.droppableId];
        const finish = this.state.columns[destination.droppableId];

        // If we are not changing columns, only reordering within the columns then we can reorganize the list in the order the user wants
        if (start === finish) {

            //Make an array with the same contents as the old array
            let newPlayerIds = Array.from(start.playerIds);
            //Now move the player ID from its old index to its new index
            newPlayerIds.splice(source.index, 1);
            //Start at the destination index, remove nothing and insert the draggableId in that spot
            newPlayerIds.splice(destination.index, 0, draggableId);

            if (source.droppableId === `userRoster`) { //Really you can use either source or destination here
                //If user is changing their roster, sort it to make sure it stays in the order we want it in (QB, RB, WR, Flex, TE, K)
                newPlayerIds = await this.sortRoster(newPlayerIds);
                await this.saveRosterToDb(this.state.dbReadyRoster, 0, false);
            };

            //Create a new column which has the same properites as the old column but with the newPlayerIds array
            const newColumn = {
                ...start,
                playerIds: newPlayerIds
            };

            //Now put this into a new picture of the state
            //Using spread to keep the references and updating the parts we want to change
            const newState = {
                ...this.state,
                columns: {
                    ...this.state.columns,
                    //Now insert the new column
                    [newColumn.id]: newColumn
                },
            };

            //Now push the changes to the state
            this.setState(newState);

            return;
        };

        // Moving from one column to another
        const startNewPlayerIds = Array.from(start.playerIds);
        //Remove the dragged player Id from this array
        startNewPlayerIds.splice(source.index, 1);
        //Create a new start column that contains the new properties as the old column but with the new start player Ids array
        const newStart = {
            ...start,
            playerIds: startNewPlayerIds
        };

        //Creating a new array for the dropped column that contains the same Ids as the finished player array
        const finishPlayerIds = Array.from(finish.playerIds);
        //Splice in the dropped player into the array
        finishPlayerIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finish,
            playerIds: finishPlayerIds
        };

        const newState = {
            ...this.state,
            columns: {
                //Update the columns in the state object
                ...this.state.columns,
                //Specifically only overwrite the start and finish column.
                //If there are more than two on the screen we only want to overwrite what has been dragged and dropped
                [newStart.id]: newStart,
                [newFinish.id]: newFinish
            }
        };

        //Saving a copy of the old state to revert it if the player wants to disregard the player they just added
        const originalRoster = this.state.columns;

        //We first wait until the state has been pushed to ensure we are capturing the players the user wants to add.
        this.setState(newState);

        //Then we check if the added player can fit in the roster and if we need to drop a current player
        //Pass through the original roster if the player decides they want to cancel out
        const needToSave = this.countRoster(originalRoster);

        const correctRoster = this.checkRoster(this.state.columns.userRoster.playerIds);

        //If the roster is correct, and we need to save it down because it won't be saved through the countRoster (ie less than 8 players) then we push it through
        if (correctRoster && needToSave) {
            const sortedRoster = this.sortRoster(this.state.columns.userRoster.playerIds);

            //Save the new sorted roster down to the state to ensure it's sorted
            const columns = this.state.columns;
            columns.userRoster.playerIds = sortedRoster;
            this.setState({ columns });

            //Checks if we are moving a player from the On Roster Column to the Available column
            if (destination.droppableId === `available`) {
                //TODO WHERE DOES THIS TRY AND SAVE
                this.saveRosterToDb(this.state.dbReadyRoster, draggableId, false);
            } else {
                //Is a 0 here because if they added a player earlier to the DB that would have already been picked up by countRoster
                //The true is to indicate we need to save a player down without dropping one in the usedPlayer array in the DB
                this.saveRosterToDb(this.state.dbReadyRoster, 0, true);
            }
        };
    };

    //This triggers off the Form on the roster below that allows the user to search for the position they would like to add to their roster
    positionSearch = (e) => {
        e.preventDefault();

        this.loading();
        const userId = this.props.userId;
        axios.get(`/api/availablePlayers`,
            { params: { userId, searchedPosition: this.state.positionSelect, season: this.state.seasonSelect } })
            .then(res => {
                //What comes back is an array of objects for all the available players
                //We need to first change the array of objects into just an array to put into the playerIds state
                let columns = { ...this.state.columns };

                columns.available.playerIds = res.data.idArray;
                delete res.data.idArray;

                const currentRoster = { ...this.state.userRoster, ...res.data }

                this.setState({ userRoster: currentRoster, columns: columns });
                this.doneLoading();
            });
    };

    customSeasonWeekSearch = (e) => {
        e.preventDefault();

        //Need to clear the playerIds when switching weeks. If not the program makes the array an array of undefined
        const columns = this.state.columns;
        columns.userRoster.playerIds = [];
        columns.available.playerIds = [];
        this.setState({ columns })

        this.getRosterData(this.state.weekSelect, this.state.seasonSelect);
    };

    searchByTeam = (e) => {
        e.preventDefault();

        console.log(this.state.teamSearch);
    }

    //This is to handle the change for the Input Type in the position search below
    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        return (
            <Container fluid={true} className='lineHeight'>
                <Row className='topRow'>
                    <Col xs='12'>
                        <div className='centerText headerFont'>
                            {this.state.usernameOfPage}'s Roster
                            <UsedPlayerButton
                                userId={this.props.match.params.userId}
                                username={this.state.usernameOfPage} />
                        </div>
                    </Col>
                </Row>

                <Row className='searchRow'>
                    <Col xs='6'>
                        <div className='inputContainer centerText selectWeekMargin'>
                            <Label for='weekSelect'>Select Week</Label>
                            <Input value={this.state.weekSelect} type='select' name='weekSelect' id='weekSelect' className='searchDropdown' onChange={this.handleChange}>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8</option>
                                <option>9</option>
                                <option>10</option>
                                <option>11</option>
                                <option>12</option>
                                <option>13</option>
                                <option>14</option>
                                <option>15</option>
                                <option>16</option>
                                <option>17</option>
                            </Input>
                        </div>
                        <Button color='primary' onClick={this.customSeasonWeekSearch} className='submitButton'>
                            Search
                                </Button>

                    </Col>
                    <Col xs='6'>
                        <Row>
                            <Col xs='6'>
                                <div className='selectContainer'>
                                    <Label for='positionSelect'>Search Available Players By Position</Label>
                                    <div className='secondRowInput'>
                                        <Input type='select' name='positionSelect' id='positionSelect' className='searchDropdown' onChange={this.handleChange}>
                                            <option>QB</option>
                                            <option>RB</option>
                                            <option>WR</option>
                                            <option>TE</option>
                                            <option>K</option>
                                        </Input>
                                    </div>
                                    <Button color='primary' onClick={this.positionSearch} className='submitButton'>
                                        Search
                                </Button>
                                </div>
                            </Col>

                            <Col xs='6'>
                                <div className='selectContainer'>
                                    <Label for='teamOrPlayerSelect'>
                                        Search For Players By Team
                                    </Label>
                                    <div className='centerText'>
                                        <div className='inputContainer secondRowInput'>
                                            <AutoComplete suggestions={this.state.teamArray} />
                                        </div>
                                        <Button color="secondary" onClick={this.searchByTeam} className='submitButton'>
                                            Submit
                                </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <DragDropContext
                        // These are callbacks for updating the drag when someone picks something up or drops it
                        // Others are onDragStart and onDragUpdate. They can be used when people pick up the draggable or if they move it around
                        onDragEnd={this.onDragEnd}
                    >
                        {/* Iterate through all the columns to then display as many columns as needed */}
                        {this.state.columnOrder.map((columnId) => {
                            const column = this.state.columns[columnId];
                            //Iterate through all the players in the array of the column and then create an array of them all to show in a column
                            const roster = column.playerIds.map(playerId => this.state.userRoster[playerId]);
                            return (
                                // this only has to be xs of 6 because there will only ever be two columns
                                <Col xs='6' key={columnId}>
                                    <Column key={column.id} column={column} roster={roster} className='playerColumn' />
                                </Col>
                            );
                        })}
                    </DragDropContext>
                </Row>
            </Container>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);