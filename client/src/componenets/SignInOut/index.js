import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import * as Routes from '../../constants/routes';
import axios from 'axios';
import PropTypes from 'prop-types';

import './signInOutStyle.css';
import ElimLogo from '../../constants/elimLogos/LargeElimLogo.png';
import Stadium from '../../constants/elimLogos/stadium.jpg';

import { EmailInput, PasswordInput, UsernameInput, ConfirmPasswordInput } from '../Profile/ProfileInputs';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Alert = withReactContent(Swal);

const SignInOut = () => {

    const [showSignIn, updateSignIn] = useState(false);
    const [showPassword, updateShowPassword] = useState(`password`);

    const switchView = () => {
        updateShowPassword(`password`);
        updateSignIn(!showSignIn);
    };

    const toggleShowPassword = () => {
        showPassword === `password` ? updateShowPassword(`text`) : updateShowPassword(`password`);
    };

    return (
        <div className='signInUpContainer'>
            <div className='loginFormContainer loginForms'>
                <img className='signInOutLogo' src={ElimLogo} alt={`Home`} />
                <div className='signInHeader'>
                    {showSignIn ? 'Sign In' : 'Sign Up'}
                </div>
                {showSignIn ?
                    <SignInForm
                        switchView={switchView}
                        showPassword={showPassword}
                        toggleShowPassword={toggleShowPassword}
                    />
                    :
                    <SignUpForm
                        switchView={switchView}
                        showPassword={showPassword}
                        toggleShowPassword={toggleShowPassword}
                    />
                }
                <SwitchSignInUp
                    showSignIn={showSignIn}
                    toggleShowPassword={toggleShowPassword}
                    switchView={switchView}
                />
            </div>

            <img src={Stadium} alt='Football Stadium' />
        </div>
    );
}

const SwitchSignInUp = ({ showSignIn, switchView }) =>
    <div>
        <div className='switchViewHeader'>
            {showSignIn ? 'Need an account?' : 'Have an account?'}
        </div>
        <button className='btn switchViewBtn' onClick={() => switchView()}>
            {showSignIn ? 'Sign Up' : 'Sign In'}
        </button>
    </div>

