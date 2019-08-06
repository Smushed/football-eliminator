import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';
import styled from 'styled-components';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

//Using Swal to display messages when add book button is hit
const Alert = withReactContent(Swal);

const Container = styled.div`
    display: flex;
`;

class Roster extends Component {
    constructor(props) {
        super(props);
        //Must set state hard here to ensure that it is loaded properly when the component unmounts and remounts±
        this.state = {
            userRoster: {
                1: { full_name: 'Loading', mySportsId: 1, position: 'QB', team: 'NE' },
            },
            columns: {
                'userRoster': {
                    id: 'userRoster',
                    title: 'On Roster',
                    playerIds: [1] //These have the be the same as the keys above & the same as the mySportsId
                },
                'available': {
                    id: 'available',
                    title: 'Avaliable',
                    playerIds: []
                },
            },
            //Able to order the columns
            columnOrder: ['userRoster', 'available'],
        }
    };

    componentDidMount() {
        const userIdFromURL = this.props.match.params.userId;
        if (typeof userIdFromURL !== 'undefined' && typeof this.props.userId !== 'undefined') {
            this.getRosterData(userIdFromURL);
        }
    };

    componentDidUpdate(prevProps) {
        if (this.props.userId !== prevProps.userId) {
            const userIdFromURL = this.props.match.params.userId;
            this.getRosterData(userIdFromURL);
        }
    };

    getAvailablePlayers = usedPlayers => {

        axios.get(`/api/availableplayers`,
            { params: usedPlayers })
            .then(res => {
                //What comes back is an array of objects for all the available players
                //We need to first change the array of objects into just an array to put into the playerIds state
                let columns = { ...this.state.columns };

                columns.available.playerIds = res.data.idArray;
                delete res.data.idArray;

                const currentRoster = { ...this.state.userRoster, ...res.data }

                this.setState({ userRoster: currentRoster, columns: columns });
            })
    };

    getRosterData = userIdFromURL => {
        //We want to go and grab the roster no matter what
        //This is in case another user comes to the profile and wants to view their picks
        //We pass in a params along with the API call stating if this is the current user or not
        if (userIdFromURL === this.props.userId) {
            //Inside here after the current roster is hit, then go in and pull the other data
            //Make the pull avaliable players easily hit from other places as well, since I want a dropdown that defaults to this week
            //But can be changed in case people want to update more than just this week at once.
            axios.get(`/api/userroster/${this.props.userId}`)
                .then(res => {
                    let columns = { ...this.state.columns };
                    //We need to make a copy of the columns object and update it
                    //React doesn't like us updating nested state otherwise
                    columns.userRoster.playerIds = res.data.playerArray;
                    delete res.data.playerArray;

                    //Save what we got from the database into state
                    this.setState({ userRoster: res.data, columns });

                    this.getAvailablePlayers(columns.userRoster.playerIds);

                }).catch(err => {
                    console.log(`roster data error`, err.response.data); //TODO better error handling
                });
        } else {
            //TODO update the styling on this page to then center the Roster as they are looking at another player
            //Maybe redirect these people to another page? Where they are instead viewing a snapshot of players they've used as well as current roster
            axios.get(`/api/userroster/${this.props.userId}`,
                { params: { currentUser: false } })
                .then(res => {
                    console.log(res);
                }).catch(err => {
                    console.log(err.response.data); //TODO Make this more robust
                });
        };
    };

    sortUserRoster = (originalRoster) => {
        //First we sort the roster to verify that the player has the correct amount of players on their roster
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
            this.tooManyPlayers(originalRoster, userRoster, `QB`, QBCount)
        } else if (RBCount + WRCount > 5) {
            if (WRCount > 3) {
                this.tooManyPlayers(originalRoster, userRoster, `WR`, WRCount);
            } else if (RBCount > 3) {
                this.tooManyPlayers(originalRoster, userRoster, `RB`, RBCount);
            } else {
                this.tooManyPlayers(originalRoster, userRoster, `Flex`)
            };
        } else if (TECount > 1) {
            this.tooManyPlayers(originalRoster, userRoster, `TE`, TECount);
        } else if (KCount > 1) {
            this.tooManyPlayers(originalRoster, userRoster, `K`, KCount);
        };
    };

    tooManyPlayers = async (originalRoster, roster, position, count) => {
        //Pull out all the players for the position that has too many in it right now
        const filteredRoster = roster.filter(player => this.state.userRoster[player].position === position);
        //Iterate over the filtered array and get the full data for the players to give the user a choice
        const fullPlayers = {}

        for (let i = 0; i < filteredRoster.length; i++) {
            //First we have to initialize the object because of the bracket notation
            fullPlayers[filteredRoster[i]] = {};
            //THen we populate the full name from the state to give the player the chance to pick between the one they just added and the player on their roster
            fullPlayers[filteredRoster[i]] = this.state.userRoster[filteredRoster[i]].full_name;
        };

        const { value: chosenPlayer } = await Alert.fire({
            title: `Too many ${position}s`,
            input: `select`,
            inputPlaceholder: `Which Player?`,
            inputOptions: fullPlayers,
            showCancelButton: true,
        });

        console.log(chosenPlayer)

        if (chosenPlayer) {
            await Alert.fire(`You picked: ` + chosenPlayer);
        } else if (chosenPlayer === undefined) {
            //This is if the player has chosen to cancel out of the box above. We reload the old state to remove the player they just added
            this.setState({ columns: originalRoster });
        } else {
            //This is if the player doesn't select one of the players and just presses accept
            await Alert.fire(`You must pick one or cancel`)
            this.tooManyPlayers(originalRoster, roster, position, count);
        }

        console.log(fullPlayers)
    }

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
        //This is how to re order the array after a drag ends

        //Get the column out of the state so we don't mutate the state
        //Must be the start and finish since there is a chance that we are moving between two columns
        //Start and finish is where the drag started and where it finishes
        const start = this.state.columns[source.droppableId];
        const finish = this.state.columns[destination.droppableId];

        if (start === finish) {
            //TODO Figure out how to reorganize the players in the roster while still holding the order
            //TODO IE Allow players to change between RB 1 & 2 and swap a flex with someone in the true positions            
            // If we are not changing columns, only reordering within the columns then we can reorganize the list in the order the user wants

            //Make an array with the same contents as the old array
            const newPlayerIds = Array.from(start.playerIds);
            //Now move the player ID from its old index to its new index
            newPlayerIds.splice(source.index, 1);
            //Start at the destination index, remove nothing and insert the draggableId in that spot
            newPlayerIds.splice(destination.index, 0, draggableId);

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
        await this.setState(newState);

        //Then we check if the added player can fit in the roster and if we need to drop a current player
        //Pass through the original roster if the player decides they want to cancel out
        this.sortUserRoster(originalRoster);
        //TODO Then save to the database
    };

    render() {
        return (
            <DragDropContext
                // These are callbacks for updating the drag when someone picks something up or drops it
                // Others are onDragStart and onDragUpdate. They can be used when people pick up the draggable or if they move it around
                onDragEnd={this.onDragEnd}
            >
                <Container>
                    {/* Iterate through all the columns to then display as many columns as needed */}
                    {this.state.columnOrder.map((columnId) => {
                        const column = this.state.columns[columnId];
                        //Iterate through all the players in the array of the column and then create an array of them all to show in a column
                        const roster = column.playerIds.map(playerId => this.state.userRoster[playerId]);
                        return <Column key={column.id} column={column} roster={roster} />;
                    })}
                </Container>
            </DragDropContext>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);