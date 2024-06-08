import React from 'react';
import { withRouter } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as Routes from '../../constants/routes';

const Session = (Component) => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        (authUser) => {
          if (!authUser) {
            this.props.history.push(Routes.signin);
          }
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return <Component {...this.props} />;
    }
  }

  return withRouter(withFirebase(WithAuthorization));
};

export default Session;
