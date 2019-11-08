import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { withRouter } from 'react-router-dom';

const Alert = withReactContent(Swal);

class Leaderboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userList: [],
            loading: false,
        };
    };

    componentDidMount() {
        if (typeof this.props.season !== `undefined` && this.props.season !== false) { // season here because it's the last prop we pass in. Probably not the best way
            this.getDataForLeaderboard(this.props.week, this.props.season);
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            this.getDataForLeaderboard(this.props.week, this.props.season);
        };
    };

    componentWillUnmount() {
        //TODO Fix this when the user gets off the homepage before it loads, there is a memory leak because the leaderboard data still comes in
        //https://codepen.io/dashtinejad/pen/Lxejpq
    }

    //Must break out these requests into individual functions so axios can do them async
    getAllUsers() {
        return axios.get(`/api/getAllUsers`);
    };

    getAllRosters(season) {
        if (season === ``) {
            return
        }
        return axios.get(`/api/getAllRosters/${season}`);
    };

    getDataForLeaderboard = (week, season) => {
        this.setState({ loading: true });

        //Handling if this was called too early
        if (season === ``) { return }
        axios.get(`/api/getLeaderboard/allUsers/`)
            .then(res => {
                this.setState({ loading: false, userList: res.data });
            });
    };

    redirect = (userId) => {
        const redirectValue = '/roster/' + userId;

        this.props.history.push(redirectValue);
    };

    render() {
        const columns = [
            { Header: `Username`, accessor: `username`, show: true },
            { Header: `email`, accessor: `email`, show: true },
            { Header: `Last Week's Score`, accessor: `weekScores[${this.props.week - 1}]`, show: true },
            { Header: `Total Score`, accessor: `totalScore`, show: true }];

        const defaultSorted = [{ id: 'totalScore', desc: true }];
        return (
            <div>
                <ReactTable
                    data={this.state.userList}
                    columns={columns}
                    defaultSorted={defaultSorted}
                    loading={this.state.loading}
                    defaultPageSize={20}
                    className="-highlight"

                    //TODO Enable an on click to have a pop up to view their weekly stats
                    getTdProps={(state, rowInfo) => {
                        return {
                            onClick: () => {
                                if (!rowInfo) { return };
                                console.log(`CLICKED`, rowInfo)
                                Alert.fire({
                                    title: rowInfo.original.username,
                                    showCancelButton: true,
                                    confirmButtonColor: '#228B22',
                                    cancelButtonColor: '#A9A9A9',
                                    confirmButtonText: 'Go to their page'
                                }).then(result => {
                                    if (result.value) {
                                        this.redirect(rowInfo.original.userId)
                                        // const redirectValue = '/roster/' + rowInfo.original.userId;
                                        // console.log(redirectValue)
                                        // return <Redirect to={redirectValue} />
                                    };
                                });
                            }
                        };
                    }}
                /></div>
        )
    };
};

export default withRouter(Leaderboard);
