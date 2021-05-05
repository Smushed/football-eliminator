import React, { Component } from 'react';
import axios from 'axios';
import { PlayerDisplayRow } from '../Roster';
import { withAuthorization } from '../Session';

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
            this.setState({ usernameOfPage: this.props.match.params.username })
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) {
            this.getUsedPlayers();
            this.setState({ usernameOfPage: this.props.match.params.username })
        };
    };

    getUsedPlayers = () => {
        this.setState({ loading: true });
        axios.get(`/api/getUsedPlayers/${this.props.match.params.username}/${this.props.season}/${this.props.match.params.groupname}`)
            .then(res => {
                this.setState({ usedPlayers: res.data, loading: false });
            }).catch(err => {
                console.log(err)//TODO Better error handling
            });
    };

    render() {
        const positions = [`QB`, `RB`, `WR`, `TE`, `K`, `D`];
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

const condition = authUser => !!authUser;

export default withAuthorization(condition)(UsedPlayers);