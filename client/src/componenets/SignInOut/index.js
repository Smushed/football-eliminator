import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import * as Routes from '../../constants/routes';
import axios from 'axios';

import './signInOutStyle.css';
import ElimLogo from './EliminatorSignInLogo.png';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);


class SignInOut extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showSignIn: true,
        };
    };
    switchView = () => {
        console.log(this.state)
        this.setState({ showSignIn: !this.state.showSignIn });
    };

    render() {
        return (

            <div className='signInUpContainer'>
                <div className='logoContainer'>
                    <img className='signInOutLogo' src={ElimLogo} alt={`Home`} />
                </div>
                {this.state.showSignIn ?
                    <SignInForm switchView={this.switchView} />
                    :
                    <SignUpForm switchView={this.switchView} />
                }
            </div>
        );
    };
};

const signUpState = {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    redirectTo: null,
    error: null,
    emailValid: false,
    passwordValid: false,
    usernameValid: false,
    validMessage: []
};

class SignUpFormBase extends Component {
    constructor(props) {
        super(props)
        this.state = {
            signUpState
        };
    };

    handleSubmit = async event => {
        event.preventDefault();

        //Checks if all the input fields are valid
        //If not the validation messages are shown and no user is sent to sign up
        if (this.checkValidInput()) {
            const { username, email, password } = this.state;

            const dbResponse = await axios.post(`/api/newUser`, { username, email });

            if (dbResponse.status === 200) {
                return this.props.firebase
                    .doCreateUserWithEmailAndPassword(email, password)
                    .then(authUser => {
                        //The User has been successfully authenticated, clear this component state and redirect them to the home page
                        this.setState({ ...signUpState });
                        this.props.history.push(Routes.home);
                    })
                    .catch(error => {
                        console.log(error)
                        this.setState({ error });
                    });
            };
        };
    };

    handleChange = event => {
        //Breaking this out due to the input validation
        const name = event.target.name;
        const value = event.target.value;

        this.setState({ [event.target.name]: event.target.value },
            () => this.validateForm(name, value));

    };

    checkValidInput = () => {
        let invalidInputs = 0;
        let invalidMessages = [];
        if (!this.state.emailValid) {
            invalidInputs++;
            invalidMessages.push(`Email entered is invalid`);
        };
        if (!this.state.usernameValid) {
            invalidInputs++;
            invalidMessages.push(`Please ensure username is at least 3 characters, no more than 16 and only contains letters, numbers, underscores and dashes`);
        };
        if (!this.state.passwordValid) {
            invalidInputs++;
            invalidMessages.push(`Password must be at least 6 characters in length and contain no spaces`)
        };
        if (invalidInputs > 0) {
            this.setState({ validMessage: invalidMessages });
            return false;
        } else {
            return true;
        };
    };

