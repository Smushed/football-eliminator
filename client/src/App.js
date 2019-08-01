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
import GetWeeklyData from './componenets/GetWeeklyData';
import DisplayPlayers from './componenets/DisplayPlayers';
import Roster from './componenets/Roster';
import CurrentTesting from './componenets/CurrentTesting';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,
      currentUser: {},
      currentWeek: 0
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
    const dbResponse = await axios.get(`/api/getuser/${email}`);
    const currentUser = {
      username: dbResponse.data.local.username,
      userId: dbResponse.data._id,
      grouplist: dbResponse.data.grouplist
    }
    this.setState({ currentUser })
  };

  //TODO WHY DID I DO THIS?
  //TODO Maybe just delete it?
  // getCurrentData = async () => {
  //   const currentWeek = await axios.get(`/api/currentWeekData`);
  //   this.setState({ currentWeek })
  // };

  render() {

    const { grouplist } = this.state.currentUser;

    return (

      <BrowserRouter>

        <div>

          <NavBar authUser={this.state.authUser} />
          {/* Routes to different components */}
          <Route
            exact path={Routes.home}
            render={() =>
              <Home userId={this.state.currentUser.userId} />} />
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
              <CreateGroup userID={this.state.currentUser.userID} />}
          />
          <Route
            path={`/group/:groupID`}
            render={() =>
              <GroupPage userID={this.state.currentUser.userID} />}
          />
          <Route
            path={`/user/:userID`}
            render={() =>
              <UserProfile userID={this.state.currentUser.userID} />}
          />
          <Route
            path={`/getWeeklyData/`}
            render={props =>
              <GetWeeklyData {...props} />}
          />
          <Route
            path={`/displayplayers`}
            render={() =>
              <DisplayPlayers />
            }
          />
          <Route
            path={`/currenttesting`}
            render={() =>
              <CurrentTesting />
            }
          />
          <Route
            path={Routes.roster}
            render={props =>
              <Roster {...props} userId={this.state.currentUser.userId} />
            }
          />
        </div>
      </BrowserRouter>
    );
  }
}

export default withFirebase(App);