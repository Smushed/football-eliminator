import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from './Firebase';
import * as Routes from '../constants/routes';
import { withAuthorization } from './Session';
import { Button } from 'reactstrap';

const inputStyle = {
    width: '50%',
    height: '40px'
}

const PasswordResetPage = () => (
    <div>
        {/* TODO This totally doesn't work */}
        <h3>Password Reset</h3>
        <br />
        <PasswordResetForm />
    </div>
);

const initialState = {
    email: '',
    error: null,
};

class PasswordResetFormBase extends Component {
    constructor(props) {
        super(props);

        this.state = { ...initialState };
    }

    onSubmit = event => {
        const { email } = this.state;

        this.props.firebase
            .doPasswordReset(email)
            .then(() => {
                this.setState({ ...initialState });
                this.props.history.push(Routes.home);
            })
            .catch(error => {
                this.setState({ error });
            });

        event.preventDefault();
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { email, error } = this.state;

        const isInvalid = email === '';

        return (
            <form className='form-horizontal'
                onSubmit={this.onSubmit}>
                {error && <p>{error.message}</p>}
                <div className='form-group'>
                    <input
                        className='form-input'
                        style={inputStyle}
                        name='email'
                        value={this.state.email}
                        onChange={this.onChange}
                        type='text'
                        placeholder='Email Address'
                    />
                </div>
                <div className="form-group ">
                    <div className="col-7"></div>
                    <button
                        className="btn btn-primary col-1 col-mr-auto"
                        disabled={isInvalid}
                        type="submit">Reset Password</button>
                </div>

            </form>
        );
    }
}

const PasswordResetLink = () => (
    <Link to={Routes.passwordReset}><Button color='success'>Forgot Password?</Button></Link>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(PasswordResetPage);

const PasswordResetForm = compose(withRouter, withFirebase)(PasswordResetFormBase);

export { PasswordResetForm, PasswordResetLink };