import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

import { DragDropContext } from 'react-beautiful-dnd';
import initialData from './InitialData';
import Column from './Column';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
`;

class Roster extends Component {
    constructor(props) {
        super(props);
        this.state = initialData;
    };

    componentDidMount() {
        const userIDFromURL = this.props.match.params.userID;
        if (typeof userIDFromURL !== 'undefined') {
            this.getRosterData(userIDFromURL);
        }
    };

    componentDidUpdate(prevProps) {
        if (this.props.userID !== prevProps.userID) {
            const userIDFromURL = this.props.match.params.userID;
            this.getRosterData(userIDFromURL);
        }
    };

    getRosterData = (userIDFromURL) => {
        if (userIDFromURL === this.props.userID) {

            //Inside here after the current roster is hit, then go in and pull the other data
            //Make the pull avaliable players easily hit from other places as well, since I want a dropdown that defaults to this week
            //But can be changed in case people want to update more than just this week at once.

            this.getAvailablePlayers(userIDFromURL);
        } else {
            //TODO update the styling on this page to then center the Roster as they are looking at another player
            //Maybe redirect these people to another page? Where they are instead viewing a snapshot of players they've used as well as current roster
        }
    };

    getAvailablePlayers = async (userID) => {
        console.log(`avail hit`)
        const dbResponse = await axios.get(`/api/availablePlayers/${userID}`);

        console.log(dbResponse);
    };

    onDragEnd = result => {
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
            // If we are not changing columns, only reordering within the columns then we can reorganize the list in the order the user wants

            //Make an array with the same contents as the old array
            const newPlayerIds = Array.from(start.playerIds);
            //Now move the task ID from its old index to its new index
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
        }

        // Moving from one column to another
        const startNewPlayerIds = Array.from(start.playerIds);
        //Remove the dragged task Id from this array
        startNewPlayerIds.splice(source.index, 1);
        //Create a new start column that contains the new properties as the old column but with the new start task Ids array
        const newStart = {
            ...start,
            playerIds: startNewPlayerIds
        };

        //Creating a new array for the dropped column that contains the same Ids as the finished task array
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

        this.setState(newState);

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
                        const players = column.playerIds.map(playerId => this.state.players[playerId]);

                        return <Column key={column.id} column={column} players={players} />;
                    })}
                </Container>
            </DragDropContext>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);