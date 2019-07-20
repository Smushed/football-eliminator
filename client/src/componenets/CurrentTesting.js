import React, { Component } from 'react';
import axios from 'axios';


export default class CurrentTesting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            playersArray: [],
        };
    };

    componentDidMount = async () => {
    };

    render() {
        return (
            <div>
                Working

                {/* {this.state.playersArray.map(player => <SinglePlayer player={player} key={player.id} />)} */}
            </div>
        );
    }
};

const SinglePlayer = props => {

    return (
        <div>
            {console.log(props)}
            {props.player.player.lastName}
        </div>
    )
}