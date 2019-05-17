import React, { Component, Fragment } from 'react';
import axios from 'axios';

class TestGameData extends Component {
    constructor(props) {
        super(props)
        this.state = {
            exampleArray: []
        };
    };

    componentDidMount() {
        const week = this.props.match.params.week;
        if (typeof week !== 'undefined') {
            console.log(week)
            this.getWeeklyData(week);
        }
    };

    getWeeklyData = async (week) => {
        const dbResponse = await axios.get(`/api/testgame/${week}`);

        if (dbResponse) {
            this.setState({
                exampleArray: dbResponse.data
            })
        }
    }

    render() {
        return (
            <div>
                Bazinga
                <br />
                {this.state.exampleArray.map((example, i) => (
                    <div>
                        {example.name} {example.position}
                    </div>
                ))}
            </div>
        )
    }
}

export default TestGameData;