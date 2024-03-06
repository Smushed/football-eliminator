import React, { useEffect } from 'react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import PropTypes from 'prop-types';

// SVGs are from Flatiron
import RankingSVG from '../../constants/SVG/ranking.svg';
import ListSVG from '../../constants/SVG/list.svg';
import PlayerSVG from '../../constants/SVG/player.svg';
import GroupSVG from '../../constants/SVG/group.svg';
import UserSVG from '../../constants/SVG/user.svg';

import * as Routes from '../../constants/routes';

import SignOutIcon from './SignOut.png';
import ElimLogo from './ElimLogo.png';
import './sidePanelStyle.css';

const SidePanel = ({
  firebase,
  user,
  currentGroup,
  showHideSideBar,
  showSideBar,
  hardSetSideBar,
  changeGroup,
}) => {
  useEffect(() => {}, [showSideBar]);

  const signUserOut = () => {
    firebase.doSignOut();
    hardSetSideBar(false);
  };

  const groupSelect = (e) => {
    changeGroup(e.target.value);
  };

  const username = user.username;

  return (
    <Menu
      onClose={() => hardSetSideBar(false)}
      className='sideBarHeight'
      isOpen={showSideBar}
      disableAutoFocus
    >
      <div className='logoWrapper'>
        <img
          className='eliminatorLogo'
          src={ElimLogo}
          alt={`Eliminator Logo`}
        />
      </div>
      <Link to={Routes.home} onClick={() => showHideSideBar()}>
        <div className='sidebarItemWrapper firstSidebarItem'>
          <img className='sidebarSVG' src={RankingSVG} alt='Ranking Logo' />
          <div className='sideBarItem'>Leaderboard</div>
        </div>
      </Link>
      <Link
        to={`/roster/${currentGroup.N}/${username}`}
        onClick={() => showHideSideBar()}
      >
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={ListSVG} alt='Roster Logo' />
          <div className='sideBarItem'>Roster</div>
        </div>
      </Link>
      <Link
        to={`/usedPlayers/${currentGroup.N}/${username}`}
        onClick={() => showHideSideBar()}
      >
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={PlayerSVG} alt='Used Players Logo' />
          <div className='sideBarItem'>Used Players</div>
        </div>
      </Link>
      <Link to={Routes.groupPage} onClick={() => showHideSideBar()}>
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={GroupSVG} alt='Group Logo' />
          <div className='sideBarItem'>Group Page</div>
        </div>
      </Link>
      <Link to={`/profile/user/${username}`} onClick={() => showHideSideBar()}>
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={UserSVG} alt='User Logo' />
          <div className='sideBarItem'>Profile Page</div>
        </div>
      </Link>
      {user.GL && (
        <select
          className='form-select groupDropdown'
          value={currentGroup._id}
          onChange={groupSelect}
        >
          {user.GL &&
            user.GL.map((group) => (
              <option key={group._id} value={group._id}>
                {group.N}
              </option>
            ))}
        </select>
      )}

      {/* TODO EMAIL VERIFICATION */}
      {/* {authUser && !authUser.emailVerified && (
                this.state.emailSent ?
                    <this.SentVerifyEmail /> :
                    <this.VerifyEmailButton authUser={authUser} />)} */}
      <div onClick={() => signUserOut()} className='sitBottom'>
        <div className='sidebarItemWrapper signOutSideItem'>
          <img className='sidebarSVG' src={SignOutIcon} alt='Sign Out' />
          <div className='sideBarItem'>Sign Out</div>
        </div>
      </div>
    </Menu>
  );
};

SidePanel.propTypes = {
  firebase: PropTypes.any,
  user: PropTypes.object,
  currentGroup: PropTypes.object,
  showHideSideBar: PropTypes.func,
  showSideBar: PropTypes.bool,
  hardSetSideBar: PropTypes.func,
  changeGroup: PropTypes.func,
};

export default withFirebase(SidePanel);
