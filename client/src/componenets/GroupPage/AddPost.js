import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Button, Form, FormGroup, Input, } from 'reactstrap';

const labelStyle = {
    fontSize: '25px'
}

const forminputsize = {
    fontSize: '20px'
}

const initialState = {
    title: '',
    text: '',
    error: null
};

const newPostMessage = {
    textAlign: 'center',
    fontSize: '30px',
    fontWeight: '600'
}

class AddPost extends Component {
    constructor(props) {
        super(props)
        this.state = { ...initialState };
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    handleSubmit = async event => {
        event.preventDefault();
        const { userID, groupID } = this.props

        const userPost = {
            title: this.state.title,
            text: this.state.text
        }

        const dbResponse = await axios.post(`/api/newpost`, { userID, groupID, userPost });

        if (dbResponse.status === 200) {
            this.props.getAllPosts();
            this.setState({ ...initialState })
        };
        //TODO SHOW MODAL FOR POST ADDED
    }

    //updated form 
    render() {
        const { text, title, error } = this.state;

        const isInvalid = text === '' || title === '';

        return (
            <div>
                <br />
                {/* If there's an error with sign in then display the error */}
                {error && <p>{error.message}</p>}

                <Form style={labelStyle} onSubmit={this.handleSubmit}>
                    <div style={newPostMessage}>
                        Add a new post
                    </div>
                    <FormGroup>
                        <Input style={forminputsize} type="text" name="title" id="exampleEmail" placeholder="Your Post's Title" value={this.state.title}
                            onChange={this.handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <Input style={forminputsize} type="textarea" name="text" id="exampleText" placeholder='Write your Post'
                            value={this.state.text}
                            onChange={this.handleChange} />
                    </FormGroup>
                    <Button color="primary" size="lg"
                        disabled={isInvalid}
                        type='submit'>Submit Post</Button>
                </Form>
            </div>
        );
    };
};


const condition = authUser => !!authUser;

export default withAuthorization(condition)(AddPost);