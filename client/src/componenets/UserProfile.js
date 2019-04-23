import React, { Component, Fragment } from 'react';
import { withAuthorization } from './Session';
import PasswordChangeForm from './PasswordChange';
import axios from 'axios';
import { Button, Label, Input, } from "reactstrap";

const inputStyle = {
    width: '35%',
    height: '40px',
    fontSize: '16px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '10px'
};

const labelStyle = {
    marginBottom: '0px'
};

const buttonStyle = {
    marginBottom: '25px'
};

const centerText = {
    textAlign: 'center'
};

const updateProfileStyle = {
    fontSize: '20px'
};

const header = {
    marginTop: '25px',
}

const profileDisplayStyle = {
    fontSize: '16px'
};

const initialUpdateState = {
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    emailValid: false,
    usernameValid: false,
    validMessage: ''
};

const initialProfileState = {
    dbUsername: '',
    dbEmail: '',
    dbFirstname: '',
    dbLastname: '',
    isCurrentUser: false
};

class UserProfile extends Component {
    constructor(props) {
        super(props)

        //Listed twice as to not change the info on the profile when they begin updating it
        this.state = { ...initialProfileState };
    };

    componentDidMount() {
        const userID = this.props.match.params.userID;
        this.getUserData(userID);
        this.checkCurrentUser(userID);
    };

    componentDidUpdate(prevProps) {
        if (this.props.match.params.userID !== prevProps.match.params.userID || this.props.userID !== prevProps.userID) {
            const userID = this.props.match.params.userID;
            this.getUserData(userID);
            this.checkCurrentUser(userID);
        };
    };

    checkCurrentUser = (userIDFromURL) => {
        if (this.props.userID === userIDFromURL) {
            this.setState({
                isCurrentUser: true
            })
        };
    };

    updatedProfile = () => {
        this.getUserData(this.props.match.params.userID);
    };

    getUserData = async (userID) => {
        const dbResponse = await axios.get(`/api/getuserbyid/${userID}`);
        if (dbResponse.status === 200) {
            this.setState({
                dbUsername: dbResponse.data.local.username,
                dbEmail: dbResponse.data.local.email,
                dbFirstname: dbResponse.data.local.firstname,
                dbLastname: dbResponse.data.local.lastname,
            });
        };
    };

    render() {
        const { isCurrentUser, dbUsername, dbEmail, dbFirstname, dbLastname } = this.state;

        return (
            <div style={centerText}>
                <h1 style={header}>{dbUsername}'s Profile</h1>
                <div style={profileDisplayStyle}>Username: {dbUsername}</div>
                <div style={profileDisplayStyle}>Email: {dbEmail}</div>
                <div style={profileDisplayStyle}>Firstname: {dbFirstname}</div>
                <div style={profileDisplayStyle}>Lastname: {dbLastname}</div>

                {/* If the user is the current user logged in they can update their profile here */}
                {isCurrentUser &&
                    <Fragment>
                        <UpdateInformationForm userID={this.props.userID} updatedProfile={this.updatedProfile} />
                        <br />
                        <PasswordChangeForm />
                    </Fragment>
                }
            </div>
        );
    };
};

class UpdateInformationForm extends Component {
    constructor(props) {
        super(props)

        this.state = { ...initialUpdateState };
    };

    handleSubmit = async (fieldSubmitted) => {

        if (this.checkValidInput(fieldSubmitted)) {
            const value = this.state[fieldSubmitted];
            const userID = this.props.userID;
            const request = fieldSubmitted;

            const dbResponse = await axios.put(`/api/updateuser`, { userID, value, request });

            if (dbResponse.status === 200) {
                this.props.updatedProfile();
                this.setState({ ...initialUpdateState });
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

    validateForm = (fieldName, value) => {
        let validCheck;

        switch (fieldName) {
            case `email`:
                let checkEmail = value.match(/^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                validCheck = checkEmail ? true : false;
                this.setState({ emailValid: validCheck });
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

    checkValidInput = (fieldSubmitted) => {
        if (fieldSubmitted === 'email' && !this.state.emailValid) {
            this.setState({ validMessage: `Email entered is invalid` });
            return false;
        };

        if (fieldSubmitted === 'username' && !this.state.usernameValid) {
            this.setState({ validMessage: `Please ensure username is between 3 & 16 characters & it only contains letters, numbers, underscores & dashes` });
            return false;
        };

        return true;
    };

    render() {
        const { username, email, firstname, lastname, validMessage } = this.state;

        const usernameIsInvalid = username === '';
        const emailIsInvalid = email === '';
        const firstnameIsInvalid = firstname === '';
        const lastnameIsInvalid = lastname === '';

        return (
            <div style={updateProfileStyle}>
                {validMessage && <p>{validMessage}</p>}
                <br />
                <Label style={labelStyle}>
                    Username:
                </Label>
                <Input
                    style={inputStyle}
                    type='text'
                    name='username'
                    placeholder='Update Username'
                    value={username}
                    onChange={this.handleChange} />
                <Button
                    color='primary'
                    style={buttonStyle}
                    disabled={usernameIsInvalid}
                    onClick={() => this.handleSubmit('username')}>
                    Update Username
                </Button>

                <br />

                <Label style={labelStyle}>
                    Email:
                </Label>
                <Input
                    style={inputStyle}
                    type='text'
                    name='email'
                    placeholder='Update Email'
                    value={email}
                    onChange={this.handleChange} />
                <Button
                    color='primary'
                    style={buttonStyle}
                    disabled={emailIsInvalid}
                    onClick={() => this.handleSubmit('email')}>
                    Update Email
                </Button>

                <br />

                <Label style={labelStyle}>
                    First Name:
                </Label>
                <Input
                    style={inputStyle}
                    type='text'
                    name='firstname'
                    placeholder='Update Firstname'
                    value={firstname}
                    onChange={this.handleChange}></Input>
                <Button
                    color='primary'
                    style={buttonStyle}
                    disabled={firstnameIsInvalid}
                    onClick={() => this.handleSubmit('firstname')}>
                    Update Firstname
                </Button>

                <br />

                <Label style={labelStyle}>
                    Last Name:
                </Label>
                <Input
                    style={inputStyle}
                    type='text'
                    name='lastname'
                    placeholder='Update Lastname'
                    value={lastname}
                    onChange={this.handleChange} />
                <Button
                    color='primary'
                    style={buttonStyle}
                    disabled={lastnameIsInvalid}
                    onClick={() => this.handleSubmit('lastname')}>
                    Update Lastname
                </Button>
                <hr />
            </div >
        );
    };
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(UserProfile);