import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { SignUpLink } from './SignUp';
import { withFirebase } from '../Firebase';
import * as Routes from '../../constants/routes';
import { Row, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import WelcomeMessage from './WelcomeMessage';
import './signInOutStyle.css';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

const inputStyle = {
    width: '75%',
    height: '40px',
    fontSize: '16px'
};

const labelStyle = {
    marginBottom: '0px',
};

const formStyle = {
    display: 'block',
    marginLeft: '30px',
    marginRight: 'auto',
    fontSize: '20px'
};


const SignInPage = () => (
    <div style={formStyle}>
        <Row>
            <Col xs='1' />
            <Col xs='5'>
                <WelcomeMessage />
            </Col>
            <Col xs='5'>
                <br />
                <h3>Sign In</h3>
                <SignInForm />
                <SignUpLink />
            </Col>
            <Col xs='1' />
        </Row>
    </div>
);


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
        })
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
                this.setState({ error });
            });
    };

    async forgotPassword() {
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
        }
    };

    render() {
        const { email, password, error } = this.state;

        const isInvalid = password === '' || email === '';

        return (
            <div >
                <br />
                {/* If there's an error with sign in then display the error */}
                {error && <p>{error.message}</p>}

                <Form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Label style={labelStyle} >
                            Email:
                        </Label>
                        <Input
                            style={inputStyle}
                            type='text'
                            name='email'
                            placeholder='email'
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={labelStyle}>
                            Password:
                        </Label>
                        <Input
                            style={inputStyle}
                            placeholder='password'
                            type='password'
                            name='password'
                            value={this.state.password}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Button
                            color='primary'
                            size='lg'
                            disabled={isInvalid}
                            type='submit'>
                            Sign In
                        </Button>
                    </FormGroup>
                </Form>
                <Button color='secondary' onClick={() => this.forgotPassword()}>Forgot Password?</Button>
            </div >
        );
    };
};

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);

const SignInLink = () => (
    <p style={{ fontSize: '16px' }}>
        Already have an account?
        <Link to={Routes.signin}>
            <Button color='success'>
                Sign In
            </Button>
        </Link>
    </p>
);

export default SignInPage;

export { SignInForm, SignInLink };