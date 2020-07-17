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
        //Must set state hard here to ensure that it is loaded properly when the component unmounts and remounts
        // this.leaderboardUserClicked = this.leaderboardUserClicked.bind(this);
        this.state = {
            userDisplayed: '',
            userIdDisplayed: '',
            userRoster: {},
            weekSelect: 1,
            groupPositions: [],
            groupUsers: []
        };
    };

    componentDidMount() {
        if (this.props.userId && this.props.week && this.props.username) {
            this.setState({ weekSelect: this.props.week });
            this.getRoster(this.props.userId, this.props.week, this.props.username);
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.week !== prevProps.week) {
            this.setState({ weekSelect: this.props.week });
            this.getRoster(this.props.userId, this.props.week, this.props.username);
        };
    };

    // leaderboardUserClicked(userId, username) {
    //     this.setState({ userRoster: {} });
    //     this.getRoster(userId, this.props.week, username)
    // };

    getRoster(userId, week, username) {

        if (week !== 0 && this.props.season !== `` && this.props.group !== {}) {
            const { season, group } = this.props

            this.setState({ weekSelect: week });

            axios.get(`/api/userRoster/${group._id}/${userId}`,
                { params: { week, season } })
                .then(res => {
                    this.sortRoster(res.data.userRoster);
                    this.setState({ groupPositions: res.data.groupPositions });

                    if (username) {
                        this.setState({ userDisplayed: username, userIdDisplayed: userId });
                    } else {
                        this.getUserName(userId);
                    };

                }).catch(err => {
                    console.log(`roster data error`, err); //TODO better error handling
                });
        };
    };

    getUserName(userId) {
        axios.get(`/api/getUserById/${userId}`)
            .then(res => {
                this.setState({ userDisplayed: res.data.UN, userIdDisplayed: userId })
            }).catch(err => {
                console.log(err); //TODO better error handling
            });
    };

    sortRoster = (roster) => {
        const sortedRoster = [];
        for (let i = 0; i < this.props.positionOrder.length - 1; i++) {
            for (let ii = 0; ii < roster.length; ii++) {
                if (this.props.positionOrder[i] === roster[ii].P) {
                    sortedRoster.push(roster[ii]);
                };
            };
            if (!sortedRoster[i]) {
                sortedRoster.push({});
            };
        };

        this.setState({ userRoster: sortedRoster });

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
        const { userRoster, userDisplayed, userIdDisplayed, weekSelect, groupPositions } = this.state;

        return (
            <Container fluid={true}>
                <div className='currentRostersForGroup'>
                    This is where the array of rosters will go
                </div>
                <LeftPanel smCol='12' mdCol='5'
                    roster={userRoster}
                    groupPositions={groupPositions}
                    addDropPlayer={null}
                    isAdmin={isAdmin}
                    userId={userIdDisplayed}
                    userDisplayed={userDisplayed}
                    weekSelect={weekSelect}
                    customSeasonWeekSearch={this.customSeasonWeekSearch}
                    handleChange={this.handleChange}
                    groupId={this.props.group._id}
                    lockperoid={this.lockperoid} />
                <Col sm='12' md='7'>
                    {/* <Leaderboard
                        week={this.props.week}
                        season={this.props.season}
                        userClicked={this.leaderboardUserClicked}
                        groupName={this.props.group.N}
                        groupId={this.props.group._id} /> */}
                </Col>
            </Container>
        );
    };
};


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
                <RosterDisplay roster={props.roster} groupPositions={props.groupPositions} addDropPlayer={null} />
            </Col>
        </Row>
        <Row>
            <Col xs='12' className='centerText userLinks'>
                <UserLinks
                    isAdmin={props.isAdmin}
                    userId={props.userId}
                    userDisplayed={props.userDisplayed}
                    groupId={props.groupId}
                />
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
        <Link to={`/roster/${props.groupId}/${props.userId}`}>
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