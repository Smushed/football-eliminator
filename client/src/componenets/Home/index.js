import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col } from 'reactstrap';
import { RosterDisplay } from '../Roster';
import * as Routes from '../../constants/routes';
import { WeekSearch } from '../Roster/SearchDropdowns';

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
            userIdDisplayed: '',
            userRoster: {},
            weekSelect: 1
        };
    };

    componentDidMount() {
        if (this.props.userId && this.props.week) {
            this.setState({ weekSelect: this.props.week });
            this.getRoster(this.props.userId, this.props.week);
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.week !== prevProps.week) {
            this.setState({ weekSelect: this.props.week });
            this.getRoster(this.props.userId, this.props.week);
        };
    };

    leaderboardUserClicked(userId, username) {
        this.setState({ userRoster: {} });
        this.getRoster(userId, this.props.week, username)
    };

    getRoster(userId, week, username) {

        if (week !== 0 && this.props.season !== ``) {
            const season = this.props.season;

            this.setState({ weekSelect: week });

            axios.get(`/api/userRoster/${userId}`,
                { params: { week, season } })
                .then(res => {
                    this.sortRoster(res.data);

                    if (username) {
                        this.setState({ userDisplayed: username, userIdDisplayed: userId });
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
                this.setState({ userDisplayed: res.data.local.username, userIdDisplayed: userId })
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

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    customSeasonWeekSearch = (e) => {
        e.preventDefault();

        //Need to clear the playerIds when switching weeks. If not the program makes the array an array of undefined
        const userRoster = {};

        this.setState({ userRoster })

        this.getRoster(this.state.userIdDisplayed, this.state.weekSelect, this.state.userDisplayed);
    };

    render() {
        const { isAdmin } = this.props;
        const { userRoster, userDisplayed, userIdDisplayed, weekSelect } = this.state;
        const rosterPlayers = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'Flex', 'TE', 'K'];

        return (
            <Container fluid={true}>
                <Row>
                    <LeftPanel smCol='12' mdCol='5'
                        rosterPlayers={rosterPlayers}
                        addDropPlayer={null}
                        currentRoster={userRoster}
                        isAdmin={isAdmin}
                        userId={userIdDisplayed}
                        userDisplayed={userDisplayed}
                        weekSelect={weekSelect}
                        customSeasonWeekSearch={this.customSeasonWeekSearch}
                        handleChange={this.handleChange}
                        lockperoid={this.lockperoid} />
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
        {props.userDisplayed &&
            <Row>
                <Col xs='12'>
                    <Row>
                        <Col sm='12' className='centerText usernameHeader'>
                            {props.userDisplayed}
                        </Col>
                    </Row>
                </Col>
            </Row>
        }
        <Row>
            <Col md='12' className='centerText'>
                <WeekSearch weekSelect={props.weekSelect} handleChange={props.handleChange} customSeasonWeekSearch={props.customSeasonWeekSearch} />
            </Col>
        </Row>
        <Row>
            <Col md='12'>
                <RosterDisplay rosterPlayers={props.rosterPlayers} addDropPlayer={null} currentRoster={props.currentRoster} nameCol={'9'} scoreCol={'3'} />
            </Col>
        </Row>
        <Row>
            <Col xs='12' className='centerText userLinks'>
                <UserLinks isAdmin={props.isAdmin} userId={props.userId} userDisplayed={props.userDisplayed} />
            </Col>
        </Row>
    </Col>
);

const UserLinks = (props) => (
    <Fragment>
        {props.isAdmin &&
            <Link to={Routes.adminPanel}>
                <Button color='info' className='userLinkButton'>
                    Admin Panel
                </Button>
            </Link>
        }
        <Link to={`/roster/${props.userId}`}>
            <Button color='primary' className='userLinkButton'>
                Go to Roster
            </Button>
        </Link>
        <Link to={`/usedPlayers/${props.userId}`}>
            <Button color='info' className='userLinkButton'>
                Used Players
            </Button>
        </Link>
        <Link to={`/seasonLongScore/${props.userId}`}>
            <Button color='primary' className='userLinkButton'>
                Season Long Score
            </Button>
        </Link>
    </Fragment>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);
export { HomeLink };