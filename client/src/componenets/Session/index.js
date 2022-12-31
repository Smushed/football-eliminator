import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

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

  WithAuthorization.propTypes = {
    firebase: PropTypes.any,
    history: PropTypes.any,
  };

  return withRouter(withFirebase(WithAuthorization));
};

export default Session;
