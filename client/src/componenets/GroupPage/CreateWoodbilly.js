import React, { Component } from 'react';
import axios from 'axios';
import { Container, Button, Row, Col } from 'reactstrap';

//Using Swal to display messages when add book button is hit

class CreateWoodbilly extends Component {


    createWoodbilly = async () => {
        const dbResponse = await axios.post(`/api/createWoodBilly`);
        console.log(dbResponse);
    };
    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col xs='12'>
                        <p>
                            <Button onClick={this.createWoodbilly}>Create Woodbilly</Button>
                        </p>
                    </Col>
                </Row>
            </Container>
        );
    };
};


export default CreateWoodbilly;