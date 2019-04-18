import React, { Component, Fragment } from 'react';
import { withAuthorization } from './Session';
import { Link } from 'react-router-dom';
import * as Routes from '../constants/routes';


//Stateful component to allow the grouplist to properly populate
class Home extends Component {

    //TODO This only displays 3 groups properly!!
    render() {
        return (
            <Fragment>
                This is working
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