const SignUpFormBase = ({ history, firebase, switchView, showPassword, toggleShowPassword }) => {

    const [email, updateEmail] = useState(``);
    const [username, updateUsername] = useState(``);
    const [password, updatePassword] = useState(``);
    const [confirmPassword, updateConfirmPassword] = useState(``);
    const [error, updateError] = useState(``);

    const [validMessage, updateValidMessage] = useState([]);
    const [emailValid, updateEmailValid] = useState(false);
    const [usernameValid, updateUsernameValid] = useState(false);
    const [passwordValid, updatePasswordValid] = useState(false);

    const [showConfirmPass, updateShowConfirmPass] = useState(`password`);


    useEffect(() => {
        validateForm();
    }, [email, password, username, confirmPassword]);

    const handleSubmit = async event => {
        event.preventDefault();

        //Checks if all the input fields are valid
        //If not the validation messages are shown and no user is sent to sign up
        if (checkValidInput()) {

            const dbResponse = await axios.post(`/api/newUser`, { username, email });

            if (dbResponse.status === 200) {
                return firebase
                    .doCreateUserWithEmailAndPassword(email, password)
                    .then(() => {
                        //The User has been successfully authenticated, clear this component state and redirect them to the home page
                        history.push(Routes.home);
                    })
                    .catch(err => {
                        console.log(err)
                        updateError(err);
                    });
            }
        }
    };

    const handleChange = e => {
        const { name, value } = e.target;
        switch (name) {
            case `username`: {
                updateUsername(value);
                break;
            }
            case `email`: {
                updateEmail(value);
                break;
            }
            case `password`: {
                updatePassword(value);
                break;
            }
            case `confirmPassword`: {
                updateConfirmPassword(value);
                break;
            }
            default: {
                break;
            }
        }
    };

    const checkValidInput = () => {
        let invalidInputs = 0;
        let invalidMessages = [];
        if (!emailValid) {
            invalidInputs++;
            invalidMessages.push(`Email entered is invalid`);
        }
        if (!usernameValid) {
            invalidInputs++;
            invalidMessages.push(`Username must be at least 3 characters, no more than 16 and only contains letters, numbers, underscores and dashes`);
        }
        if (!passwordValid) {
            invalidInputs++;
            invalidMessages.push(`Password must match, be at least 6 characters in length and contain no spaces`)
        }
        if (invalidInputs > 0) {
            updateValidMessage(invalidMessages);
            return false;
        } else {
            return true;
        }
    };

    const validateForm = () => {
        //Email
        const checkEmail = email.match(/^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        const emailCheck = checkEmail ? true : false;
        updateEmailValid(emailCheck);

        //Password
        const checkPassword = password.length >= 6;
        const noSpacesInPassword = password.match(/^\S*$/);
        const passwordsMatch = (password === confirmPassword);
        const passwordCheck = (checkPassword && noSpacesInPassword && passwordsMatch) ? true : false;
        updatePasswordValid(passwordCheck);

        //Username
        const checkUsername = username.match(/^([a-z0-9-_])+$/i);
        const usernameLength = username.length >= 3 && username.length <= 16;
        const usernameCheck = checkUsername && usernameLength ? true : false;
        updateUsernameValid(usernameCheck);
    };

    const toggleShowConfirmPassword = () => {
        showConfirmPass === `password` ? updateShowConfirmPass(`text`) : updateShowConfirmPass(`password`);
    };

    return (
        <div>
            <div className='signInUpWrapper signInFormContainer' >
                <form onSubmit={handleSubmit}>
                    <div className='errorMessages'>
                        {error}
                        {validMessage.length > 0 && validMessage.map((message, i) => <div key={i}>{message}</div>)}
                    </div>
                    <EmailInput
                        authUser={false}
                        handleChange={handleChange}
                        email={email}
                        modalOpen={false}
                    />
                    <UsernameInput
                        handleChange={handleChange}
                        username={username}
                        currentUser={null}
                        modalOpen={false}
                    />
                    <PasswordInput
                        handleChange={handleChange}
                        toggleShowPassword={toggleShowPassword}
                        password={password}
                        showPassword={showPassword}
                        modalOpen={false}
                    />
                    <ConfirmPasswordInput
                        handleChange={handleChange}
                        toggleShowPassword={toggleShowConfirmPassword}
                        password={confirmPassword}
                        showPassword={showConfirmPass}
                        modalOpen={false}
                    />
                    <div className='inputContainer signInButtonContainer'>
                        <button className='signInUpBtn btn signInUpBtnColor'>Sign Up</button>
                    </div>
                </form>
            </div>
            <div className='switchViewContainer smallScreenSignIn'>
                <div className='fullWidth'>
                    Have an account?
                </div>
                <button className='btn btn-info switchView' onClick={() => switchView()}>
                    Sign In
                </button>
            </div>
        </div >
    )
}

const SignInFormBase = ({ history, firebase, showPassword, toggleShowPassword }) => {

    const [email, updateEmail] = useState(``);
    const [password, updatePassword] = useState(``);
    const [error, updateError] = useState(``);

    const handleChange = e => {
        const { name, value } = e.target;
        switch (name) {
            case `email`: {
                updateEmail(value);
                break;
            }
            case `password`: {
                updatePassword(value);
                break;
            }
            default: {
                break;
            }
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                history.push(Routes.home);
            })
            .catch(error => {
                console.log(error)
                switch (error.code) {
                    case `auth/invalid-email`:
                        updateError(`Invalid Email Format`);
                        break;
                    case `auth/user-not-found`:
                        updateError(`Email Not Found`);
                        break;
                    case `auth/wrong-password`:
                        updateError(`Wrong Email / Password`);
                        break;
                    default:
                        updateError(`Error - Please Reload!`);
                        break;
                }
            });
    };

    const forgotPassword = async () => {
        const { value: email } = await Alert.fire({
            title: 'Input Email Address',
            input: 'email',
            inputValue: this.state.email,
            inputPlaceholder: 'email@email.com'
        });
        if (!email) {
            return;
        } else {
            firebase.doPasswordReset(email)
                .then(() => Alert.fire(`Password reset email sent to ${email}`));
        }
    };

    return (
        <div className='signInFormContainer'>
            <form onSubmit={handleSubmit}>

                <div className='errorMessages'>
                    {error}
                </div>
                <EmailInput
                    authUser={false}
                    handleChange={handleChange}
                    email={email}
                    modalOpen={false}
                />
                <PasswordInput
                    handleChange={handleChange}
                    toggleShowPassword={toggleShowPassword}
                    password={password}
                    showPassword={showPassword}
                    modalOpen={false}
                />
                <div className='inputContainer signInButtonContainer'>
                    <button className='signInUpBtn btn signInUpBtnColor'>Sign In</button>
                    <input type='button' className='forgotPassBtn btn' onClick={forgotPassword} value='Forgot Password?' />
                </div>
            </form>
        </div>
    );
}

SignInFormBase.propTypes = {
    firebase: PropTypes.any,
    history: PropTypes.any,
    switchView: PropTypes.func,
    showPassword: PropTypes.string,
    toggleShowPassword: PropTypes.func
};

SignUpFormBase.propTypes = {
    firebase: PropTypes.any,
    history: PropTypes.any,
    switchView: PropTypes.func,
    showPassword: PropTypes.string,
    toggleShowPassword: PropTypes.func
};

SwitchSignInUp.propTypes = {
    switchView: PropTypes.func,
    showSignIn: PropTypes.bool
};

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase);
const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);


export default SignInOut;
