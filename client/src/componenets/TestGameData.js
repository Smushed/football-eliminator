import React, { Component, Fragment } from 'react';
import axios from 'axios';

class TestGameData extends Component {
    constructor(props) {
        super(props)
        this.state = {
            exampleArray: []
        };
    };

    componentDidMount = async () => {
        const dbResponse = await axios.get(`/api/testgame`);

        if (dbResponse) {

            this.setState({
                exampleArray: dbResponse.data
            })
        }
    };

    render() {
        return (
            <div>
                Bazinga
                <br />
                {this.state.exampleArray.map((example, i) => (
                    <div>
                        {example}
                    </div>
                ))}
            </div>
        )
    }
}

export default TestGameData;