import React, { useContext, useEffect, useState } from 'react';
import { withFirebase } from '../../contexts/Firebase';
import { Link } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import { CurrentUserContext } from '../../App.js';

// SVGs are from Flatiron
import RankingSVG from '../../constants/SVG/ranking.svg';
import ListSVG from '../../constants/SVG/list.svg';
import PlayerSVG from '../../constants/SVG/player.svg';
import GroupSVG from '../../constants/SVG/group.svg';
import UserSVG from '../../constants/SVG/user.svg';
import ClipboardSVG from '../../constants/SVG/clipboard.svg';
import * as Routes from '../../constants/routes';
import SignOutIcon from '../../constants/elimLogos/SignOut.png';
import ElimLogo from '../../constants/elimLogos/ElimLogo.png';

const SidePanel = ({
  firebase,
  currentGroup,
  toggleSideBar,
  showSideBar,
  hardSetSideBar,
  changeGroup,
}) => {
  const [mainGroupName, setMainGroupName] = useState('');

  const { currentUser } = useContext(CurrentUserContext);

  useEffect(() => {}, [showSideBar]);

  useEffect(() => {
    if (currentUser.grouplist && currentUser.grouplist.length > 0) {
      getMainGroup(currentUser);
    }
  }, [currentUser]);

  const signUserOut = () => {
    firebase.doSignOut();
    hardSetSideBar(false);
  };

  const groupSelect = (e) => {
    changeGroup(e.target.value);
  };

  const getMainGroup = (currUser) => {
    if (!currUser.mainGroup) {
      return;
    }
    const mainGroup = currUser.grouplist.find(
      (group) => group._id === currUser.mainGroup
    );
    setMainGroupName(mainGroup.name);
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
        <div className='sidebarItemWrapper mt-2'>
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
      <Link
        to={`/profile/user/${currentUser.username}`}
        onClick={() => toggleSideBar()}
      >
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={UserSVG} alt='User Logo' />
          <div className='sideBarItem'>Profile Page</div>
        </div>
      </Link>
      <Link
        to={`/profile/group/${mainGroupName}`}
        onClick={() => toggleSideBar()}
      >
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={ClipboardSVG} alt='Clipboard Logo' />
          <div className='sideBarItem'>{mainGroupName} Group Page</div>
        </div>
      </Link>
      <Link to={Routes.groupList} onClick={() => toggleSideBar()}>
        <div className='sidebarItemWrapper'>
          <img className='sidebarSVG' src={GroupSVG} alt='Group Logo' />
          <div className='sideBarItem'>Group List</div>
        </div>
      </Link>

      {currentUser.grouplist && currentUser.grouplist.length > 0 && (
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
