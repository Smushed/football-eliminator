import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Button } from 'reactstrap';
import * as Routes from '../../constants/routes';
import PropTypes from 'prop-types';

import './upgradeToAdmin.css';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

//Using Swal to display messages when add book button is hit
const Alert = withReactContent(Swal);

UpgradeToAdmin.propTypes = {
    season: PropTypes.string,
    week: PropTypes.number,
    history: PropTypes.any
}

class UpgradeToAdmin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUser: ``,
            userArray: [],
            loading: true,
            dbPass: ``
        };
    }

    componentDidMount() {
        axios.get(`/api/getAllUsers`).then(res => {
            this.setState({ loading: false, userArray: res.data });
        });
    }

    selectUser = (id) => {
        this.setState({ selectedUser: id })
    };

    upgradeToAdmin = async () => {
        let serverResponse = {};
        try {
            serverResponse = await axios.put(`/api/updateUserToAdmin/${this.state.selectedUser._id}/${this.state.dbPass}`);
            Alert.fire({
                type: 'success',
                text: serverResponse.data
            });
        } catch (err) {
            this.handleWrongPass(`Get Outta Here!`);
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
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
    }

    render() {
        return (
            <div className='upgradeCol'>
                {/* <SelectedUser selectedUser={this.state.selectedUser} /> */}
                <input type='text' name='dbPass' value={this.state.dbPass} onChange={this.handleChange} />
                <Button className='adminButton' onClick={this.upgradeToAdmin} disabled={!this.state.selectedUser} >Upgrade to Admin</Button>
                {/* <UserTable userArray={this.state.userArray} loading={this.state.loading} selectUser={this.selectUser} /> */}
            </div>
        );
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(UpgradeToAdmin);