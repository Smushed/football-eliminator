import React, { Component } from 'react';
import axios from 'axios';
import { Container, Button, Row, Col, Input } from 'reactstrap';

//Using Swal to display messages when add book button is hit

class CreateAllGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: ``
        };
    };

    CreateAllGroup = async () => {
        this.setState({ password: `` });
        await axios.post(`/api/createAllGroup/${this.state.password}`);
    };

    PurgeDB = async () => {
        this.setState({ password: `` });
        await axios.post(`/api/purgeUserAndGroupDB/${this.state.password}`);
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


export default CreateAllGroup;