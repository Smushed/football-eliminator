import React, { useEffect } from 'react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';

// SVGs are from Flatiron
import RankingSVG from './ranking.svg';
import ListSVG from './list.svg';
import PlayerSVG from './player.svg';
import GroupSVG from './group.svg';
import UserSVG from './user.svg';

import * as Routes from '../../constants/routes';

import SignOutIcon from './SignOut.png';
import ElimLogo from './ElimLogo.png';
import './sidePanelStyle.css';

const SidePanel = ({ firebase, username, groupname, showHideSideBar, showSideBar, hardSetSideBar }) => {

    useEffect(() => {
    }, [showSideBar]);

    const signUserOut = () => {
        firebase.doSignOut();
        hardSetSideBar(false);
    };

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
            <Link to={`/roster/${groupname}/${username}`} onClick={() => showHideSideBar()}>
                <div className='sidebarItemWrapper'>
                    <img className='sidebarSVG' src={ListSVG} alt='Roster Logo' />
                    <div className='sideBarItem'>
                        Roster
                    </div>
                </div>
            </Link>
            <Link to={`/usedPlayers/${groupname}/${username}`} onClick={() => showHideSideBar()}>
                <div className='sidebarItemWrapper'>
                    <img className='sidebarSVG' src={PlayerSVG} alt='Used Players Logo' />
                    <div className='sideBarItem'>
                        Used Players
                    </div>
                </div>
            </Link>
            <Link to={Routes.groupPage} onClick={() => showHideSideBar()}>
                <div className='sidebarItemWrapper'>
                    <img className='sidebarSVG' src={GroupSVG} alt='Group Logo' />
                    <div className='sideBarItem'>
                        Group Page
                    </div>
                </div>
            </Link>
            <Link to={Routes.userProfile} onClick={() => showHideSideBar()}>
                <div className='sidebarItemWrapper'>
                    <img className='sidebarSVG' src={UserSVG} alt='User Logo' />
                    <div className='sideBarItem'>
                        Profile Page
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