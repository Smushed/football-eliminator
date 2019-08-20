import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Container, Button, Row, Col } from 'reactstrap';
import { UserTable, SelectedUser } from './UserEditor';

import './upgradeToAdmin.css';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

//Using Swal to display messages when add book button is hit
const Alert = withReactContent(Swal);

class UpgradeToAdmin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUser: ``,
            userArray: [],
            loading: true,
        };
    };

    componentDidMount() {
        axios.get(`/api/getAllUsers`).then(res => {
            this.setState({ loading: false, userArray: res.data });
        });
    };

    selectUser = (id) => {
        this.setState({ selectedUser: id })
    };

    upgradeToAdmin = async () => {
        const serverResponse = await axios.put(`/api/updateUserToAdmin/${this.state.selectedUser}`);
        Alert.fire({
            type: 'success',
            text: serverResponse.data
        });
    };

    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col xs='12' className='upgradeCol'>
                        what the fuck
                        <SelectedUser selectedUser={this.state.selectedUser} />
                        <Button className='adminButton' onClick={this.upgradeToAdmin} disabled={!this.state.selectedUser} >Upgrade to Admin</Button>
                        <UserTable userArray={this.state.userArray} loading={this.state.loading} selectUser={this.selectUser} />
                    </Col>
                </Row>
            </Container>
        )
    };
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(UpgradeToAdmin);