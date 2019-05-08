import React, { Component } from 'react';
import axios from 'axios';

class DisplayPlayers extends Component {
    constructor(props) {
        super(props)
        this.state = {
            playersArray: []
        };
    };

    componentDidMount = async () => {
        const dbResponse = await axios.get(`/api/displayplayers`);

        console.log(dbResponse)
        if (dbResponse) {

            this.setState({
                playersArray: dbResponse.data
            })
        }
    };

    render() {
        return (
            <div>
                {/* TODO React Table Package might be good */}
                Bazinga
                <br />
                {this.state.playersArray.map((player, i) => (
                    <div>
                        {player.full_name} {player.position}
                    </div>
                ))}
            </div>
        )
    }
}

export default DisplayPlayers;