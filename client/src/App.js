import React, { Component } from 'react';
import * as Routes from './constants/routes';
import { Route, BrowserRouter } from 'react-router-dom';
import { withFirebase } from './componenets/Firebase';
import axios from 'axios';

// Components
import SignUpPage from './componenets/SignUp';
import SignInPage from './componenets/SignIn';
import NavBar from './componenets/NavBar';
import Home from './componenets/Home';
import PasswordReset from './componenets/PasswordReset';
import PasswordChange from './componenets/PasswordChange';
import UserProfile from './componenets/UserProfile';
import CreateGroup from './componenets/CreateGroup';
import GroupPage from './componenets/GroupPage';
import DisplayPlayers from './componenets/DisplayPlayers';
import Roster from './componenets/Roster';
import AdminPanel from './componenets/AdminPanel';
import UpgradeToAdmin from './componenets/AdminPanel/UpgradeToAdmin';
import UsedPlayers from './componenets/UsedPlayers';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,
      currentUser: {},
      currentWeek: 0,
      currentSeason: ``
    }

  };

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.setState({ authUser });
        // this.isSignedIn(authUser.email);
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
      username: dbResponse.data.local.username,
      userId: dbResponse.data._id,
      isAdmin: dbResponse.data.isAdmin
    }
    this.setState({ currentUser });
    this.getSeasonAndWeek();
  };

  getSeasonAndWeek = async () => {
    const seasonAndWeek = await axios.get(`/api/currentSeasonAndWeek`);
    this.setState({ currentSeason: seasonAndWeek.data.season, currentWeek: seasonAndWeek.data.week })
  };

  render() {

    return (

      <BrowserRouter>

        <div>
          <NavBar authUser={this.state.authUser} />
          {/* Routes to different components */}
          <Route
            exact path={Routes.home}
            render={() =>
              <Home
                userId={this.state.currentUser.userId}
                isAdmin={this.state.currentUser.isAdmin}
                week={this.state.currentWeek}
                season={this.state.currentSeason} />} />
          <Route
            path={Routes.adminPanel}
            render={() =>
              <AdminPanel
                week={this.state.currentWeek}
                season={this.state.currentSeason} />}
          />
          <Route
            path={Routes.signin}
            render={() =>
              <SignInPage />}
          />
          <Route
            path={Routes.signup}
            render={() =>
              <SignUpPage />}
          />
          <Route
            path={Routes.passwordReset}
            render={() =>
              <PasswordReset />}
          />
          <Route
            path={Routes.passwordChange}
            render={() =>
              <PasswordChange />}
          />
          <Route
            path={Routes.userProfile}
            render={() =>
              <UserProfile />}
          />
          <Route
            path={Routes.createGroup}
            render={() =>
              <CreateGroup
                userID={this.state.currentUser.userID} />}
          />
          <Route
            path={`/group/:groupID`}
            render={() =>
              <GroupPage
                userID={this.state.currentUser.userID} />}
          />
          <Route
            path={`/displayplayers`}
            render={() =>
              <DisplayPlayers />
            }
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
                season={this.state.currentSeason}
                week={this.state.currentWeek} />
            }
          />
        </div>
      </BrowserRouter>
    );
  }
}

export default withFirebase(App);