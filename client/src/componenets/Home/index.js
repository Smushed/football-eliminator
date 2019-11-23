import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col } from 'reactstrap';
import { RosterDisplay } from '../Roster';
import * as Routes from '../../constants/routes';

import Leaderboard from './Leaderboard';
import './homeStyle.css';

//Stateful component to allow the grouplist to properly populate
class Home extends Component {
    constructor(props) {
        super(props);
        //Must set state hard here to ensure that it is loaded properly when the component unmounts and remounts±
        this.leaderboardUserClicked = this.leaderboardUserClicked.bind(this);
        this.state = {
            userDisplayed: '',
            userRoster: []
        };
    };

    componentDidMount() {
        if (this.props.userId && this.props.week) {
            this.getRoster(this.props.userId, this.props.week);
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.week !== prevProps.week) {
            this.getRoster(this.props.userId, this.props.week);
        };
    };

    leaderboardUserClicked(userId, username) {
        this.getRoster(userId, this.props.week, username)
    };

    getRoster(userId, week, username) {

        if (week !== 0 && this.props.season !== ``) {
            const season = this.props.season;

            axios.get(`/api/userRoster/${userId}`,
                { params: { week, season } })
                .then(res => {
                    this.sortRoster(res.data);

                    if (username) {
                        this.setState({ userDisplayed: username });
                    } else {
                        this.getUserName(userId);
                    }
                }).catch(err => {
                    console.log(`roster data error`, err); //TODO better error handling
                });
        };
    };

    getUserName(userId) {
        axios.get(`/api/getUserById/${userId}`)
            .then(res => {
                this.setState({ userDisplayed: res.data.local.username })
            }).catch(err => {
                console.log(err); //TODO better error handling
            });
    };

    sortRoster = (roster) => {
        //While we are sorting the roster we are also getting the object ready to be stored in the database
        //This sortRoster will be run before we ever go to save anything into the DB so it should populate the state correctly when we go to put it in
        const dbReadyRoster = {}; //It's saved as an object in the database

        //Here we iterate through the roster of the player and put them into an object for the order we want
        for (const player of roster) {
            const position = player.position;
            //If the position is QB, TE, or K then we can just put them directly in
            if (position === `QB`) {
                dbReadyRoster.QB = player;
                //If it's RB or WR then we need to assign it manually to the 1, 2 and flex spots
                //First we need to check the RB/WR 1 & 2 spots then assign it into the flex spot
            } else if (position === `RB`) {
                if (!dbReadyRoster.RB1) {
                    dbReadyRoster.RB1 = player;
                } else if (!dbReadyRoster.RB2) {
                    dbReadyRoster.RB2 = player;
                } else if (!dbReadyRoster.Flex) {
                    dbReadyRoster.Flex = player;
                }
            } else if (position === `WR`) {
                if (!dbReadyRoster.WR1) {
                    dbReadyRoster.WR1 = player;
                } else if (!dbReadyRoster.WR2) {
                    dbReadyRoster.WR2 = player;
                } else if (!dbReadyRoster.Flex) {
                    dbReadyRoster.Flex = player;
                };
            } else if (position === `TE`) {
                dbReadyRoster.TE = player;
            } else if (position === `K`) {
                dbReadyRoster.K = player;
            };
        };

        this.setState({ userRoster: dbReadyRoster });

        return;
    };

    render() {
        const { isAdmin, userId } = this.props;
        const { userRoster, userDisplayed } = this.state;
        const rosterPlayers = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'Flex', 'TE', 'K'];

        return (
            <Container fluid={true}>
                <Row>
                    <LeftPanel smCol='12' mdCol='5' rosterPlayers={rosterPlayers} addDropPlayer={null} currentRoster={userRoster} isAdmin={isAdmin} userId={userId} userDisplayed={userDisplayed} />
                    <Col sm='12' md='7'>
                        <Leaderboard week={this.props.week} season={this.props.season} userClicked={this.leaderboardUserClicked} />
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

const LeftPanel = (props) => (
    <Col sm={props.smCol} md={props.mdCol}>
        <Row>
            <Col sm='9'>
                {props.userDisplayed &&
                    props.userDisplayed + `'s Roster`
                }
            </Col>
            {props.userDisplayed &&
                <UserLinks smCol='3' isAdmin={props.isAdmin} userId={props.userId} />
            }
        </Row>
        <RosterDisplay colWidth='12' rosterPlayers={props.rosterPlayers} addDropPlayer={null} currentRoster={props.currentRoster} />
    </Col>
);

const UserLinks = (props) => (
    <Col sm={props.smCol}>
        <div className='centerText topMargin'>
            {props.isAdmin &&
                <Fragment>
                    <Link to={Routes.adminPanel}>
                        Go To Admin Panel
                    </Link>
                    <br />
                </Fragment>
            }
            <Link to={`/roster/${props.userId}`}>
                <Button color='primary' className='topMargin'>
                    My Roster
            </Button>
            </Link>
            <br />
            <Link to={`/usedPlayers/${props.userId}`}>
                <Button color='secondary' className='topMargin'>
                    Used Players
            </Button>
            </Link>
        </div>
    </Col>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);
export { HomeLink };