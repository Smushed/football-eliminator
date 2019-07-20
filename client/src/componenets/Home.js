import React, { Component, Fragment } from 'react';
import { withAuthorization } from './Session';
import { Link } from 'react-router-dom';
import * as Routes from '../constants/routes';
import { Button } from 'reactstrap';
import axios from 'axios';

//Stateful component to allow the grouplist to properly populate
class Home extends Component {

    loadDummyRoster = async () => {
        const loaded = await axios.put(`/api/dummyroster/${this.props.userId}`)
        console.log(loaded)
    };

    updateNFLRoster = async () => {
        try {
            const dbResponse = await axios.get(`/api/updateteams`);
            console.log(dbResponse.data);
        } catch (err) {
            console.log(err)
        }
    };

    availablePlayer = async () => {
        try {
            const dbResponse = await axios.get(`/api/avaliableplayers`);
            console.log(dbResponse.data);
        } catch (err) {
            console.log(err)
        }
    };

    render() {
        return (
            <Fragment>
                <Link to={Routes.createGroup}>
                    Create a Group
                </Link>
                <br />
                <Link to={`/roster/${this.props.userId}`}>
                    My Roster
                </Link>
                <br />
                <Link to={`/currenttesting`}>
                    Current Testing
                </Link>
                <br />
                <Link to={`/getweeklydata`}>
                    Update Weekly Player Data
                </Link>
                <br />
                <Link to={`/getmassdata`}>
                    Update all the player data
                </Link>
                <br />
                <Link to={`/displayplayers`}>
                    Display Player Data
                </Link>
                <br />
                <br />
                <br />
                <Button color='success' onClick={this.loadDummyRoster}>
                    Load Dummy Roster
                </Button>
                <br />
                <br />
                <br />
                <Button color='primary' onClick={this.updateNFLRoster}>
                    Update NFL Roster
                </Button>
                <br />
                <br />
                <br />
                <Button color='secondary' onClick={this.availablePlayer}>
                    TEST Available Players
                </Button>
            </Fragment>
        );
    };
};

const HomeLink = () => (
    <Link to={Routes.home}>
        <div>
            Home
        </div>
    </Link>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);
export { HomeLink }