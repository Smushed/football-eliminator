import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

import { Row, Col } from 'reactstrap';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

    onDragEnd = () => {
        // the only one that is required
    };

    render() {
        return (
            this.state.columnOrder.map((columnId) => {
                const column = this.state.columns[columnId]; 
                const players = column.playerIds.map(playerId => this.state.players[playerId]);

                return <Column key={column.id} column={column} players={players} />;
            })
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);