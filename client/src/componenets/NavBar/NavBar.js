import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NavbarDropdown from 'react-navbar-dropdown';

import * as Routes from '../../constants/routes';
import SignOutButton from './SignOutButton';

import ElimLogo from './ElimLogo.png';
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
                    {!this.props.noGroup &&
                        <NavbarDropdown>
                            <NavbarDropdown.Toggle className='navBarDropdownMenu'>
                                <NavbarDropdown.Open>
                                    <div className='navDropdownLink'>
                                        <img className='navHomeIcon' src={ElimLogo} alt={`Nav Bar`} />
                                    </div>
                                </NavbarDropdown.Open>
                                <NavbarDropdown.Close>
                                    <div className='navDropdownLink'>
                                        <img className='navHomeIcon' src={ElimLogo} alt={`Nav Bar`} />
                                    </div>
                                </NavbarDropdown.Close>
                            </NavbarDropdown.Toggle>
                            <NavbarDropdown.CSSTransitionMenu
                                className='navBarDropdown'
                                classNames='navBarDropdown'
                                timeout={200}
                            >
                                <Link to={Routes.home}>
                                    <NavbarDropdown.Item className='navBarDropdownItem'>
                                        Leaderboard
                                    </NavbarDropdown.Item>
                                </Link>
                                <Link to={`/roster/${this.props.groupId}/${this.props.userId}`}>
                                    <NavbarDropdown.Item className='navBarDropdownItem'>
                                        Roster
                                    </NavbarDropdown.Item>
                                </Link>
                                <Link to={`/usedPlayers/${this.props.groupId}/${this.props.userId}`}>
                                    <NavbarDropdown.Item className='navBarDropdownItem'>
                                        Used Players
                                    </NavbarDropdown.Item>
                                </Link>
                                <NavbarDropdown.Item className='navBarDropdownItem'>
                                    <div>Join / Create Group</div>
                                </NavbarDropdown.Item>
                                <NavbarDropdown.Item className='navBarDropdownItem'>
                                    <div>User Profile</div>
                                </NavbarDropdown.Item>
                            </NavbarDropdown.CSSTransitionMenu>
                        </NavbarDropdown>
                    }
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