    validateForm = (fieldName, value) => {
        let validCheck;

        switch (fieldName) {
            case `email`:
                let checkEmail = value.match(/^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                validCheck = checkEmail ? true : false;
                this.setState({ emailValid: validCheck });
                break;
            case `password`:
                let checkPassword = value.length >= 6;
                let noSpacesInPassword = value.match(/^\S*$/);
                validCheck = checkPassword && noSpacesInPassword ? true : false;
                this.setState({ passwordValid: validCheck });
                break;
            case `username`:
                let checkUsername = value.match(/^([a-z0-9-_])+$/i);
                let usernameLength = value.length >= 3 && value.length <= 16;
                validCheck = checkUsername && usernameLength ? true : false;
                this.setState({ usernameValid: validCheck });
                break;
            default:
                break;
        };
    };

    render() {
        return (
            <div className='formContainer'>
                <div className='switchViewContainer'>
                    <div className='fullWidth'>
                        Have an account?
                    </div>
                    <button className='btn btn-info switchView' onClick={() => this.props.switchView()}>
                        Sign In
                    </button>
                </div>
                <div className='signInUpWrapper' >
                    <form onSubmit={this.handleSubmit}>
                        <div className='signInHeader'>
                            Sign Up
                        </div>
                        <div className='errorMessages'>
                            {this.state.error}
                        </div>
                        <div className='labelContainer'>
                            <label className='signInOutLabel'>Email:</label>
                        </div>
                        <div className='inputContainer'>
                            <input className='signInOutInput' name='email' type='text' placeholder='ex. janedoe@gmail.com' value={this.state.email} onChange={this.handleChange} />
                        </div>
                        <div className='labelContainer'>
                            <label className='signInOutLabel'>Username:</label>
                        </div>
                        <div className='labelDescriptor'>
                            (Between 3 & 16 characters, no special characters & no spaces)
                            </div>
                        <div className='inputContainer'>
                            <input className='signInOutInput' name='username' type='text' placeholder='ex. JaneDoe14' value={this.state.username} onChange={this.handleChange} />
                        </div>
                        <div className='labelContainer'>
                            <label className='signInOutLabel'>Password:</label>
                        </div>
                        <div className='labelDescriptor'>
                            (Must be at least 6 characters with no spaces)
                            </div>
                        <div className='inputContainer'>
                            <input className='signInOutInput' name='password' type='password' placeholder='Password' value={this.state.password} onChange={this.handleChange} />
                        </div>
                        <div className='labelContainer'>
                            <label className='signInOutLabel'>Confirm Password:</label>
                        </div>
                        <div className='inputContainer'>
                            <input className='signInOutInput' name='confirmPassword' type='password' placeholder='Confirm Password' value={this.state.confirmPassword} onChange={this.handleChange} />
                        </div>
                        <div className='inputContainer buttonContainer'>
                            <button className='signInUpBtn btn btn-success'>Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    };
};

class SignInFormBase extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            error: null
        };
    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleSubmit = event => {
        event.preventDefault();
        const { email, password } = this.state;
        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.props.history.push(Routes.home);
            })
            .catch(error => {
                console.log(error)
                switch (error.code) {
                    case 'auth/invalid-email':
                        this.setState({ error: 'Invalid Email Format' });
                        break;
                    case 'auth/user-not-found':
                        this.setState({ error: 'Email Not Found' });
                        break;
                    case 'auth/wrong-password':
                        this.setState({ error: 'Wrong Email / Password' })
                        break;
                    default:
                        this.setState({ error: 'Error - Please Reload!' });
                        break;
                }
            });
    };

    forgotPassword = async () => {
        const { value: email } = await Alert.fire({
            title: 'Input Email Address',
            input: 'email',
            inputValue: this.state.email,
            inputPlaceholder: 'email@email.com'
        });
        if (!email) {
            return;
        } else {
            this.props.firebase.doPasswordReset(email)
                .then(() => Alert.fire(`Password reset email sent to ${email}`));
        };
    };
    render() {
        return (
            <div className='formContainer'>
                <div className='signInUpWrapper' >
                    <form onSubmit={this.handleSubmit}>
                        <div className='signInHeader'>
                            Sign In
                        </div>
                        <div className='errorMessages'>
                            {this.state.error}
                        </div>
                        <div className='labelContainer'>
                            <label className='signInOutLabel'>Email:</label>
                        </div>
                        <div className='inputContainer'>
                            <input className='signInOutInput' name='email' type='text' placeholder='email' value={this.state.email} onChange={this.handleChange} />
                        </div>
                        <div className='labelContainer'>
                            <label className='signInOutLabel'>Password:</label>
                        </div>
                        <div className='inputContainer'>
                            <input className='signInOutInput' name='password' type='password' placeholder='password' value={this.state.password} onChange={this.handleChange} />
                        </div>
                        <div className='inputContainer buttonContainer'>
                            <button className='signInUpBtn btn btn-success'>Sign In</button>
                            <input type='button' className='forgotPassBtn btn btn-secondary' onClick={this.forgotPassword} value='Forgot Password?' />
                        </div>
                    </form>
                </div>
                <div className='switchViewContainer'>
                    <div className='fullWidth'>
                        Need an account?
                    </div>
                    <button className='btn btn-info switchView' onClick={() => this.props.switchView()}>
                        Sign Up
                    </button>
                </div>
            </div>
        );
    }
}




const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase);
const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);


export default SignInOut;
