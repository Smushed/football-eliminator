import React, { Component } from 'react';
import { Input, Button } from 'reactstrap';
import { withRouter } from 'react-router-dom';


class TeamSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchSelect: 'Team'
        }
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        return (
            <div>
                {/* Start here. I need to figure out how to handle the click function in here https://reactjs.org/docs/faq-functions.html */}
                Search Team Or Player By Name
                <Input value={this.state.searchSelect} type='select' name='searchSelect' id='searchSelect' onChange={this.handleChange}>
                    <option>Team</option>
                    <option>Player</option>
                </Input>
                <Button color="secondary" onClick={this.props.whenclicked}>
                    Submit
                </Button>
            </div>
        );
    };
};

export default withRouter(TeamSearch);