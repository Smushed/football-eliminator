import React, { Component, Fragment } from 'react';
import axios from 'axios';

class TestRoster extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roster: ''
        };
    };

    componentDidMount = async () => {
        const dbResponse = await axios.get(`/api/testroster`);

        if (dbResponse) {

            this.setState({
                roster: dbResponse.data.test
            })
        }
    };

    render() {
        return (
            <div>
                Bazinga
                <br />
                {this.state.roster}
            </div>
        )
    }
}

export default TestRoster;