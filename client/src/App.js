import React, { Component } from 'react';
import * as Routes from './constants/routes';
import { Route, BrowserRouter } from 'react-router-dom';
import { withFirebase } from './componenets/Firebase';
import axios from 'axios';

//background


// Components
import SignUpPage from './componenets/SignUp';
import SignInPage from './componenets/SignIn';
import NavBar from './componenets/NavBar';
// import Example from './componenets/SideNav'
import Home from './componenets/Home';
import PasswordReset from './componenets/PasswordReset';
import PasswordChange from './componenets/PasswordChange';
import UserProfile from './componenets/UserProfile'
import CreateGroup from './componenets/CreateGroup';
import GroupPage from './componenets/GroupPage';
import TestRoster from './componenets/TestRoster';
import TestGameData from './componenets/TestGameData'

//adding a comment hoping it will help merge on github
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null,
      currentUser: {}
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
      userID: dbResponse.data._id,
      grouplist: dbResponse.data.grouplist
    }
    this.setState({ currentUser })
  }


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
              <Home grouplist={grouplist} />} />
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
            path={`/testroster`}
            render={() =>
              <TestRoster />
            }
          />
          <Route
            path={`/testgamedata`}
            render={() =>
              <TestGameData />
            }
          />
        </div>
      </BrowserRouter>
    );
  }
}

export default withFirebase(App);