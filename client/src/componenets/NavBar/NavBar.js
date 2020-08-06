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

    SmallVerifyEmailButton = ({ authUser }) =>
        <div className='verifyEmailDiv floatRight notifications smallVerifyEmailBtn'>
            <button className='btn btn-info btn-sm' onClick={() => this.sendAuthEmail(authUser)}>Verifiy Email</button>
        </div>;

    SmallSentVerifyEmail = () => <div className='sentEmail smallSentEmail floatRight notifications'>Sent!</div>;

    render() {
        return (
            <div className='navHeader'>
                <div className='halfWay leftHalf'>
                    <div>
                        <Link to={Routes.home}>
                            <img className='navHomeIcon floatLeft' src={ElimLogo} alt={`Home`} />
                        </Link>
                    </div>
                    <div className='largeViewLinks'>
                        <Link to={`/roster/${this.props.groupId}/${this.props.userId}`}>
                            <button className='btn btn-success navButton floatLeft'>Your Roster</button>
                        </Link>
                        <Link to={`/usedPlayers/${this.props.groupId}/${this.props.userId}`}>
                            <button className='btn btn-success navButton floatLeft'>Your Used Players</button>
                        </Link>
                    </div>
                    <div className='smallViewLinks'>
                        <Link to={`/roster/${this.props.groupId}/${this.props.userId}`}>
                            <button className='btn btn-success btn-sm navButton floatLeft'>Roster</button>
                        </Link>
                        <Link to={`/usedPlayers/${this.props.groupId}/${this.props.userId}`}>
                            <button className='btn btn-success btn-sm navButton floatLeft'>Used Players</button>
                        </Link>
                    </div>
                </div>
                <div className='halfWay rightHalf'>
                    <div className='largeViewLinks'>
                        <SignOutButton descText={true} />
                        {!this.props.authUser.emailVerified && (
                            this.state.emailSent ?
                                <this.SentVerifyEmail /> :
                                <this.VerifyEmailButton authUser={this.props.authUser} />)}
                    </div>
                    <div className='smallViewLinks'>
                        <SignOutButton descText={false} />
                        {!this.props.authUser.emailVerified && (
                            this.state.emailSent ?
                                <this.SmallSentVerifyEmail /> :
                                <this.SmallVerifyEmailButton authUser={this.props.authUser} />)}
                    </div>
                </div>
            </div>
        );
    };
};



export default NavBar;