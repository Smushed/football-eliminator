import React, { useContext, useEffect } from 'react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import { CurrentUserContext } from '../../App.js';

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
  currentGroup,
  toggleSideBar,
  showSideBar,
  hardSetSideBar,
  changeGroup,
}) => {
  useEffect(() => {}, [showSideBar]);

  const { currentUser } = useContext(CurrentUserContext);

  const signUserOut = () => {
    firebase.doSignOut();
    hardSetSideBar(false);
  };

  const groupSelect = (e) => {
    changeGroup(e.target.value);
  };

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
      <Link to={Routes.home} onClick={() => toggleSideBar()}>
        <div className='sidebarItemWrapper firstSidebarItem'>
          <img className='sidebarSVG' src={RankingSVG} alt='Ranking Logo' />
          <div className='sideBarItem'>Leaderboard</div>
        </div>
      </Link>
      <Link
        to={`/roster/${currentGroup.name}/${currentUser.username}`}
        onClick={() => toggleSideBar()}
      >
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={ListSVG} alt='Roster Logo' />
          <div className='sideBarItem'>Roster</div>
        </div>
      </Link>
      <Link
        to={`/usedPlayers/${currentGroup.name}/${currentUser.username}`}
        onClick={() => toggleSideBar()}
      >
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={PlayerSVG} alt='Used Players Logo' />
          <div className='sideBarItem'>Used Players</div>
        </div>
      </Link>
      <Link to={Routes.groupPage} onClick={() => toggleSideBar()}>
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={GroupSVG} alt='Group Logo' />
          <div className='sideBarItem'>Group Page</div>
        </div>
      </Link>
      <Link
        to={`/profile/user/${currentUser.username}`}
        onClick={() => toggleSideBar()}
      >
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={UserSVG} alt='User Logo' />
          <div className='sideBarItem'>Profile Page</div>
        </div>
      </Link>
      {currentUser.grouplist && (
        <select
          className='form-select groupDropdown'
          value={currentGroup._id}
          onChange={groupSelect}
        >
          {currentUser.grouplist.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
      )}

      <div onClick={() => signUserOut()} className='sitBottom'>
        <div className='sidebarItemWrapper signOutSideItem'>
          <img className='sidebarSVG' src={SignOutIcon} alt='Sign Out' />
          <div className='sideBarItem'>Sign Out</div>
        </div>
      </div>
    </Menu>
  );
};

export default withFirebase(SidePanel);
