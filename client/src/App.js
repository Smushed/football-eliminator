import React, { useEffect, useState, useRef, useContext } from 'react';
import * as Routes from './constants/routes';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { withFirebase } from './componenets/Firebase';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

import SignInOut from './componenets/SignInOut';
import NavBar from './componenets/NavBar/';
import Home from './componenets/Home';
import UserProfile from './componenets/Profile/User';
import Roster from './componenets/Roster';
import AdminPanel from './componenets/AdminPanel';
import UsedPlayers from './componenets/UsedPlayers';
import GroupPage from './componenets/GroupPage/';
import CreateGroup from './componenets/GroupPage/CreateGroup';
import FourOFour from './componenets/404';
import SidePanel from './componenets/SidePanel';
import AvatarWrapper from './contexts/Avatars';
import Unsubscribe from './componenets/Unsubscribe';
import { CurrentUserContext } from './contexts/CurrentUser';
import { axiosHandler, httpErrorHandler } from './utils/axiosHandler';

const App = ({ firebase }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(``);
  const [currentGroup, setCurrentGroup] = useState({});
  const [showSideBar, setShowSideBar] = useState(false);
  const [lockWeek, setLockWeek] = useState(0);

  const listener = useRef(null);

  const { currentUser, setCurrentUser, setUserHasGroup } =
    useContext(CurrentUserContext);

  useEffect(() => {
    listener.current = firebase.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        pullUserData(authUser);
      }
      return function cleanup() {
        listener();
      };
    });
  }, [firebase]);

  const pullUserData = async (authUser) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/user/email/${authUser.email}`
      );

      updateCurrentUser(data.userInfo, data.emailSettings);

      if (data.userInfo.grouplist.length > 0) {
        initGroup(data.userInfo);
      } else {
        setUserHasGroup(false);
      }
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const updateCurrentUser = (user, emailSettings) => {
    const currentUser = {
      username: user.username,
      userId: user._id,
      isAdmin: user.admin,
      email: user.email,
      grouplist: user.grouplist,
      mainGroup: user.mainGroup || null,
      emailSettings: {
        reminderEmail: emailSettings.reminderEmail,
        leaderboardEmail: emailSettings.leaderboardEmail,
      },
    };
    setCurrentUser(currentUser);
  };

  const initGroup = async (user) => {
    setUserHasGroup(true);
    if (user.mainGroup) {
      const res = await axiosHandler.get(
        `/api/group/details/${user.mainGroup}`
      );
      setCurrentGroup({ name: res.data.name, _id: user.mainGroup });
    } else {
      axiosHandler.put(
        `/api/user/group/main/${user.grouplist[0]._id}/${user._id}`
      );
      setCurrentGroup({
        name: user.grouplist[0].name,
        _id: user.grouplist[0]._id,
      });
    }
    getSeasonAndWeek();
  };

  const changeGroup = async (groupId) => {
    const res = await axios.get(`/api/group/details/${groupId}`);
    setCurrentGroup({ name: res.data.name, _id: res.data._id });
  };

  const getSeasonAndWeek = async () => {
    const { data } = await axios.get('/api/nfldata/currentSeasonAndWeek');
    setCurrentSeason(data.season);
    setCurrentWeek(data.week);
    setLockWeek(data.lockWeek);
  };

  const toggleSideBar = () => setShowSideBar(!showSideBar);

  const hardSetSideBar = (toggle) => setShowSideBar(toggle);

  return (
    <BrowserRouter>
      <AvatarWrapper>
        <Toaster position='top-right' />
        <SidePanel
          showSideBar={showSideBar}
          currentGroup={currentGroup}
          toggleSideBar={toggleSideBar}
          hardSetSideBar={hardSetSideBar}
          changeGroup={changeGroup}
        />
        {currentUser.email && <NavBar toggleSideBar={toggleSideBar} />}

        <Switch>
          <Route
            exact
            path={Routes.home}
            render={() => (
              <Home
                season={currentSeason}
                group={currentGroup}
                week={currentWeek}
              />
            )}
          />
          <Route
            path={Routes.adminPanel}
            render={() => <AdminPanel season={currentSeason} />}
          />
          <Route
            exact
            path={Routes.groupPage}
            render={() => (
              <GroupPage pullUserData={pullUserData} season={currentSeason} />
            )}
          />
          <Route path={Routes.signin} render={() => <SignInOut />} />
          <Route path={Routes.signup} render={() => <SignInOut />} />
          <Route
            path={Routes.userProfile}
            render={() => (
              <UserProfile
                currentUser={currentUser}
                pullUserData={pullUserData}
              />
            )}
          />
          <Route
            path={Routes.roster}
            render={() => (
              <Roster
                week={currentWeek}
                season={currentSeason}
                appLevelLockWeek={lockWeek}
              />
            )}
          />
          <Route
            path={Routes.usedPlayers}
            render={(props) => (
              <UsedPlayers {...props} season={currentSeason} />
            )}
          />
          <Route
            path={Routes.createGroup}
            render={() => (
              <CreateGroup
                email={currentUser.email}
                pullUserData={pullUserData}
                changeGroup={changeGroup}
                userId={currentUser.userId}
              />
            )}
          />
          <Route
            path={Routes.emailPref}
            render={(props) => <Unsubscribe {...props} />}
          />
          <Route render={() => <FourOFour />} />
        </Switch>
      </AvatarWrapper>
    </BrowserRouter>
  );
};

export default withFirebase(App);
