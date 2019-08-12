import React, { Component, Fragment } from 'react';
import { withAuthorization } from './Session';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import axios from 'axios';
import * as Routes from '../constants/routes';


import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

//Using Swal to display messages when add book button is hit
const Alert = withReactContent(Swal);


//Stateful component to allow the grouplist to properly populate
class Home extends Component {

    updateToAdmin = async () => {
        const serverResponse = await axios.put(`/api/updateUserToAdmin/${this.props.userId}`);

        Alert.fire({
            type: 'success',
            text: serverResponse.data
        })
    }

    render() {
        const { isAdmin } = this.props;
        return (
            <Fragment>
                {isAdmin &&
                    <Fragment>
                        <Link to={Routes.adminPanel}>
                            Go To Admin Panel
                        </Link>
                        <br />
                    </Fragment>
                }
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
                <Link to={`/displayplayers`}>
                    Display Player Data
                </Link>
                <br />
                <Button color='secondary' onClick={() => this.updateToAdmin()}>
                    Update to Admin
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