import React, { Component } from 'react';
import axios from 'axios';
import { PlayerDisplayRow } from '../Roster';

import './usedPlayerStyle.css';

class UsedPlayers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usedPlayers: {},
            loading: false,
            usernameOfPage: '',
            displayPositions: [] //Figure out if we need to display them with a boolean
        };
    };

    componentDidMount() {
        if (this.props.season !== '') {
            this.getUsedPlayers();
            this.getGroupPositionsForDisplay();
            this.getCurrentUsername();
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) {
            this.getUsedPlayers();
            this.getGroupPositionsForDisplay();
            this.getCurrentUsername();
        };
    };

    getCurrentUsername() {
        if (typeof this.props.username !== `undefined` && this.props.username !== ``) {
            this.setState({ usernameOfPage: this.props.username })
        } else {
            axios.get(`/api/getUserById/${this.props.match.params.userId}`)
                .then(res => {
                    this.setState({ usernameOfPage: res.data.UN })
                }).catch(err => {
                    console.log(err); //TODO better error handling
                });
        };
    };

    getGroupPositionsForDisplay = () => {
        axios.get(`/api/getGroupPositionsForDisplay/${this.props.match.params.groupId}`)
            .then(res => {
                this.setState({ displayPositions: res.data.forDisplay });
            }).catch(err => {
                console.log(err); //TODO better error handling
            });
    };

    getUsedPlayers = () => {
        this.setState({ loading: true });
        axios.get(`/api/getUsedPlayers/${this.props.match.params.userId}/${this.props.season}/${this.props.match.params.groupId}`)
            .then(res => {
                this.setState({ usedPlayers: res.data, loading: false });
            }).catch(err => {
                console.log(err)//TODO Better error handling
            });
    };

    render() {
        const positions = [`QB`, `RB`, `WR`, `TE`, `K`, `D`]
        return (
            <div>
                <div className='centerText titleMargin headerFont'>
                    {this.state.usernameOfPage}'s Used Players
                </div>
                {positions.map(position => (
                    <div key={position}>
                        {this.state.usedPlayers[position] &&
                            <div className='usedPosition'>
                                <div className='sectionHeader'>
                                    {position}
                                </div>
                                {this.state.usedPlayers[position].map((player, i) => (
                                    <PlayerDisplayRow player={player} key={i} evenOrOddRow={i % 2} />
                                ))}
                            </div>
                        }
                    </div>
                ))}
            </div>
        )
    }
}

export default UsedPlayers;