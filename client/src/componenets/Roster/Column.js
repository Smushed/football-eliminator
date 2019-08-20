import React, { Component } from 'react';
import Player from './Player';
import { Droppable } from 'react-beautiful-dnd';
import './rosterStyle.css';

// The contiainer for the column should be display flex with a flex-direction or some other sort of growing box
// This is to allow the column to grow with the drag and dropping

class PlayerList extends Component {
    render() {
        const { provided, innerRef, children, snapshot } = this.props;
        return (
            <div {...provided.droppableProps}
                ref={innerRef}

                // Passing down the snapshot into the actual div to color the background when it is dragged over
                style={{
                    transition: 'background-color 0.2s',
                    backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'white',

                    // Be sure to have the flexGrow in combination with the display flex and flex-direction above.
                    // This will allow the lists to grow to the height of the column
                    flexGrow: '1'
                }}>
                {children}
            </div>
        );
    };
};

export default class Column extends Component {
    render() {
        return (
            <div className='columnStyle'>
                <h3 className='title'>
                    {this.props.column.title}
                </h3>
                <Droppable droppableId={this.props.column.id}>
                    {/* Snapshot is what you get when interacting with a DroppableThis has keys, including isDragging and draggingOver & draggingOverWith */}
                    {/* TODO: Possibly use draggingOverWith to key in when people try and drag over player they aren't suppossed to */}
                    {(provided, snapshot) => (
                        <PlayerList
                            innerRef={provided.innerRef}
                            provided={provided}
                            snapshot={snapshot}
                        >
                            {this.props.roster.map((player, index) => (
                                <Player key={player.mySportsId} player={player} index={index} provided={provided} innerRef={provided.innerRef} />
                            ))}
                            {provided.placeholder}
                        </PlayerList>
                    )}
                </Droppable>
            </div>
        );
    };
};