import React, { Fragment, Component } from 'react';
import * as Routes from './constants/routes';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { withFirebase } from './componenets/Firebase';
import axios from 'axios';

import SignInOut from './componenets/SignInOut';
import NavBar from './componenets/NavBar/NavBar';
import Home from './componenets/Home';
import UserProfile from './componenets/UserProfile/UserProfile';
import SeasonLongScore from './componenets/SeasonLongScore';
import Roster from './componenets/Roster';
import AdminPanel from './componenets/AdminPanel';
import UpdateWeek from './componenets/AdminPanel/UpdateWeek';
import UpgradeToAdmin from './componenets/AdminPanel/UpgradeToAdmin';
import UsedPlayers from './componenets/UsedPlayers';
import CreateAllGroup from './componenets/GroupPage/CreateAllGroup';
import FourOFour from './componenets/404/FourOFour';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,
      currentUser: {},
      currentWeek: 0,
      currentSeason: ``,
      groupList: [],
      currentGroup: {},
      positionOrder: [],
    }

  };

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.setState({ authUser });
        this.isSignedIn(authUser.email);
      } else {
        this.setState({ authUser: null, currentUser: {} });
      }
    });
  }

  componentWillUnmount() {
    this.listener();
  };

  isSignedIn = async (email) => {
    const dbResponse = await axios.get(`/api/getUser/${email}`);
    const currentUser = {
      username: dbResponse.data.UN,
      userId: dbResponse.data._id,
      isAdmin: dbResponse.data.A,
    };
    const playerPositions = await axios.get(`/api/getPositionData`);

    this.setState({
      currentUser,
      groupList: dbResponse.data.GL,
      currentGroup: { N: dbResponse.data.GL[0].N, _id: dbResponse.data.GL[0]._id },
      positionOrder: playerPositions.data
    });
    this.getSeasonAndWeek();
  };

  getSeasonAndWeek = async () => {
    const seasonAndWeek = await axios.get(`/api/currentSeasonAndWeek`);
    this.setState({ currentSeason: seasonAndWeek.data.season, currentWeek: seasonAndWeek.data.week })
  };

  render() {

    return (

      <BrowserRouter>
        <Fragment>
          {this.state.authUser &&
            <NavBar
              authUser={this.state.authUser}
              groupId={this.state.currentGroup._id}
              userId={this.state.currentUser.userId}
            />
          }
          {/* <GroupBar
            groupList={this.state.groupList}
          /> */}
          <Switch>
            <Route
              exact path={Routes.home}
              render={() =>
                <Home
                  isAdmin={this.state.currentUser.isAdmin}
                  season={this.state.currentSeason}
                  group={this.state.currentGroup}
                  week={this.state.currentWeek}
                  positionOrder={this.state.positionOrder}
                />}
            />
            <Route
              path={Routes.adminPanel}
              render={() =>
                <AdminPanel
                  currentUser={this.state.currentUser}
                  week={this.state.currentWeek}
                  season={this.state.currentSeason}
                  groupId={this.state.currentGroup._id} />}
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
                <UserProfile />}
            />
            <Route
              path={Routes.seasonLongScore}
              render={() =>
                <SeasonLongScore
                  season={this.state.currentSeason} />}
            />
            <Route
              path={Routes.roster}
              render={props =>
                <Roster
                  {...props}
                  userId={this.state.currentUser.userId}
                  week={this.state.currentWeek}
                  season={this.state.currentSeason} />
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
                  username={this.state.currentUser.username}
                  season={this.state.currentSeason} />
              }
            />
            <Route
              path={Routes.createAllGroup}
              render={() =>
                <CreateAllGroup />}
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
        </Fragment>
      </BrowserRouter>
    );
  }
}

export default withFirebase(App);