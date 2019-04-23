import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { withAuthorization } from './Session';

import { withFirebase } from './Firebase';
import * as Routes from '../constants/routes';
import { Form, FormGroup, Label, Input, Button } from "reactstrap";

const inputStyle = {
    width: '35%',
    height: '40px',
    marginLeft: 'auto',
    marginRight: 'auto'
};

const labelStyle = {
    marginBottom: '0px',
    fontSize: '20px'
};

const initalState = {
    password: '',
    passwordConfirm: '',
    error: null,
    passwordValid: false,
    validMessage: []
};

class PasswordChangeForm extends Component {
    constructor(props) {
        super(props);

        this.state = { ...initalState };
    }

    handleSubmit = event => {
        event.preventDefault();

        //Checks if the password they inputted is correct. If it isn't it will not submit
        if (this.checkValidInput()) {
            const { password } = this.state;

            this.props.firebase
                .doPasswordUpdate(password)
                .then(() => {
                    this.setState({ ...initalState });
                    this.props.history.push(Routes.home);
                })
                .catch(error => {
                    this.setState({ error });
                });
        }
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
    }

    //Field name to keep validation consistant, but there's only password here
    validateForm = (fieldName, value) => {
        let validCheck;
        let checkPassword = value.length >= 6;
        let noSpacesInPassword = value.match(/^\S*$/);
        validCheck = checkPassword && noSpacesInPassword ? true : false;
        this.setState({ passwordValid: validCheck });
    }

    render() {
        const { password, passwordConfirm, error, validMessage } = this.state;

        const isInvalid =
            password !== passwordConfirm || password === '';

        return (
            <div>
                <h3>Update Password:</h3>
                <br />
                {validMessage && validMessage.map((message, i) => <p key={i}>{message}</p>)}
                <Form onSubmit={this.handleSubmit}>
                    {error && <p>{error.message}</p>}
                    <Label style={labelStyle} htmlFor='password'>New Password:</Label>
                    <FormGroup>
                        <Input
                            style={inputStyle}
                            name='password'
                            value={password}
                            onChange={this.handleChange}
                            type='password'
                            placeholder='New Password'
                        />
                    </FormGroup>

                    <Label style={labelStyle} htmlFor='passwordConfirm'>Confirm Password:</Label>
                    <FormGroup>
                        <Input
                            style={inputStyle}
                            name='passwordConfirm'
                            value={passwordConfirm}
                            onChange={this.handleChange}
                            type='password'
                            placeholder='Confirm New Password'
                        />
                    </FormGroup>
                    <FormGroup>
                        <Button
                            color='primary'
                            disabled={isInvalid}
                            type='submit'>
                            Update Password
                            </Button>
                    </FormGroup>

                </Form>
            </div>
        );
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(compose(withRouter, withFirebase)(PasswordChangeForm));