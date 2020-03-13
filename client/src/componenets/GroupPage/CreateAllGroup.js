import React, { Component } from 'react';
import axios from 'axios';
import { Container, Button, Row, Col } from 'reactstrap';

//Using Swal to display messages when add book button is hit

class CreateAllGroup extends Component {


    CreateAllGroup = async () => {
        const dbResponse = await axios.post(`/api/createAllGroup`);
        console.log(dbResponse);
    };
    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col xs='12'>
                        <p>
                            <Button onClick={this.CreateAllGroup}>Create General Group</Button>
                        </p>
                    </Col>
                </Row>
            </Container>
        );
    };
};


export default CreateAllGroup;