import React, { Component } from 'react';
import axios from 'axios';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { PropagateLoader } from "react-spinners";

const loaderStyle = `
    display: block;
    margin: 0 auto;
`;

class GetWeeklyData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            serverResponse: '',
            loading: false, //Used for react-spinners
            weekSelect: 1,
            seasonSelect: '2017-2018-regular'
        };
    };

    componentDidMount() {
        const week = this.props.match.params.week;
        if (typeof week !== 'undefined') {
            console.log(week)
            this.getWeeklyData(week);
        }
    };

    getWeeklyData = async event => {
        this.setState({ loading: true });

        event.preventDefault();
        const dbResponse = await axios.get(`/api/updatePlayers/${this.state.seasonSelect}/${this.state.weekSelect}`);

        if (dbResponse) {
            console.log('worked', dbResponse)
            this.setState({
                loading: false,
                serverResponse: dbResponse.data
            })
        }
    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {
        return (
            <div>
                Bazinga
                <br />
                {this.state.loading ? (
                    <PropagateLoader
                        css={loaderStyle}
                        sizeUnit={'px'}
                        height={4}
                        width={200}
                        loading={this.state.loading}
                    />
                ) : (
                        <Form onSubmit={this.getWeeklyData}>
                            <FormGroup>
                                <Label for='seasonSelect'>
                                    Select Season
                            </Label>
                                <Input type='select' name='seasonSelect' value={this.state.seasonSelect} onChange={this.handleChange}>
                                    <option>2017-2018-regular</option>
                                    <option>2018-2019-regular</option>
                                    <option>2019-2020-regular</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for='weekSelect'>
                                    Select Week
                            </Label>
                                <Input type='select' name='weekSelect' value={this.state.weekSelect} onChange={this.handleChange}>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                    <option>6</option>
                                    <option>7</option>
                                    <option>8</option>
                                    <option>9</option>
                                    <option>10</option>
                                    <option>11</option>
                                    <option>12</option>
                                    <option>13</option>
                                    <option>14</option>
                                    <option>15</option>
                                    <option>16</option>
                                    <option>17</option>
                                </Input>
                            </FormGroup>
                            <Button color='primary' size='lg' type='submit'>
                                Submit
                        </Button>
                        </Form>
                    )}
                <div>
                </div>
            </div>
        )
    }
}

export default GetWeeklyData;