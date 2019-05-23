import React, { Component, Fragment } from 'react';
import { withAuthorization } from './Session';
import { Link } from 'react-router-dom';
import * as Routes from '../constants/routes';


//Stateful component to allow the grouplist to properly populate
class Home extends Component {

    render() {
        return (
            <Fragment>
                <Link to={Routes.createGroup}>
                    Create a Group
                </Link>
                <br />
                <Link to={`/testroster`}>
                    Roster
                </Link>
                <br />
                <Link to={`/testgamedata`}>
                    Game Data
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