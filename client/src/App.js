import React, { useEffect, useState, useRef, useContext } from 'react';
import * as Routes from './constants/routes';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { withFirebase } from './contexts/Firebase';
import { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';

import SignInOut from './componenets/SignInOut';
import NavBar from './componenets/NavBar/';
import Home from './componenets/Home';
import UserProfile from './componenets/User/Profile';
import Roster from './componenets/Roster';
import AdminPanel from './componenets/AdminPanel';
import UsedPlayers from './componenets/Roster/UsedPlayers';
import GroupList from './componenets/Group/GroupList';
import CreateGroup from './componenets/Group/Profile/Create';
import FourOFour from './componenets/404';
import SidePanel from './componenets/SidePanel';
import AvatarWrapper from './contexts/Avatars';
import Unsubscribe from './componenets/Unsubscribe';
import GroupProfile from './componenets/Group/Profile/GroupProfile';
import { CurrentUserContext } from './contexts/CurrentUser';
import { NFLScheduleContext } from './contexts/NFLSchedule';
import './styles/profileStyle.css';
import './styles/rosterStyle.css';
import './styles/modalStyle.css';
import './styles/signInOutStyle.css';
import './styles/leaderBoardStyle.css';
import './styles/sidePanelStyle.css';

const App = ({ firebase }) => {
  const [showSideBar, setShowSideBar] = useState(false);

  const { currentUser, currentGroup, pullUserData, pullGroupData } =
    useContext(CurrentUserContext);
  const { getSeasonAndWeek } = useContext(NFLScheduleContext);

  const listener = useRef(null);

  useEffect(() => {
    listener.current = firebase.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        pullUserData();
        getSeasonAndWeek();
      }
      return function cleanup() {
        listener();
      };
    });
  }, [firebase]);

  const toggleSideBar = () => setShowSideBar(!showSideBar);

  const hardSetSideBar = (toggle) => setShowSideBar(toggle);

  return (
    <BrowserRouter>
      <AvatarWrapper>
        <Tooltip id='injuryTooltip' data-tooltip />
        <Tooltip id='lockTooltip' data-tooltip />
        <Toaster position='top-right' />
        <SidePanel
          showSideBar={showSideBar}
          currentGroup={currentGroup}
          toggleSideBar={toggleSideBar}
          hardSetSideBar={hardSetSideBar}
          changeGroup={pullGroupData}
        />
        {currentUser.email && <NavBar toggleSideBar={toggleSideBar} />}

        <Switch>
          <Route
            exact
            path={Routes.home}
            render={() => <Home group={currentGroup} />}
          />
          <Route path={Routes.adminPanel} render={() => <AdminPanel />} />
          <Route exact path={Routes.groupList} render={() => <GroupList />} />
          <Route path={Routes.signin} render={() => <SignInOut />} />
          <Route path={Routes.signup} render={() => <SignInOut />} />
          <Route path={Routes.userProfile} render={() => <UserProfile />} />
          <Route path={Routes.groupProfile} render={() => <GroupProfile />} />
          <Route path={Routes.roster} render={() => <Roster />} />
          <Route path={Routes.usedPlayers} render={() => <UsedPlayers />} />
          <Route
            path={Routes.createGroup}
            render={() => (
              <CreateGroup
                email={currentUser.email}
                changeGroup={pullGroupData}
                userId={currentUser.userId}
              />
            )}
          />
          <Route path={Routes.emailPref} render={() => <Unsubscribe />} />
          <Route render={() => <FourOFour />} />
        </Switch>
      </AvatarWrapper>
    </BrowserRouter>
  );
};

export { CurrentUserContext, NFLScheduleContext };

export default withFirebase(App);
