import React, { Component } from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

//TODO Get rid of this so I can get rid of styled-components.
//I can just use normal styles and react conditional styling to achieve this
const Container = styled.div`
    border: 1px solid lightgrey;
    border-radius: 2px;
    padding: 8px;
    margin-bottom: 8px;
    margin-right: 8px;
    margin-left: 8px;
    background-color: white;

    background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')}
    `;
// checks to see if the isDragging props is set to true. If it is, set it to lightgreen, otherwise keep it as white

export default class Player extends Component {
    render() {
        return (
            <Draggable draggableId={this.props.player.mySportsId} index={this.props.index}>
                {/*The snapshot gives a window into the current state of the draggable. It has isDragging and draggingOver */}
                {(provided, snapshot) => (
                    < Container
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        // this passes the style of isDragging into the component
                        isDragging={snapshot.isDragging}
                    >
                        {this.props.player.full_name}
                    </Container>
                )
                }
            </Draggable>
        );
    };
};