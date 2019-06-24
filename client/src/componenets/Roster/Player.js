import React, { Component } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    border: 1px solid lightgrey;
    padding: 8px;
    margin-bottom: 8px;
    margin-bottom: 8px;
`;

export default class Player extends Component {
    render() {
        return (
            <Container>
                {this.props.player.passingyds}
            </Container>
        )
    }
}