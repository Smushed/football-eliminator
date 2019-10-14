import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Container, Col, Row } from 'reactstrap';

import './usedPlayerStyle.css';
import RosterButton from '../Roster/RosterButton';

class UsedPlayers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usedPlayers: [],
            loading: false,
            usernameOfPage: '',
        };
    };

    componentDidMount() {
        if (this.props.season !== '') {
            this.getUsedPlayers();
            this.getCurrentUsername();
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) {
            this.getUsedPlayers();
            this.getCurrentUsername();
        };
    };

    getCurrentUsername() {
        axios.get(`/api/getUserById/${this.props.match.params.userId}`)
            .then(res => {
                this.setState({ usernameOfPage: res.data.local.username })
            }).catch(err => {
                console.log(err); //TODO better error handling
            });
    };

    getUsedPlayers = () => {
        this.setState({ loading: true });
        axios.get(`/api/getUsedPlayers/${this.props.match.params.userId}/${this.props.season}`)
            .then(res => {
                this.setState({ usedPlayers: res.data, loading: false });
            }).catch(err => {
                console.log(err)//TODO Better error handling
            });

    };

    render() {
        const columns = [
            { Header: `QB`, accessor: `QB`, show: true },
            { Header: `RB`, accessor: `RB`, show: true },
            { Header: `WR`, accessor: `WR`, show: true },
            { Header: `TE`, accessor: `TE`, show: true },
            { Header: `K`, accessor: `K`, show: true }];

        return (
            <Container fluid={true}>
                <Row>
                    <Col xs='12'>
                        <Row>
                            <Col xs='12'>
                                <div className='centerText titleMargin headerFont'>
                                    {this.state.usernameOfPage}'s Used Players
                                </div>
                                <RosterButton
                                    username={this.state.usernameOfPage}
                                    userId={this.props.userId} />
                            </Col>
                        </Row>
                        <ReactTable
                            data={this.state.usedPlayers}
                            columns={columns}
                            loading={this.state.loading}
                            defaultPageSize={20}
                            className="-highlight"
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default UsedPlayers;