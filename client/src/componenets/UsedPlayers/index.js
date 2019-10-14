import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Container, Col, Row } from 'reactstrap';

import './usedPlayerStyle.css';

class UsedPlayers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usedPlayers: [],
            loading: false,
        }
    };

    componentDidMount() {
        if (this.props.week !== 0 && this.props.season !== '') {
            this.getUsedPlayers();
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) {
            this.getUsedPlayers();
        };
    };

    getUsedPlayers = () => {
        axios.get(`/api/getUsedPlayers/${this.props.match.params.userId}/${this.props.season}`)
            .then(res => {
                console.log(res);
                this.setState({ usedPlayers: res.data });
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
                    <Col sm='12'>
                        <div className='centerText topAndBottomMargin headerFont'>
                            {this.props.username}'s Used Players
                        </div>
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