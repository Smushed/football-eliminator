import React, { Component } from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
    border: 1px solid lightgrey;
    padding: 8px;
    margin-bottom: 8px;
    margin-bottom: 8px;
`;

export default class Player extends Component {
    render() {
        return (
            <Draggable draggableId={this.props.player.id} index={this.props.index}>
                {provided => (
                    <Container
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        forwardRef={provided.forwardRef}
                    >
                        {this.props.player.passingyds}
                    </Container>
                )}
            </Draggable>
        );
    }
}