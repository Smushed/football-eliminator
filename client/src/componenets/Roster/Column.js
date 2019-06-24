import React, { Component } from 'react';
import styled from 'styled-components';
import Player from './Player';


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
                <PlayerList>
                    {this.props.players.map(player =>
                        <Player key={player.id} player={player} />
                    )}
                </PlayerList>
            </Container>
        );
    }
}