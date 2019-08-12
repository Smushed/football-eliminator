import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Label, Input, Form, FormGroup, Button, Row, Col } from 'reactstrap';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

class UserEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            QB: 0,
            RB1: 0,
            RB2: 0,
            WR1: 0,
            WR2: 0,
            Flex: 0,
            TE: 0,
            K: 0
        };
    };

    loading() {
        Alert.fire({
            title: 'Loading',
            text: 'Working your request',
            imageUrl: 'https://media.giphy.com/media/3o7aDczpCChShEG27S/giphy.gif',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'Loading Football',
            showConfirmButton: false,
            showCancelButton: false
        });
    };
    doneLoading() {
        Alert.close()
    };

    dummyRoster = async () => {
        //TODO Make it so I can upload any roster to the DB directly
        const loaded = await axios.put(`/api/dummyroster/${this.props.userId}`)
        console.log(loaded)
    };


    //This is to handle the change for the Input Type in the position search below
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        return (
            <Row>
                <Col>
                    <Form onSubmit={this.dummyRoster}>
                        <FormGroup>

                            <Input value={this.state.QB} type='text' name='QB' id='QB' onChange={this.handleChange} />
                            <Input value={this.state.RB1} type='text' name='RB1' id='RB1' onChange={this.handleChange} />
                            <Input value={this.state.RB2} type='text' name='RB2' id='RB2' onChange={this.handleChange} />
                            <Input value={this.state.WR1} type='text' name='WR1' id='WR1' onChange={this.handleChange} />
                            <Input value={this.state.WR2} type='text' name='WR2' id='WR2' onChange={this.handleChange} />
                            <Input value={this.state.Flex} type='text' name='Flex' id='Flex' onChange={this.handleChange} />
                            <Input value={this.state.TE} type='text' name='TE' id='TE' onChange={this.handleChange} />
                            <Input value={this.state.K} type='text' name='K' id='K' onChange={this.handleChange} />

                        </FormGroup>
                    </Form>
                </Col>
            </Row>
        )
    }


};


const condition = authUser => !!authUser;

export default withAuthorization(condition)(UserEditor);