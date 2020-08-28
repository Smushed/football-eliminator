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

    NavLinks = (path) => {
        switch (path) {
            case 'roster':
                this.props.history.push(`/roster/${this.props.groupId}/${this.props.userId}`);
                break;
            case 'usedPlayers':
                this.props.history.push(`/usedPlayers/${this.props.groupId}/${this.props.userId}`);
                break;
            case 'groupPage':
                // this.props.history.push(Routes.home);
                break;
            case 'userProfile':
                // this.props.history.push(Routes.home);
                break;
        }
    };

    render() {
        return (
            <div className='navHeader'>
                <div className='halfWay leftHalf'>
                    <div>
                        <Link to={Routes.home}>
                            <img className='navHomeIcon floatLeft' src={ElimLogo} alt={`Home`} />
                        </Link>
                    </div>
                    {!this.props.noGroup &&
                        <NavbarDropdown>
                            <NavbarDropdown.Toggle className='navBarDropdownMenu'>
                                <NavbarDropdown.Open>
                                    <div className='navDropdownLink'>
                                        Links <svg x='0px' y='0px' width='30px' height='30px' viewBox='0 0 292.362 292.362'>
                                            <path d='M286.935,69.377c-3.614-3.617-7.898-5.424-12.848-5.424H18.274c-4.952,0-9.233,1.807-12.85,5.424 C1.807,72.998,0,77.279,0,82.228c0,4.948,1.807,9.229,5.424,12.847l127.907,127.907c3.621,3.617,7.902,5.428,12.85,5.428 s9.233-1.811,12.847-5.428L286.935,95.074c3.613-3.617,5.427-7.898,5.427-12.847C292.362,77.279,290.548,72.998,286.935,69.377z' />
                                        </svg>
                                    </div>
                                </NavbarDropdown.Open>
                                <NavbarDropdown.Close>
                                    <div className='navDropdownLink'>
                                        Links <svg x='0px' y='0px' width='30px' height='30px' viewBox='0 0 292.362 292.362'>
                                            <path d='M286.935,197.286L159.028,69.379c-3.613-3.617-7.895-5.424-12.847-5.424s-9.233,1.807-12.85,5.424L5.424,197.286 C1.807,200.9,0,205.184,0,210.132s1.807,9.233,5.424,12.847c3.621,3.617,7.902,5.428,12.85,5.428h255.813 c4.949,0,9.233-1.811,12.848-5.428c3.613-3.613,5.427-7.898,5.427-12.847S290.548,200.9,286.935,197.286z' />
                                        </svg>
                                    </div>
                                </NavbarDropdown.Close>
                            </NavbarDropdown.Toggle>
                            <NavbarDropdown.CSSTransitionMenu
                                className='navBarDropdown'
                                classNames='navBarDropdown'
                                timeout={200}
                            >
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
                        // <Fragment>
                        //     <div className='largeViewLinks'>
                        //         <Link to={`/roster/${this.props.groupId}/${this.props.userId}`}>
                        //             <button className='btn btn-success navButton floatLeft'>Your Roster</button>
                        //         </Link>
                        //         <Link to={`/usedPlayers/${this.props.groupId}/${this.props.userId}`}>
                        //             <button className='btn btn-success navButton floatLeft'>Your Used Players</button>
                        //         </Link>
                        //     </div>
                        //     <div className='smallViewLinks'>
                        //         <Link to={`/roster/${this.props.groupId}/${this.props.userId}`}>
                        //             <button className='btn btn-success btn-sm navButton floatLeft'>Roster</button>
                        //         </Link>
                        //         <div className='superSmallHide'>
                        //             <Link to={`/usedPlayers/${this.props.groupId}/${this.props.userId}`}>
                        //                 <button className=' btn btn-success btn-sm navButton floatLeft'>Used Players</button>
                        //             </Link>
                        //         </div>
                        //     </div>
                        // </Fragment>
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