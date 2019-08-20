import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col } from 'reactstrap';
import * as Routes from '../../constants/routes';

import Leaderboard from './Leaderboard';
import './homeStyle.css';

//Stateful component to allow the grouplist to properly populate
class Home extends Component {

    render() {
        const { isAdmin } = this.props;
        return (
            <Container fluid={true}>
                <Row>
                    <Col sm='12' md='3'>
                        <div className='centerText topMargin'>
                            {isAdmin &&
                                <Fragment>
                                    <Link to={Routes.adminPanel}>
                                        Go To Admin Panel
                                </Link>
                                    <br />
                                </Fragment>
                            }
                            <Link to={`/roster/${this.props.userId}`}>
                                <Button color='primary' className='topMargin'>
                                    My Roster
                                </Button>
                            </Link>
                            <br />
                            {/*  
                        <Link to={`/displayplayers`}>
                        Display Player Data
                        </Link>
                    <br /> */}
                        </div>
                    </Col>
                    <Col sm='12' md='9'>
                        <Leaderboard week={this.props.week} season={this.props.season} />
                    </Col>
                </Row>
            </Container>
        );
    };
};

const HomeLink = (props) => (
    <Link to={Routes.home}>
        <div style={props.testStyle}>
            Home
        </div>
    </Link>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);
export { HomeLink };