import React, { Component } from 'react';
import { withAuthorization } from './Session';
import { Link } from 'react-router-dom';
import * as Routes from '../constants/routes';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Button, Form, FormGroup, Label, Input } from "reactstrap";

//Using Swal to display message when group is created
const Alert = withReactContent(Swal);

const labelStyle = {
    marginBottom: '0px'
};

const initialState = {
    groupName: '',
    groupDescription: '',
    error: null
};

const navLinkStyle = {
    fontSize: '25px',
    color: 'white',
    textDecoration: 'none',
}

const formStyle = {
    fontSize: '25px',
    width: '50%',
    textAlign: 'center',
    margin: '0 auto'
};

const inputSize = {
    fontSize: '20px',
};

const headerStyle = {
    textAlign: 'center',
    marginBottom: '25px'
};

const descriptionStyle = {
    fontSize: '20px',
    height: '200px'
};


class CreateGroup extends Component {
    constructor(props) {
        super(props)
        this.state = { ...initialState };
    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleSubmit = async event => {
        event.preventDefault();

        const currentUserID = this.props.userID;

        const { groupName, groupDescription } = this.state;

        const dbResponse = await axios.post(`/api/creategroup`, { currentUserID, groupName, groupDescription });

        Alert.fire({
            type: `success`,
            title: `${groupName} Created!`,
            text: `Taking you to the club page. Why don't you pick a book or add a user?`
        });

        this.props.history.push(`/group/${dbResponse.data._id}`);
    };

    render() {
        const { groupName, groupDescription, error } = this.state;

        const isInvalid = groupName === '' || groupDescription === '';

        return (
            <div>
                <h2 style={headerStyle}>Create your group!</h2>
                {/* If there's an error with sign in then display the error */}
                {error && <p>{error.message}</p>}

                <Form style={formStyle} onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Label style={labelStyle} htmlFor='groupName' for='text'> Group Name: </Label>
                        <Input
                            style={inputSize}
                            type='text'
                            name='groupName'

                            placeholder='Enter A Group Name'
                            value={this.state.groupName}
                            onChange={this.handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label style={labelStyle} htmlFor='groupDescription' for='text'>Enter A Group Description: </Label>
                        <Input
                            style={descriptionStyle}
                            type='textarea'
                            name='groupDescription'
                            placeholder='Description'
                            value={this.state.groupDescription}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <Button
                        color='primary'
                        size='lg'
                        disabled={isInvalid}
                        type='submit'
                    >Create New Group
                    </Button>

                </Form>
            </div>


        );
    };
};

const CreateGroupLink = () => (
    <Link to={Routes.createGroup}>
        <button style={navLinkStyle} className='btn btn-link'>Create Group</button>
    </Link>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CreateGroup);

export { CreateGroupLink };