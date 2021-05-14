import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import PropTypes from 'prop-types';

import { withFirebase } from '../Firebase';
import * as Routes from '../../constants/routes';


const withAuthorization = condition => Component => {
    class WithAuthorization extends React.Component {
        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {
                    if (!condition(authUser)) {
                        this.props.history.push(Routes.signin);
                    }
                }
            )
        }

        componentWillUnmount() {
            this.listener()
        }

        render() {
            return (
                <Component {...this.props} />
            )
        }
    }

    WithAuthorization.propTypes = {
        firebase: PropTypes.any,
        history: PropTypes.any
    };

    return compose(withRouter, withFirebase)(WithAuthorization);
};

export default withAuthorization;