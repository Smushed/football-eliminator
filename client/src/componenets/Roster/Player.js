import React, { Component } from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
    border: 1px solid lightgrey;
    padding: 8px;
    margin-bottom: 8px;
    margin-bottom: 8px;
    background-color: white;

    background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')}
    `;
// checks to see if the isDragging props is set to true. If it is, set it to lightgreen, otherwise keep it as white

export default class Player extends Component {
    render() {
        return (
            <Draggable draggableId={this.props.player.id} index={this.props.index}>
                {/*The snapshot gives a window into the current state of the draggable. It has isDragging and draggingOver */}
                {(provided, snapshot) => (
                    < Container
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        // this passes the style of isDragging into the component
                        isDragging={snapshot.isDragging}
                    >
                        {this.props.player.passingyds}
                    </Container>
                )
                }
            </Draggable>
        );
    }
}