import React, { Component, Fragment } from 'react';
import { withAuthorization } from './Session';
import { Link } from 'react-router-dom';
import * as Routes from '../constants/routes';
import axios from 'axios';
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';

const cardStyle = {
    border: '1px solid darkgrey',
    borderRadius: '5px',
    marginLeft: '50px',
    overflow: 'auto',
    height: '500px',
    width: '22%',
    float: 'left',
    marginBottom: '10px'
};

const noGroupMessage = {
    marginLeft: '25%',
    width: '50%'
}

const textsize = {
    fontSize: '25px',
    textAlign: 'center'
};

const textsize2 = {
    fontSize: '25px',
    textAlign: 'center'
};

const cardImageStyle = {
    width: '200px',
    margin: '0 auto',
    borderRadius: '2px'
};

const cardTitleStyle = {
    fontSize: '25px',
};

const cardBodyStyle = {
    fontSize: '15px',
    margin: '0 auto'
};

const logo = {
    width: '50px',
    background: 'white',
    borderRadius: '50%'
};

const titleStyle = {
    float: 'right',
    marginLeft: '10px',
    marginRight: '10px',
    marginTop: '10px',
    fontSize: '25px',
    color: 'white',
}

//Stateful component to allow the grouplist to properly populate
class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            grouplist: [],
            error: null,
            hasGroups: false
        };
    };

    componentDidMount() {
        if (this.props.grouplist) {
            this.setState({ grouplist: this.props.grouplist });
            this.checkIfGroups();
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.grouplist !== prevProps.grouplist) {
            this.setState({ grouplist: this.props.grouplist });
            this.checkIfGroups();
        };
    };

    checkIfGroups() {
        if (!this.props.grouplist) {
            this.props.history.push(`/signin`);
        };

        if (this.props.grouplist.length > 0) {
            this.setState({ hasGroups: true })
        }
    }

    //TODO This only displays 3 groups properly!!
    render() {
        const { grouplist, hasGroups } = this.state;
        return (
            <Fragment>
                {hasGroups ? (
                    <Fragment>
                        <br />
                        {grouplist.map(groupID => <GroupCard key={groupID} groupID={groupID} />)}
                    </Fragment>)
                    : (<NoGroup />)}
            </Fragment>
        );
    };
};

const NoGroup = () => {
    return (
        <div style={noGroupMessage}>
            <p style={textsize}><strong>Welcome to Bookworm!</strong> </p>
            <p style={textsize2} >You’ve taken your first step into being more engaged with reading! Why not create a group above? Once there be sure to add a book and invite some of your friends to join!</p>
        </div>
    )
}

//Stateful component to get the groupdata
class GroupCard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            groupName: '',
            currentBook: '',
            currentBenchmark: 0,
            error: null,
            bookTitle: '',
            bookImage: '',
            author: '',
            date: ''
        };
    };

    componentDidMount() {
        const groupID = this.props.groupID;
        this.getGroupData(groupID);
    };

    //First get the data for all the user is apart of
    getGroupData = async (groupID) => {
        const dbResponse = await axios.get(`/api/getgroupdata/${groupID}`);

        if (dbResponse.status === 200) {
            this.setState({
                groupName: dbResponse.data.name,
                currentBook: dbResponse.data.currentBook,
                currentBenchmark: dbResponse.data.currentBenchmark
            }, () => {

                //Once that is written to state then grab the book they're currently reading and the latest post if they exist
                axios.all([this.getBookData(), this.getPostData()]).then(axios.spread((bookData, postData) => {
                    if (bookData.status === 200) {
                        this.setState({
                            bookTitle: bookData.data.title,
                            bookImage: bookData.data.image
                        });
                    }

                    if (postData.data.length > 0) {
                        this.setState({
                            author: postData.data[0].user,
                            date: postData.data[0].date
                        });
                    };
                }));
            });
        };
    };

    getBookData = () => {
        return axios.get(`/api/getbookdata/${this.state.currentBook}`)
    };

    getPostData = () => {
        return axios.get(`/api/getallgrouppost/${this.props.groupID}`);
    };

    render() {
        const { currentBenchmark, bookImage, bookTitle, author, date, groupName } = this.state;
        const postDate = new Date(this.state.date);
        const { groupID } = this.props;

        return (
            <Card style={cardStyle}>
                <CardBody style={cardBodyStyle}>
                    <CardTitle style={cardTitleStyle}>
                        <strong>{groupName}</strong>
                    </CardTitle>
                    <CardSubtitle>
                        <strong>Next Chapter:  </strong>{currentBenchmark}
                    </CardSubtitle>
                </CardBody>
                <CardImg style={cardImageStyle} src={bookImage} alt={bookTitle} />
                <CardBody style={cardBodyStyle}>
                    <CardText>
                        {author && <PostAuthor author={author} />}
                        <br />
                        {date && postDate.toLocaleString()}
                    </CardText>
                    <Link to={`/group/${groupID}`}>
                        <Button color='success'>Go to Club</Button>
                    </Link>
                </CardBody>
            </Card>
        );
    };
};

class PostAuthor extends Component {
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
        const dbResponse = await axios.get(`/api/getuserbyid/${this.props.author}`);
        if (dbResponse.status === 200) {
            this.setState({ username: dbResponse.data.local.username })
        } else {
            this.setState({ error: dbResponse.data })
        };
    };

    render() {
        return (
            <Fragment>
                Last Post By: {this.state.username}
            </Fragment>
        );
    };
};

const HomeLink = () => (
    <Link to={Routes.home}>
        <img src='../img/bookLogo.png' alt='Book Logo' style={logo} />
        <div style={titleStyle}>
            Bookworm
        </div>
    </Link>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);
export { HomeLink }