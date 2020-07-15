import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { Container, Button, Row, Col, Input } from 'reactstrap';
import * as Routes from '../../constants/routes';
import { compose } from 'recompose';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

class CreateAllGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: ``
        };
    };

    CreateAllGroup = async () => {
        if (this.state.password === ``) {
            this.handleWrongPass(`No!`);
            return;
        };
        try {
            await axios.post(`/api/createAllGroup/${this.state.password}`);
            console.log(`created`);
        } catch (err) {
            this.handleWrongPass(`Get Outta Here!`);
        };
        this.setState({ password: `` });
    };

    PurgeDB = async () => {
        if (this.state.password === ``) {
            this.handleWrongPass(`No!`);
            return;
        };
        try {
            await axios.post(`/api/purgeUserAndGroupDB/${this.state.password}`);
            console.log(`purged`);
        } catch (err) {
            this.handleWrongPass(`Get Outta Here!`);
        };
        this.setState({ password: `` });
    };

    async handleWrongPass(message) {
        await Alert.fire({
            type: 'error',
            title: message,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'X'
        });
        this.props.history.push(Routes.home);
    };

    //This is to handle the change for the Input Type in the position search below
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col xs='12'>
                        I'm watching you. Don't do this if you found this by accident.
                        <br />
                        <br />
                        <Input value={this.state.password} type='text' name='password' onChange={this.handleChange} />
                        <br />
                        <Button onClick={this.CreateAllGroup}>Create General Group</Button>
                        <br />
                        <br />
                        <Button onClick={this.PurgeDB}>Purge DB</Button>
                    </Col>
                </Row>
            </Container>
        );
    };
};


export default compose(withRouter)(CreateAllGroup);
