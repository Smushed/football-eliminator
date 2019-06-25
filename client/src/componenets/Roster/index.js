import React, { Component } from 'react';
import { withAuthorization } from '../Session';

import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import initialData from './InitialData';
import Column from './Column';
//Start here and use React Beautiful DND

class Roster extends Component {
    constructor(props) {
        super(props);
        this.state = initialData;
    }

    componentDidMount() {
        const userIDFromURL = this.props.match.params.userID;
        if (typeof userIDFromURL !== 'undefined') {
            this.getRosterData(userIDFromURL);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.userID !== prevProps.userID) {
            const userIDFromURL = this.props.match.params.userID;
            this.getRosterData(userIDFromURL);
        }
    }

    getRosterData = (userIDFromURL) => {
        if (userIDFromURL === this.props.userID) {
            console.log(`working`)
        }
    }

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
        const column = this.state.columns[source.droppableId];
        //Make an array with the same contents as the old array
        const newPlayerIds = Array.from(column.playerIds);
        //Now move the task ID from its old index to its new index
        newPlayerIds.splice(source.index, 1);
        //Start at the destination index, remove nothing and insert the draggableId in that spot
        newPlayerIds.splice(destination.index, 0, draggableId);

        //Create a new column which has the same properites as the old column but with the newPlayerIds array
        const newColumn = {
            ...column,
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
    };

    render() {
        return (
            <DragDropContext
                onDragEnd={this.onDragEnd}
            >
                {/* Iterate through all the columns to then display as many columns as needed */}
                {this.state.columnOrder.map((columnId) => {
                    const column = this.state.columns[columnId];
                    //Iterate through all the players in the array of the column and then create an array of them all to show in a column
                    const players = column.playerIds.map(playerId => this.state.players[playerId]);

                    return <Column key={column.id} column={column} players={players} />;
                })}
            </DragDropContext>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);