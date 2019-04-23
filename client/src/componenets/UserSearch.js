import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Button, Form, FormGroup, Label, Input, } from 'reactstrap';

//Using Swal to display messages when submit button is hit
const Alert = withReactContent(Swal);

const labelStyle = {
    marginBottom: '0px'
};


const formlabelStyle = {
    fontSize: '25px'
};

const forminputsize = {
    fontSize: '20px'
};

class UserSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userSearch: '',
            error: null,
            userArray: [],
            searchSelect: ''
        }
    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleSubmit = async event => {
        event.preventDefault();

        const { userSearch, searchSelect } = this.state;

        const dbResponse = await axios.get(`/api/usersearch/${userSearch}/${searchSelect}`);

        this.setState({ userArray: dbResponse.data });
    }

    render() {
        const { userSearch, error, userArray, searchSelect } = this.state;
        const isInvalid = userSearch === '' || searchSelect === '';

        return (

            <div>
                {error && <p>{error}</p>}
                <Form style={formlabelStyle} onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Label style={labelStyle} for="text"> Search By:</Label>
                        <Input style={forminputsize} type='select' name='searchSelect' id="searchSelection" value={this.state.searchSelect}
                            onChange={this.handleChange}>
                            <option value=''> </option>
                            <option value='email'>Email</option>
                            <option value='username'>Username</option>
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label style={labelStyle} htmlFor='userSearch' for="text"> Search Users:</Label>
                        <Input style={forminputsize} type='text' name='userSearch' id="exampleEmail" placeholder='Search User' value={this.state.userSearch}
                            onChange={this.handleChange} />
                    </FormGroup>

                    <Button color="secondary" size="lg" disabled={isInvalid}
                        type='submit'>Search User</Button>
                </Form>

                {userArray && userArray.map((user, i) => <SingleUser user={user} key={i} isAdmin={this.props.isAdmin} groupID={this.props.groupID} updatePage={this.props.updatePage} />)}
            </div>




        )
    }
}

//This component is going to have state to wrap the book in the submit and send it to the database
class SingleUser extends Component {

    addUserToGroup = async (event) => {
        const { isAdmin, groupID } = this.props;
        const { userID, username } = this.props.user;
        const dbResponse = await axios.put(`/api/addusertogroup`, { isAdmin, groupID, userID });

        if (dbResponse.status === 200) {
            Alert.fire({
                type: 'success',
                title: `${username} Added!`,
                text: 'Sending you back to the club page'
            });
            this.props.updatePage(`main`);
        };
    };

    // Taking out the book object to make displaying it easier
    render() {
        const { isAdmin } = this.props;
        const { email, username } = this.props.user;

        return (
            <div className='userCard'>
                <div>Email: {email}</div>
                <div>Username: {username}</div>

                {isAdmin && <button className='btn btn-primary' onClick={this.addUserToGroup}>Add User To Group</button>}
            </div>
        );
    };
};

export default UserSearch;