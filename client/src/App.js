import React, { useEffect, useState, useRef, createContext } from 'react';
import * as Routes from './constants/routes';
import { Route, BrowserRouter, Switch, useHistory } from 'react-router-dom';
import { withFirebase } from './componenets/Firebase';
import { Toaster } from 'react-hot-toast';

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
import { axiosHandler, httpErrorHandler } from './utils/axiosHandler';
import { getAuth } from 'firebase/auth';

const CurrentUserContext = createContext();
const NFLScheduleContext = createContext();

const App = ({ firebase }) => {
  const [currentGroup, setCurrentGroup] = useState({});
  const [showSideBar, setShowSideBar] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const [currentNFLTime, setCurrentNFLTime] = useState({
    season: '',
    week: 1,
    lockWeek: 0,
  });

  const listener = useRef(null);

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
    try {
      getSeasonAndWeek();
      if (user.mainGroup) {
        const res = await axiosHandler.get(
          `/api/group/details/${user.mainGroup}`
        );
        setCurrentGroup({ name: res.data.name, _id: user.mainGroup });
      } else if (user.grouplist.length > 0) {
        await axiosHandler.put(
          `/api/user/group/main/${user.grouplist[0]._id}/${user._id}`
        );
        setCurrentGroup({
          name: user.grouplist[0].name,
          _id: user.grouplist[0]._id,
        });
      }
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const changeGroup = async (groupId) => {
    try {
      const { data } = await axiosHandler.get(`/api/group/details/${groupId}`);
      setCurrentGroup({ name: data.name, _id: data._id });
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const getSeasonAndWeek = async () => {
    try {
      const { data } = await axiosHandler.get(
        '/api/nfldata/currentSeasonAndWeek'
      );
      setCurrentNFLTime({
        season: data.season,
        week: data.week,
        lockWeek: data.lockWeek,
      });
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const toggleSideBar = () => setShowSideBar(!showSideBar);

  const hardSetSideBar = (toggle) => setShowSideBar(toggle);

  return (
    <BrowserRouter>
      <CurrentUserContext.Provider
        value={{ currentUser, setCurrentUser, currentGroup }}
      >
        <NFLScheduleContext.Provider value={{ currentNFLTime }}>
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
                render={() => <Home group={currentGroup} />}
              />
              <Route path={Routes.adminPanel} render={() => <AdminPanel />} />
              <Route
                exact
                path={Routes.groupPage}
                render={() => <GroupPage pullUserData={pullUserData} />}
              />
              <Route path={Routes.signin} render={() => <SignInOut />} />
              <Route path={Routes.signup} render={() => <SignInOut />} />
              <Route
                path={Routes.userProfile}
                render={() => <UserProfile pullUserData={pullUserData} />}
              />
              <Route path={Routes.roster} render={() => <Roster />} />
              <Route path={Routes.usedPlayers} render={() => <UsedPlayers />} />
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
              <Route path={Routes.emailPref} render={() => <Unsubscribe />} />
              <Route render={() => <FourOFour />} />
            </Switch>
          </AvatarWrapper>
        </NFLScheduleContext.Provider>
      </CurrentUserContext.Provider>
    </BrowserRouter>
  );
};

export { CurrentUserContext, NFLScheduleContext };

export default withFirebase(App);
