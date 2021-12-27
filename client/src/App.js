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
import Roster from './componenets/Roster';
import AdminPanel from './componenets/AdminPanel';
import UpdateWeek from './componenets/AdminPanel/UpdateWeek';
import UsedPlayers from './componenets/UsedPlayers';
import GroupPage from './componenets/GroupPage/';
import CreateGroup from './componenets/GroupPage/CreateGroup';
import FourOFour from './componenets/404';
import SidePanel from './componenets/SidePanel';
import EmailPref from './componenets/EmailPref';

const App = ({ firebase }) => {

  const [noGroup, updateNoGroup] = useState(false);
  const [authUser, updateAuthUser] = useState(null);
  const [currentUser, updateCurrentUser] = useState({});
  const [currentWeek, updateCurrentWeek] = useState(0);
  const [currentSeason, updateCurrentSeason] = useState(``);
  const [currentGroup, updateCurrentGroup] = useState({});
  const [showSideBar, updateShowSideBar] = useState(false);
  const [lockWeek, updateLockWeek] = useState(0);

  const listener = useRef(null);

  useEffect(() => {
    listener.current = firebase.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        updateAuthUser(authUser);
        pullUserData(authUser.email);
      } else {
        updateAuthUser(null);
        updateCurrentUser({});
      }
      return function cleanup() {
        listener();
      };
    });
  }, [firebase]);


  const pullUserData = (email) => {
    return new Promise(async res => {
      const dbResponse = await axios.get(`/api/user/email/${email}`);

      setCurrentUser(dbResponse.data);

      if (userHasGroup(dbResponse.data)) {
        initGroup(dbResponse.data);
      } else {
        updateNoGroup(true);
      }
      res();
    })
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
      axios.put(`/api/user/group/main/${user.GL[0]._id}/${user._id}`);
      updateCurrentGroup({ N: user.GL[0].N, _id: user.GL[0]._id });
    }
    getSeasonAndWeek();
  };

  const changeGroup = async (groupId) => {
    const res = await axios.get(`/api/group/details/${groupId}`);
    updateCurrentGroup({ N: res.data.N, _id: res.data._id });
  };

  const getSeasonAndWeek = async () => {
    const { data } = await axios.get(`/api/currentSeasonAndWeek`);
    updateCurrentSeason(data.season);
    updateCurrentWeek(data.week);
    updateLockWeek(data.lockWeek);
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
          <Switch>
            <Route
              exact path={Routes.home}
              render={() =>
                <Home
                  noGroup={noGroup}
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
                  groupId={currentGroup._id}
                />}
            />
            <Route
              exact
              path={Routes.groupPage}
              render={() =>
                <GroupPage
                  email={authUser && authUser.email}
                  pullUserData={pullUserData}
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
              render={() =>
                <Profile
                  pullUserData={pullUserData}
                  authUser={authUser}
                  currentUser={currentUser}
                />}
            />
            <Route
              path={Routes.roster}
              render={() =>
                <Roster
                  username={currentUser.username}
                  userId={currentUser.userId}
                  week={currentWeek}
                  season={currentSeason}
                  noGroup={noGroup}
                  appLevelLockWeek={lockWeek}
                  updateLockWeek={updateLockWeek}
                />
              }
            />
            <Route
              path={Routes.usedPlayers}
              render={props =>
                <UsedPlayers
                  {...props}
                  noGroup={noGroup}
                  season={currentSeason} />
              }
            />
            <Route
              path={Routes.updateWeek}
              render={() =>
                <UpdateWeek />}
            />
            <Route
              path={Routes.createGroup}
              render={() =>
                <CreateGroup
                  email={authUser && authUser.email}
                  pullUserData={pullUserData}
                  changeGroup={changeGroup}
                  userId={currentUser.userId}
                />
              }
            />
            <Route
              path={Routes.emailPref}
              render={props =>
                <EmailPref
                  {...props}
                />}
            />
            <Route
              render={() =>
                <FourOFour />
              } />
          </Switch>
        </ToastProvider>
      </Fragment>
    </BrowserRouter>
  );
}

App.propTypes = {
  firebase: PropTypes.any,
};

export default withFirebase(App);