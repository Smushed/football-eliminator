import React, { Component } from 'react';
import axios from 'axios';
import { Container, Col, Row } from 'reactstrap';


class UsedPlayers extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            }).catch(err => {
                console.log(err)//TODO Better error handling
            });
    };

    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col sm='12'>
                        <div>
                            {this.props.match.params.userId}
                            <br />
                            {this.props.season}
                            <br />
                            {this.props.week}
                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default UsedPlayers;