import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

import * as Routes from '../../constants/routes';
import SignOutButton from './SignOutButton';

import HomeIcon from './HomeButton.png';
import './navBarStyle.css';


class NavBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            emailSent: false,
        };
    };

    componentDidMount() {
        if (this.props.authUser !== null) {
            // this.checkIfEmailAuth(this.props.authUser);
        }
    };


    componentDidUpdate(prevProps) {
        if (this.props.authUser !== prevProps.authUser) { // season here because it's the last prop we pass in. Probably not the best way
            // this.checkIfEmailAuth(this.props.authUser);
        };
    };

    sendAuthEmail = (authUser) => {
        authUser.sendEmailVerification();
        this.setState({ emailSent: true });
    };

    VerifyEmailButton = ({ authUser }) => <div className='verifyEmailDiv'>
        Please Verify your Email
        <br />
        <Button color='info' onClick={() => this.sendAuthEmail(authUser)}>Send Verification Email</Button>
    </div>;

    SentVerifyEmail = () => <div className='sentEmail'>Email has been sent</div>;

    render() {
        return (
            this.props.authUser ? (
                <div className='navHeader'>
                    <div >
                        <Link to={Routes.home}>
                            <img className='navIcons' src={HomeIcon} alt={`Home`} />
                        </Link>
                    </div>
                    {!this.props.authUser.emailVerified && (
                        this.state.emailSent ?
                            <this.SentVerifyEmail /> :
                            <this.VerifyEmailButton authUser={this.props.authUser} />)}
                    <div>
                        <SignOutButton />
                    </div>
                </div>
            ) : (
                    <div className='navHeader'>
                        <div >
                            <Link to={Routes.home}>
                                <img className='navIcons' src={HomeIcon} alt={`Home`} />
                            </Link>
                        </div>
                        <div>
                            <Link to={Routes.home}>
                                {/* <img className='navIcons' src={HomeIcon} alt={`Home`} /> */}
                            </Link>
                        </div>
                        <div>
                            <Link to={Routes.home}>
                                {/* <img className='navIcons' src={HomeIcon} alt={`Home`} /> */}
                            </Link>
                        </div>
                    </div>
                )
        );
    };
};



export default NavBar;