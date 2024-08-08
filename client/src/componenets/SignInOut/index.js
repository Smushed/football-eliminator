import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../contexts/Firebase';
import * as Routes from '../../constants/routes';

import ElimLogo from '../../constants/elimLogos/LargeElimLogo.png';
import Stadium from '../../constants/elimLogos/stadium.jpg';

import {
  EmailInput,
  PasswordInput,
  UsernameInput,
  ConfirmPasswordInput,
} from '../Tools/ProfileInputs';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  axiosHandlerNoValidation,
  httpErrorHandler,
} from '../../utils/axiosHandler';

const Alert = withReactContent(Swal);

const SignInOut = () => {
  const [showSignIn, updateSignIn] = useState(true);
  const [showPassword, updateShowPassword] = useState(`password`);

  const switchView = () => {
    updateShowPassword(`password`);
    updateSignIn(!showSignIn);
  };

  const toggleShowPassword = () => {
    showPassword === `password`
      ? updateShowPassword(`text`)
      : updateShowPassword(`password`);
  };

  return (
    <div className='signInUpContainer'>
      <div className='loginForms'>
        <div className='row'>
          <div className='col-12 text-center'>
            <img
              className='signInOutLogo mt-5 mb-3'
              src={ElimLogo}
              alt={`Home`}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-12 text-center'>
            <div className='fs-4 fw-semibold signInHeader mb-4'>
              {showSignIn ? 'Sign In' : 'Sign Up'}
            </div>
          </div>
        </div>
        {showSignIn ? (
          <SignInForm
            showPassword={showPassword}
            toggleShowPassword={toggleShowPassword}
          />
        ) : (
          <SignUpForm
            showPassword={showPassword}
            toggleShowPassword={toggleShowPassword}
          />
        )}
        <SwitchSignInUp
          showSignIn={showSignIn}
          toggleShowPassword={toggleShowPassword}
          switchView={switchView}
        />
      </div>
      <img className='largeScreenImage' src={Stadium} alt='Football Stadium' />
    </div>
  );
};

const SwitchSignInUp = ({ showSignIn, switchView }) => (
  <div className='row'>
    <div className='col-12 text-center'>
      <div className='mt-5'>
        {showSignIn ? 'Need an account?' : 'Have an account?'}
      </div>
      <button className='btn btn-secondary' onClick={() => switchView()}>
        {showSignIn ? 'Sign Up' : 'Sign In'}
      </button>
    </div>
  </div>
);

