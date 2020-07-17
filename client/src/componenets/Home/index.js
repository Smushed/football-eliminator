import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col } from 'reactstrap';
import { RosterDisplay } from '../Roster';
import * as Routes from '../../constants/routes';
import { WeekSearch } from '../Roster/SearchDropdowns';

import './homeStyle.css';

//Stateful component to allow the grouplist to properly populate
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userDisplayed: '',
            userIdDisplayed: '',
            groupRosters: [],
            weekSelect: 1,
            groupPositions: [],
            leaderBoard: []
        };
    };

    componentDidMount() {
        if (this.props.userId && this.props.week && this.props.username && this.props.season && this.props.group) {
            this.setState({ weekSelect: this.props.week });
            this.getAllRostersForGroup(this.props.season, this.props.week, this.props.group._id)
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.week !== prevProps.week) {
            this.setState({ weekSelect: this.props.week });
            this.getAllRostersForGroup(this.props.season, this.props.week, this.props.group._id)
        };
    };

    getAllRostersForGroup(season, week, groupId) {
        axios.get(`/api/getAllRostersForGroup/${season}/${week}/${groupId}`)
            .then(res => this.setState({ groupRoster: res.data }));
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
        return (
            <div className='container'>
                <div className='currentRostersForGroup'>
                    This is where the array of rosters will go
                </div>
            </div>
        );
    };
};

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