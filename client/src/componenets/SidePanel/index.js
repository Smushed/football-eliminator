import React, { useEffect } from 'react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import RankingSVG from './ranking.svg';
import ListSVG from './list.svg';
import PlayerSVG from './player.svg';

import * as Routes from '../../constants/routes';

import SignOutIcon from './SignOut.png';
import ElimLogo from './ElimLogo.png';
import './sidePanelStyle.css';

const SidePanel = ({ firebase, authUser, userId, groupId, showHideSideBar, showSideBar, hardSetSideBar }) => {

    useEffect(() => {
    }, [showSideBar]);

    const signUserOut = () => {
        firebase.doSignOut();
        hardSetSideBar(false);
    };

    const sendAuthEmail = (authUser) => {
        authUser.sendEmailVerification();
        this.setState({ emailSent: true });
    };

    const VerifyEmailButton = ({ authUser }) =>
        <div className='verifyEmailDiv floatRight notifications'>
            Please Verify your Email
        <br />
            <button className='btn btn-info' onClick={() => this.sendAuthEmail(authUser)}>Send Verification Email</button>
        </div>;

    const SentVerifyEmail = () => <div className='sentEmail floatRight notifications'>Email has been sent</div>;

    const SmallVerifyEmailButton = ({ authUser }) =>
        <div className='verifyEmailDiv floatRight notifications smallVerifyEmailBtn'>
            <button className='btn btn-info btn-sm' onClick={() => this.sendAuthEmail(authUser)}>Verifiy Email</button>
        </div>;

    const SmallSentVerifyEmail = () => <div className='sentEmail smallSentEmail floatRight notifications'>Sent!</div>;

    return (
        <Menu onClose={() => hardSetSideBar(false)} className='sideBarHeight' isOpen={showSideBar} disableAutoFocus>
            <div className='logoWrapper'>
                <img className='eliminatorLogo' src={ElimLogo} alt={`Eliminator Logo`} />
            </div>
            <Link to={Routes.home} onClick={() => showHideSideBar()}>
                <div className='sidebarItemWrapper firstSidebarItem'>
                    <img className='sidebarSVG' src={RankingSVG} alt='Ranking Logo' />
                    <div className='sideBarItem'>
                        Leaderboard
                    </div>
                </div>
            </Link>
            <Link to={`/roster/${groupId}/${userId}`} onClick={() => showHideSideBar()}>
                <div className='sidebarItemWrapper'>
                    <img className='sidebarSVG' src={ListSVG} alt='Roster Logo' />
                    <div className='sideBarItem'>
                        Roster
                    </div>
                </div>
            </Link>
            <Link to={`/usedPlayers/${groupId}/${userId}`} onClick={() => showHideSideBar()}>
                <div className='sidebarItemWrapper'>
                    <img className='sidebarSVG' src={PlayerSVG} alt='Used Players Logo' />
                    <div className='sideBarItem'>
                        Used Players
                    </div>
                </div>
            </Link>
            {/* TODO EMAIL VERIFICATION */}
            {/* {authUser && !authUser.emailVerified && (
                this.state.emailSent ?
                    <this.SentVerifyEmail /> :
                    <this.VerifyEmailButton authUser={authUser} />)} */}
            <div onClick={() => signUserOut()} className='sitBottom' >
                <div className='sidebarItemWrapper signOutSideItem'>
                    <img className='sidebarSVG' src={SignOutIcon} alt='Sign Out' />
                    <div className='sideBarItem'>
                        Sign Out
                    </div>
                </div>
            </div>
        </Menu>
    );
};




export default withFirebase(SidePanel);