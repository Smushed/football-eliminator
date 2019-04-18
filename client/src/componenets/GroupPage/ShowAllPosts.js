import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Button } from 'reactstrap';
import AddPost from './AddPost';
import { Row, Col, Input } from 'reactstrap';


const date = {
    textAlign: 'center',
    fontSize: '14px',
    marginBottom: '10px',
    marginTop: '-10px',
};

const buttonPosition = {
    marginBottom: '15px'
};

const postContainer = {
    border: 'solid 2px #b0b2b3',
    borderRadius: '2px',
    backgroundColor: '#f2f5f7',
    marginTop: '10px',
    marginBottom: '20px',
};

const postUsername = {
    fontSize: '20px',
    textAlign: 'center'
}

const postStyle = {
    fontSize: '16px',
};

const inputStyle = {
    width: `100%`,
    height: `40px`,
};

const initalState = {
    text: '',
    error: null,
    postArray: []
};

const postHeader = {
    textAlign: 'center'
}

class ShowAllPosts extends Component {
    constructor(props) {
        super(props)
        this.state = { ...initalState }
    };

    //In both did update and did mount based on if the user goes to another page within the group or loads it
    componentDidMount() {
        this.getAllPosts()
    };

    componentDidUpdate(prevProps) {
        if (this.props.groupID !== prevProps.groupID) {
            this.getAllPosts()
        };
    };

    getAllPosts = async () => {
        const groupID = this.props.groupID;
        const dbResponse = await axios.get(`/api/getallgrouppost/${groupID}`);

        if (dbResponse.status === 200) {
            this.setState({ postArray: dbResponse.data });
        };
    };

    render() {
        const { postArray } = this.state;
        const { userID, groupID } = this.props;

        return (
            <div>
                <AddPost userID={this.props.userID} groupID={groupID} getAllPosts={this.getAllPosts} />
                <br />
                <br />
                <h1 style={postHeader}>Posts</h1>
                {postArray.map(post => <SinglePost key={post._id} post={post} userID={userID} getAllPosts={this.getAllPosts} />)}
            </div>
        );
    };
};


class SinglePost extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            error: null,
            comment: '',
        }
    };

    componentDidMount = () => {
        //Taking this out the of lifecycle method to make it an async function
        this.getUsername();
    };

    getUsername = async () => {
        const dbResponse = await axios.get(`/api/getuserbyid/${this.props.post.user}`);
        if (dbResponse.status === 200) {
            this.setState({ username: dbResponse.data.local.username })
        } else {
            this.setState({ error: dbResponse.data })
        };
    };

    render() {
        const { username } = this.state;
        const { title, text, _id, comment } = this.props.post;
        const { userID } = this.props;
        const postDate = new Date(this.props.post.date);

        return (
            <span>
                <div style={postContainer}>
                    <div>
                        <Row>
                            <Col xs='12' style={postUsername}>
                                <strong>{username}: </strong>
                            </Col>
                        </Row>
                    </div>

                    <p style={postStyle}>
                        <strong> {title} </strong>
                        <br />
                        {text}
                    </p>
                    <div style={date}>
                        <Row>
                            <Col xs="12">
                                {postDate.toLocaleString()}
                            </Col>
                        </Row>
                    </div>
                    <hr></hr>
                    {comment.map(singleComment => <ShowComment key={singleComment._id} comment={singleComment} />)}
                    <AddComment postID={_id} userID={userID} getAllPosts={this.props.getAllPosts} />

                </div>
            </span>
        );
    };
};

class ShowComment extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: ''
        };
    };

    componentDidMount = () => {
        //Taking this out the of lifecycle method to make it an async function
        this.getUsername();
    };

    getUsername = async () => {
        const dbResponse = await axios.get(`/api/getuserbyid/${this.props.comment.user}`);
        if (dbResponse.status === 200) {
            this.setState({ username: dbResponse.data.local.username })
        } else {
            this.setState({ error: dbResponse.data })
        };
    };

    render() {
        const { username } = this.state;
        const { text } = this.props.comment;
        const commentDate = new Date(this.props.comment.date)

        return (
            <Fragment>
                <p style={postStyle}>
                    <strong>{username} : </strong>
                    {text}
                </p>
                <div style={date}>
                    <Row>
                        <Col xs="12">
                            {commentDate.toLocaleString()}
                        </Col>
                    </Row>
                </div>
                <hr></hr>
            </Fragment>
        );
    };
};

class AddComment extends Component {
    constructor(props) {
        super(props)
        this.state = {
            comment: ''
        };
    };

    handleSubmit = async () => {
        const comment = this.state.comment;
        const userID = this.props.userID;
        const postID = this.props.postID;

        const dbResponse = await axios.post(`/api/newcomment`, { userID, postID, comment });
        if (dbResponse.status === 200) {
            this.props.getAllPosts();
            this.setState({ comment: '' })
        };
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { comment } = this.state;

        const isInvalid = comment === '';

        return (

            <div>
                <Row>
                    <Col xs={{ size: '6', offset: 2 }}>
                        <Input
                            style={inputStyle}
                            type='text'
                            name='comment'
                            placeholder='Add A Comment'
                            value={comment}
                            onChange={this.handleChange} />
                    </Col>
                    <Col xs='4'>
                        <Button style={buttonPosition} color="primary"
                            disabled={isInvalid}
                            onClick={this.handleSubmit}>Add Comment</Button>
                    </Col>
                </Row>
            </div>
        );
    };
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(ShowAllPosts);