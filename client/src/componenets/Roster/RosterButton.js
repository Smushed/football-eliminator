import React, { Component } from 'react';
import { Row, Col, Button } from 'reactstrap';
import { withRouter } from 'react-router-dom';


class RosterButton extends Component {
    redirect = () => {
        const redirectValue = '/roster/' + this.props.userId;

        this.props.history.push(redirectValue);
    };
    render() {
        return (
            <Row className='rosterButton'>
                <Col xs='0' md='4' />
                <Col xs='12' md='4'>
                    <div className='centerText'>
                        <Button color='info' onClick={this.redirect}>
                            View {this.props.username}'s Roster
                        </Button>
                    </div>
                </Col>
                <Col xs='0' md='4' />
            </Row>
        );
    };
};

export default withRouter(RosterButton);