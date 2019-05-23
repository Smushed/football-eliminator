import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class DisplayPlayers extends Component {
    constructor(props) {
        super(props)
        this.state = {
            playersArray: [],
            loading: true
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