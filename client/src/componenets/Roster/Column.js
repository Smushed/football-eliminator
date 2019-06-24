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
const PlayerList = styled.div`
    padding: 8px;
`;


export default class Column extends Component {
    render() {
        return (
            <Container>
                <Title>
                    {this.props.column.title}
                </Title>
                <Droppable droppableId={this.props.players.id}>
                    {(provided) => (
                        <PlayerList
                            forwardRef={provided.forwardRef}
                            {...provided.droppableProps}
                        >
                            {/* TODO Places to start with next time
                            https://egghead.io/lessons/react-reorder-a-list-with-react-beautiful-dnd
                            https://github.com/atlassian/react-beautiful-dnd/issues/875 */}
                            {this.props.players.map((player, index) => <Player key={player.id} player={player} index={index} />)}
                            {provided.placeholder}
                        </PlayerList>
                    )}
                </Droppable>
            </Container>
        );
    }
}