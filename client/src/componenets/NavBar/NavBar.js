import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import * as Routes from '../../constants/routes';
import SignOutButton from './SignOutButton';

import ElimLogo from './ElimLogo.jpg';
import './navBarStyle.css';


class NavBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            emailSent: false,
        };
    };

    sendAuthEmail = (authUser) => {
        authUser.sendEmailVerification();
        this.setState({ emailSent: true });
    };

    VerifyEmailButton = ({ authUser }) =>
        <div className='verifyEmailDiv floatRight notifications'>
            Please Verify your Email
        <br />
            <button className='btn btn-info' onClick={() => this.sendAuthEmail(authUser)}>Send Verification Email</button>
        </div>;

    SentVerifyEmail = () => <div className='sentEmail floatRight notifications'>Email has been sent</div>;

    render() {
        return (
            <div className='navHeader'>
                <div className='halfWay leftHalf'>
                    <div>
                        <Link to={Routes.home}>
                            <img className='navHomeIcon floatLeft' src={ElimLogo} alt={`Home`} />
                        </Link>
                    </div>
                    <div>
                        <Link to={`/roster/${this.props.groupId}/${this.props.userId}`}>
                            <button className='btn btn-success navButton floatLeft'>Your Roster</button>
                        </Link>
                    </div>
                    <div>
                        <Link to={`/usedPlayers/${this.props.groupId}/${this.props.userId}`}>
                            <button className='btn btn-success navButton floatLeft'>Your Used Players</button>
                        </Link>
                    </div>
                </div>
                <div className='halfWay rightHalf'>
                    <SignOutButton />
                    {!this.props.authUser.emailVerified && (
                        this.state.emailSent ?
                            <this.SentVerifyEmail /> :
                            <this.VerifyEmailButton authUser={this.props.authUser} />)}
                </div>
            </div>
        );
    };
};



export default NavBar;