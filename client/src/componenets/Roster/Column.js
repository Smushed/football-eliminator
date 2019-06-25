import React, { Component } from 'react';
import styled from 'styled-components';
import Player from './Player';
import { Droppable } from 'react-beautiful-dnd'


const Container = styled.div`
    margin: 8px;
    border: 1px solid lightgrey;
    border-radius: 2px;
`;
const Title = styled.h3`
    padding: 8px;
`;

class PlayerList extends Component {
    render() {
        const { provided, innerRef, children } = this.props;
        return (
            <div {...provided.droppableProps} ref={innerRef}>
                {children}
            </div>
        )
    }
};

export default class Column extends Component {
    render() {
        return (
            <Container>
                <Title>
                    {this.props.column.title}
                </Title>
                <Droppable droppableId={this.props.column.id}>
                    {provided => (
                        <PlayerList
                            innerRef={provided.innerRef}
                            provided={provided}
                        >
                            {this.props.players.map((player, index) => (
                                <Player key={player.id} player={player} index={index} provided={provided} innerRef={provided.innerRef} />
                            ))}
                            {provided.placeholder}
                        </PlayerList>
                    )}
                </Droppable>
            </Container>
        );
    }
}