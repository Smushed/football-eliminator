import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

//Using Swal to display messages when a row is clicked for a player
const Alert = withReactContent(Swal);

class DisplayPlayers extends Component {
    constructor(props) {
        super(props)
        this.state = {
            playersArray: [],
            loading: true,
            currentPlayer: {}
        };
    };

    componentDidMount = async () => {
        const dbResponse = await axios.get(`/api/displayplayers`);

        if (dbResponse) {
            this.setState({
                playersArray: dbResponse.data,
                loading: false
            })
        }
    };

    playerPopUp = (playerStats) => {
        Alert.fire({
            text: `Do you want to add ${playerStats.full_name} to your roster?`,
            showCancelButton: true
        })
    }

    render() {
        const columns = [
            { Header: 'Full Name', accessor: 'full_name', show: true },
            { Header: 'Position', accessor: 'position', show: true },
            { Header: 'Team', accessor: 'team.abbreviation', show: true }];

        const { loading } = this.state;
        return (
            <div>

                {/* TODO React Table Package might be good */}
                <br />
                {this.state.playersArray ? (
                    <ReactTable
                        data={this.state.playersArray}
                        columns={columns}
                        loading={loading}
                        filterable
                        defaultPageSize={20}
                        className="-highlight"
                        getTdProps={(state, rowInfo) => {
                            return {
                                onClick: () => {
                                    this.playerPopUp(rowInfo.original)
                                    console.log('It was this mySportsId:', rowInfo.original)
                                }
                            }
                        }}
                    />
                ) : (
                        <div>
                            Nothing
                        </div>
                    )}
            </div>
        )
    }
}

export default DisplayPlayers;