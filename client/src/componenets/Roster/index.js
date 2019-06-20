import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

import { Row, Col } from 'reactstrap';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
//Start here and use React Beautiful DND

class Roster extends Component {
    constructor(props) {
        super(props);
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
    onBeforeDragStart = () => {
        /*...*/
    };

    onDragStart = () => {
        /*...*/
    };
    onDragUpdate = () => {
        /*...*/
    };
    onDragEnd = () => {
        // the only one that is required
    };

    render() {
        return (
            <DragDropContext
                onBeforeDragStart={this.onBeforeDragStart}
                onDragStart={this.onDragStart}
                onDragUpdate={this.onDragUpdate}
                onDragEnd={this.onDragEnd}
            >
                <Droppable droppableId="droppable-1" type="PERSON">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : 'grey' }}
                            {...provided.droppableProps}
                        >
                            <h2>I am a droppable!</h2>
                            {provided.placeholder}
                        </div>
                    )}
                    <Draggable draggableId="draggable-1" index={0}>
                        {(provided, snapshot) => (
                            <h4>My draggable 1</h4>
                        )}
                    </Draggable>
                </Droppable>
                <div>Hello world</div>
            </DragDropContext>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Roster);