const SignUpFormBase = ({
  history,
  firebase,
  showPassword,
  toggleShowPassword,
}) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [validMessage, setValidMessage] = useState([]);
  const [emailValid, setEmailValid] = useState(false);
  const [usernameValid, setUsernameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const [showConfirmPass, setShowConfirmPass] = useState('password');

  useEffect(() => {
    validateForm();
  }, [email, password, username, confirmPassword]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (checkValidInput()) {
      try {
        const { status } = await axiosHandlerNoValidation.post(
          '/api/user/newUser',
          {
            username,
            email,
          }
        );

        if (status === 200) {
          firebase
            .doCreateUserWithEmailAndPassword(email, password)
            .then(() => {
              history.push(Routes.home);
            })
            .catch((err) => {
              setError(err.message);
            });
        }
        return;
      } catch (err) {
        httpErrorHandler(err);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'username': {
        setUsername(value);
        break;
      }
      case 'email': {
        setEmail(value);
        break;
      }
      case 'password': {
        setPassword(value);
        break;
      }
      case 'confirmPassword': {
        setConfirmPassword(value);
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
      invalidMessages.push('Email entered is invalid');
    }
    if (!usernameValid) {
      invalidInputs++;
      invalidMessages.push(
        'Username must be at least 3 characters, no more than 16 and only contains letters, numbers, underscores and dashes'
      );
    }
    if (!passwordValid) {
      invalidInputs++;
      invalidMessages.push(
        'Password must match, be at least 6 characters in length and contain no spaces'
      );
    }
    if (invalidInputs > 0) {
      setValidMessage(invalidMessages);
      return false;
    } else {
      return true;
    }
  };

  const validateForm = () => {
    //Email
    const checkEmail = email.match(
      /^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    setEmailValid(checkEmail ? true : false);

    //Password
    const checkPassword = password.length >= 6;
    const noSpacesInPassword = password.match(/^\S*$/);
    const passwordsMatch = password === confirmPassword;
    const passwordCheck =
      checkPassword && noSpacesInPassword && passwordsMatch ? true : false;
    setPasswordValid(passwordCheck);

    //Username
    const checkUsername = username.match(/^([a-z0-9-_])+$/i);
    const usernameLength = username.length >= 3 && username.length <= 16;
    const usernameCheck = checkUsername && usernameLength ? true : false;
    setUsernameValid(usernameCheck);
  };

  const toggleShowConfirmPassword = () => {
    showConfirmPass === 'password'
      ? setShowConfirmPass('text')
      : setShowConfirmPass('password');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className='errorMessages'>
          {error}
          {validMessage.length > 0 &&
            validMessage.map((message, i) => <div key={i}>{message}</div>)}
        </div>
        <div className='row justify-content-center'>
          <div className='col-9'>
            <EmailInput handleChange={handleChange} email={email} />
            <UsernameInput handleChange={handleChange} username={username} />
            <PasswordInput
              handleChange={handleChange}
              toggleShowPassword={toggleShowPassword}
              password={password}
              showPassword={showPassword}
            />
            <ConfirmPasswordInput
              handleChange={handleChange}
              toggleShowPassword={toggleShowConfirmPassword}
              password={confirmPassword}
              showPassword={showConfirmPass}
            />
          </div>
        </div>
        <div className='mt-4 row'>
          <div className='col-12 text-center'>
            <button className='signInUpBtnWidth btn btn-success'>
              Sign Up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const SignInFormBase = ({
  history,
  firebase,
  showPassword,
  toggleShowPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [disableInputs, setDisableInputs] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'email': {
        setEmail(value);
        break;
      }
      case 'password': {
        setPassword(value);
        break;
      }
      default: {
        break;
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        history.push(Routes.home);
      })
      .catch((error) => {
        console.log({ error });
        switch (error.code) {
          case `auth/invalid-email`:
            setError(`Invalid Email Format`);
            break;
          case `auth/user-not-found`:
            setError(`Email Not Found`);
            break;
          case `auth/invalid-login-credentials`:
            setError(`Wrong Email / Password`);
            break;
          default:
            setError(`Error - Please Reload!`);
            break;
        }
      });
  };

  const forgotPassword = async () => {
    setDisableInputs(true);
    const { value: modalEmail } = await Alert.fire({
      title: 'Input Email Address',
      input: 'email',
      inputValue: email,
      inputPlaceholder: 'email@email.com',
    });
    setDisableInputs(false);
    if (!modalEmail) {
      return;
    } else {
      firebase
        .doPasswordReset(modalEmail)
        .then(() => {
          Alert.fire({
            title: 'Email Sent',
            text: `Password reset email sent to ${modalEmail}`,
          });
        })
        .catch(() =>
          Alert.fire({
            title: 'Error',
            text: 'Error sending password',
            icon: 'error',
          })
        );
    }
  };

  return (
    <div className='d-flex justify-content-center'>
      <div className='col-9'>
        <form onSubmit={handleSubmit}>
          <div className='text-center fw-bold'>{error}</div>
          <EmailInput
            handleChange={handleChange}
            email={email}
            disabled={disableInputs}
          />
          <PasswordInput
            handleChange={handleChange}
            toggleShowPassword={toggleShowPassword}
            password={password}
            showPassword={showPassword}
            disabled={disableInputs}
          />
          <div className='row'>
            <div className='mt-4 mb-1 row'>
              <div className='col-12 col-lg-6 text-center'>
                <button className='btn btn-success signInUpBtnWidth'>
                  Sign In
                </button>
              </div>
              <div className='col-12 col-lg-6 text-center'>
                <input
                  type='button'
                  className='btn btn-secondary'
                  onClick={forgotPassword}
                  value='Forgot Password?'
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const SignUpForm = withRouter(withFirebase(SignUpFormBase));
const SignInForm = withRouter(withFirebase(SignInFormBase));

export default SignInOut;
