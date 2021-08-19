import React, { Fragment, useEffect, useState, useRef, } from 'react';
import * as Routes from './constants/routes';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { withFirebase } from './componenets/Firebase';
import axios from 'axios';
import PropTypes from 'prop-types';
import { ToastProvider } from 'react-toast-notifications';

import SignInOut from './componenets/SignInOut';
import NavBar from './componenets/NavBar/';
import Home from './componenets/Home';
import Profile from './componenets/Profile';
import SeasonLongScore from './componenets/SeasonLongScore';
import Roster from './componenets/Roster';
import AdminPanel from './componenets/AdminPanel';
import UpdateWeek from './componenets/AdminPanel/UpdateWeek';
import UpgradeToAdmin from './componenets/AdminPanel/UpgradeToAdmin';
import UsedPlayers from './componenets/UsedPlayers';
import GroupPage from './componenets/GroupPage/';
import FourOFour from './componenets/404';
import SidePanel from './componenets/SidePanel';

const App = ({ firebase }) => {

  const [noGroup, updateNoGroup] = useState(false);
  const [authUser, updateAuthUser] = useState(null);
  const [currentUser, updateCurrentUser] = useState({});
  const [currentWeek, updateCurrentWeek] = useState(0);
  const [currentSeason, updateCurrentSeason] = useState(``);
  const [currentGroup, updateCurrentGroup] = useState({});
  const [showSideBar, updateShowSideBar] = useState(false);
  const [latestLockWeek, updateLockWeek] = useState(0);

  const listener = useRef(null);

  useEffect(() => {
    listener.current = firebase.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        updateAuthUser(authUser);
        isSignedIn(authUser.email);
      } else {
        updateAuthUser(null);
        updateCurrentUser({});
      }
      return function cleanup() {
        listener();
      };
    });
  }, [firebase]);

  const isSignedIn = async (email) => {
    const dbResponse = await axios.get(`/api/user/email/${email}`);

    setCurrentUser(dbResponse.data);

    if (userHasGroup(dbResponse.data)) {
      initGroup(dbResponse.data);
    } else {
      updateNoGroup(true);
    }
  };

  const setCurrentUser = (user) => {
    const currentUser = {
      username: user.UN,
      userId: user._id,
      isAdmin: user.A,
      GL: user.GL,
      MG: user.MG || null
    };
    updateCurrentUser(currentUser);
  };

  const initGroup = async (user) => {
    updateNoGroup(false);
    if (user.MG) {
      const res = await axios.get(`/api/group/details/${user.MG}`);
      updateCurrentGroup({ N: res.data.N, _id: user.MG });
    } else {
      axios.put(`/api/group/main/${user.GL[0]._id}/${user._id}`);
      updateCurrentUser({ ...currentUser, MG: user.GL[0]._id });
      updateCurrentGroup({ N: user.GL[0].N, _id: user.GL[0]._id });
    }
    getSeasonAndWeek();
  };

  const changeGroup = async (groupId) => {
    const res = await axios.get(`/api/group/details/${groupId}`);
    updateCurrentGroup({ N: res.data.N, _id: res.data._id });
  }

  const getSeasonAndWeek = async () => {
    const seasonAndWeek = await axios.get(`/api/currentSeasonAndWeek`);
    updateCurrentSeason(seasonAndWeek.data.season);
    updateCurrentWeek(seasonAndWeek.data.week);
    updateLockWeek(seasonAndWeek.data.lockWeek)
  };

  const updateLockWeekOnPull = (pulledLockWeek) => {
    updateLockWeek(pulledLockWeek);
  };

  const userHasGroup = (user) => (user.GL.length > 0);

  const showHideSideBar = () => updateShowSideBar(!showSideBar);

  const hardSetSideBar = (toggle) => updateShowSideBar(toggle);

  return (

    <BrowserRouter>
      <Fragment>
        <SidePanel
          showSideBar={showSideBar}
          noGroup={noGroup}
          currentGroup={currentGroup}
          user={currentUser}
          showHideSideBar={showHideSideBar}
          hardSetSideBar={hardSetSideBar}
          changeGroup={changeGroup}
        />
        {authUser &&
          <NavBar
            showHideSideBar={showHideSideBar}
          />
        }

        <ToastProvider>
          {noGroup ?
            <GroupPage
              season={currentSeason}
              noGroup={noGroup}
              userId={currentUser.userId}
            />
            :
            <Switch>
              <Route
                exact path={Routes.home}
                render={() =>
                  <Home
                    season={currentSeason}
                    group={currentGroup}
                    week={currentWeek}
                    currentUser={currentUser}
                  />}
              />
              <Route
                path={Routes.adminPanel}
                render={() =>
                  <AdminPanel
                    currentUser={currentUser}
                    week={currentWeek}
                    season={currentSeason}
                    groupId={currentGroup._id} />}
              />
              <Route
                path={Routes.groupPage}
                render={() =>
                  <GroupPage
                    season={currentSeason}
                    noGroup={noGroup}
                    userId={currentUser.userId}
                  />}
              />
              <Route
                path={Routes.signin}
                render={() =>
                  <SignInOut />}
              />
              <Route
                path={Routes.signup}
                render={() =>
                  <SignInOut />}
              />
              <Route
                path={Routes.profile}
                render={props =>
                  <Profile
                    {...props}
                    authUser={authUser}
                    currentUser={currentUser} />}
              />
              <Route
                path={Routes.seasonLongScore}
                render={() =>
                  <SeasonLongScore
                    season={currentSeason} />}
              />
              <Route
                path={Routes.roster}
                render={props =>
                  <Roster
                    {...props}
                    latestLockWeek={latestLockWeek}
                    updateLockWeekOnPull={updateLockWeekOnPull}
                    username={currentUser.username}
                    userId={currentUser.userId}
                    week={currentWeek}
                    season={currentSeason} />
                }
              />
              <Route
                path={Routes.upgradeToAdmin}
                render={() =>
                  <UpgradeToAdmin />}
              />
              <Route
                path={Routes.usedPlayers}
                render={props =>
                  <UsedPlayers
                    {...props}  //Need to pass down the props spread to have access to the URL
                    season={currentSeason} />
                }
              />
              <Route
                path={Routes.updateWeek}
                render={() =>
                  <UpdateWeek />}
              />
              <Route
                render={() =>
                  <FourOFour />
                } />
            </Switch>
          }
        </ToastProvider>
      </Fragment>
    </BrowserRouter>
  );
}

App.propTypes = {
  firebase: PropTypes.any
};

export default withFirebase(App);