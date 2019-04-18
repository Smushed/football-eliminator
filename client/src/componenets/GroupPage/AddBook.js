
import React, { Component } from "react";
import axios from "axios";
import { BarLoader } from "react-spinners";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Row, Col, Button, Form, FormGroup, Label, Input, Card, CardImg, CardBody, CardTitle, } from "reactstrap";

//Using Swal to display messages when add book button is hit
const Alert = withReactContent(Swal);

const labelStyle = {
  marginBottom: '0px'
};

const colStyle = {
  margin: '0'
}

const cardStyle = {
  width: '400px',
  height: '600px',
  marginBottom: '10px'
};

const cardImageStyle = {
  paddingLeft: '2px',
  paddingRight: '2px',
  width: '200px',
  margin: '0 auto'
}

const cardTitleStyle = {
  fontSize: '25px',
};

const cardBodyStyle = {
  fontSize: '15px',
  margin: '0 auto'
};

const loaderStyle = `
    display: block;
    margin: 0 auto;
`;

const formStyle = {
  fontSize: '25px',
  textAlign: 'center'
};

const formInputStyle = {
  fontSize: '20px',
  width: '75%',
  margin: '0 auto'
};

const singleBookButton = {
  width: '100%'
}

class AddBookPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookSearch: "",
      error: null,
      bookArray: [],
      loading: false
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault();
    const { bookSearch } = this.state;

    //This changes the book the user enters into a searchable term by the browser
    const searchableBook = bookSearch
      .trim()
      .split(" ")
      .join("+");

    this.setState({ loading: true });
    const dbResponse = await axios.get(`/api/searchbook/${searchableBook}`);

    if (dbResponse.status === 200) {
      this.setState({ loading: false });
      //returns an array of 1 - 20 books and maps over them
      this.setState({ bookArray: dbResponse.data });
    } else {
      this.setState({ loading: false });
      this.setState({ error: dbResponse.data.error });
    }
    //TODO Send this to another component to then map over the
  };

  render() {
    const { bookSearch, error, bookArray, loading } = this.state;
    const isInvalid = bookSearch === "";

    return (
      <div className="bookSearch">
        {error && <p>{error}</p>}
        {loading ? (
          <BarLoader
            css={loaderStyle}
            sizeUnit={"px"}
            height={4}
            width={200}
            color={"#36D7B7"}
            loading={loading}
          />
        ) : (
            <div>
              <Form style={formStyle} onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Label style={labelStyle} htmlFor="bookSearch" for="text">
                    Book to Search:
                </Label>
                  <Input
                    style={formInputStyle}
                    type="text"
                    name="bookSearch"
                    placeholder="Enter a Book to Search"
                    value={this.state.bookSearch}
                    onChange={this.handleChange}
                  />
                </FormGroup>
                <Button
                  color="primary"
                  size="lg"
                  disabled={isInvalid}
                  type="submit">
                  Search New Book For Group:
              </Button>
              </Form>{" "}

            </div>
          )}
        {bookArray &&
          bookArray.map((book, i) => (
            <SingleBook
              book={book}
              key={i}
              isAdmin={this.props.isAdmin}
              groupID={this.props.groupID}
              updatePage={this.props.updatePage}
            />
          ))}
      </div>
    );
  }
}

//This component is going to have state to wrap the book in the submit and send it to the database
class SingleBook extends Component {

  //We are going to chain alerts so the user adds a book then immeditley sets it up for use
  //TODO Possibly redo this to make three modals in order and then three calls to the api
  getChapterCount = async title => {
    //Send alert to user that they should add the chapters
    const { value: totalBenchmark } = await Alert.fire({
      type: "info",
      input: "number",
      title: `How many chapters in ${title}?`,
      showCancelButton: true,
      inputValidator: value => {
        if (!value || value <= 0) {
          return "Please input a number above 0";
        }
      }
    });
    if (totalBenchmark) {
      this.addBookToGroup(totalBenchmark);
    }
  };

  addBookToGroup = async totalBenchmark => {
    const chosenBook = { ...this.props.book };
    const { groupID, isAdmin } = this.props;

    const dbResponse = await axios.post(`/api/addbook`, { groupID, isAdmin, chosenBook });
    if (dbResponse.status === 200) {
      this.addTotalBenchmark(totalBenchmark, groupID, isAdmin, chosenBook.title);
    }
  };

  addTotalBenchmark = async (totalCount, groupID, isAdmin, title) => {
    const dbResponse = await axios.put(`/api/updatepagesetup`, { totalCount, groupID, isAdmin });

    if (dbResponse.status === 200) {
      //Send alert to user that they should add the first chapter for the group
      const { value: nextBenchmark } = await Alert.fire({
        type: "info",
        input: "number",
        title: `What's the group's first chapter goal?`,
        showCancelButton: true,
        inputValidator: value => {
          if (!value || value <= 0 || value > totalCount) {
            return "Please input a number above 0 and below the total chapters";
          }
        }
      });
      this.addCurrentBenchmark(nextBenchmark, groupID, isAdmin, title);
    }
  };

  addCurrentBenchmark = async (nextBenchmark, groupID, isAdmin, title) => {
    const dbResponse = await axios.put(`/api/updatebenchmark`, {
      nextBenchmark,
      groupID,
      isAdmin
    });

    if (dbResponse.status === 200) {
      Alert.fire({
        type: "success",
        title: `${title} Added to Group!`,
        text:
          "Sending you back to the club page. Why not make a post about the new book?"
      });

      this.props.updatePage(`main`);
    }
  }

  // Taking out the book object to make displaying it easier
  render() {
    const { title, authors, image, pageCount, publishedDate } = this.props.book
    return (
      <Row>
        <Col sm={{ size: 6, offset: 3 }}>
          <Card style={cardStyle}>
            <CardBody style={cardBodyStyle}>
              <CardTitle style={cardTitleStyle}>
                <strong>{title}</strong>
              </CardTitle>
            </CardBody>
            <CardImg style={cardImageStyle} top src={image} alt={title} />
            <CardBody style={cardBodyStyle}>
              <div>
                <strong>Author:</strong>
                <br />
                {authors[0]}
              </div>
              <br />
              <div>
                <strong>Pages:</strong> {pageCount}
              </div>
              <br />
              <div>
                <strong>Date Published:</strong> {publishedDate}
              </div>
              <br />
              <Button style={singleBookButton} color='primary' onClick={() => this.getChapterCount(title)}>Read this Book</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }
};

export default AddBookPage;