import React, { Fragment, useEffect, useState } from 'react';
import * as Routes from './constants/routes';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { withFirebase } from './componenets/Firebase';
import axios from 'axios';

import SignInOut from './componenets/SignInOut';
import NavBar from './componenets/NavBar/';
import Home from './componenets/Home';
import UserProfile from './componenets/UserProfile';
import SeasonLongScore from './componenets/SeasonLongScore';
import Roster from './componenets/Roster';
import AdminPanel from './componenets/AdminPanel';
import UpdateWeek from './componenets/AdminPanel/UpdateWeek';
import UpgradeToAdmin from './componenets/AdminPanel/UpgradeToAdmin';
import UsedPlayers from './componenets/UsedPlayers';
import GroupPage from './componenets/GroupPage/';
import FourOFour from './componenets/404/FourOFour';
import SidePanel from './componenets/SidePanel';


const App = ({ firebase }) => {

  const [noGroup, updateNoGroup] = useState(false);
  const [authUser, updateAuthUser] = useState(null);
  const [currentUser, updateCurrentUser] = useState({});
  const [currentWeek, updateCurrentWeek] = useState(1);
  const [currentSeason, updateCurrentSeason] = useState(``);
  const [groupList, updateGroupList] = useState([]);
  const [currentGroup, updateCurrentGroup] = useState({});
  const [positionOrder, updatePositionOrder] = useState([]);
  const [showSideBar, updateShowSideBar] = useState(false);
  const [latestLockWeek, updateLockWeek] = useState(0);

  let listener;

  useEffect(() => {
    listener = firebase.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        updateAuthUser(authUser);
        isSignedIn(authUser.email);
      } else {
        updateAuthUser(null);
        updateCurrentUser({});
      };
      return function cleanup() {
        listener();
      };
    });
  }, [firebase]);

  const isSignedIn = async (email) => {
    const dbResponse = await axios.get(`/api/getUser/${email}`);

    setCurrentUser(dbResponse.data)

    if (userHasGroup(dbResponse.data)) {
      getGroupAndPositions(dbResponse.data);
    } else {
      updateNoGroup(true);
    };
  };

  const setCurrentUser = (user) => {
    const currentUser = {
      username: user.UN,
      userId: user._id,
      isAdmin: user.A,
      FT: user.FT
    };
    updateCurrentUser(currentUser);
  }

  const getGroupAndPositions = async (user) => {
    updateNoGroup(false);
    updateGroupList(user.GL);
    updateCurrentGroup({ N: user.GL[0].N, _id: user.GL[0]._id });

    const playerPositions = await axios.get(`/api/getPositionData`);
    updatePositionOrder(playerPositions.data)

    getSeasonAndWeek();
  };

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
          groupname={currentGroup.N}
          username={currentUser.username}
          showHideSideBar={showHideSideBar}
          hardSetSideBar={hardSetSideBar}
        />
        {authUser &&
          <NavBar
            showHideSideBar={showHideSideBar}
          />
        }

        {noGroup ?
          <GroupPage
            noGroup={noGroup}
            userId={currentUser.userId}
          />
          :
          <Switch>
            <Route
              exact path={Routes.home}
              render={() =>
                <Home
                  isAdmin={currentUser.isAdmin}
                  season={currentSeason}
                  group={currentGroup}
                  week={currentWeek}
                  positionOrder={positionOrder}
                  username={currentUser.username}
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
                <GroupPage />}
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
              path={Routes.userProfile}
              render={() =>
                <UserProfile
                  authUser={authUser}
                  currentUser={currentUser}
                  groupList={groupList} />}
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
      </Fragment>
    </BrowserRouter>
  );
}

export default withFirebase(App);