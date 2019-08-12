import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Label, Input, Container, Form, FormGroup, Button, Row, Col } from 'reactstrap';

import PlayerEditor from './PlayerEditor';
import UserEditor from './UserEditor';

class AdminPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEditor: false,
            playerEditor: false,
            weekSelect: 0,
            seasonSelect: ``
        };
    };

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            this.setState({ weekSelect: this.props.week, seasonSelect: this.props.season });
        };
    };

    componentDidMount() {
        if (typeof this.props.season !== `undefined`) {
            this.setState({ seasonSelect: this.props.season });
        };
        if (typeof this.props.week !== `undefined`) {
            this.setState({ weekSelect: this.props.week });
        };
    };

    showPlayerEditor = () => {
        this.setState({ playerEditor: true, userEditor: false })
    };

    showUserEditor = () => {
        this.setState({ playerEditor: false, userEditor: true })
    };

    //This is to handle the change for the Input Type in the position search below
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        const { playerEditor, userEditor } = this.state;

        return (
            <Container fluid={true}>
                <Row>
                    <Col sm='12' md='3'>
                        <Label for='seasonSelect'>Select Season</Label>
                        <Input value={this.state.seasonSelect} type='select' name='seasonSelect' id='seasonSelect' onChange={this.handleChange}>
                            <option>2018-2019-regular</option>
                            <option>2019-2020-regular</option>
                        </Input>
                        <Label for='weekSelect'>Select Week</Label>
                        <Input value={this.state.weekSelect} type='select' name='weekSelect' id='weekSelect' onChange={this.handleChange}>
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
                        <br />
                        <br />
                        <Button color='primary' onClick={this.showPlayerEditor}>Player Editor</Button>
                        <br />
                        <br />
                        <Button color='primary' onClick={this.showUserEditor}>User Editor</Button>
                    </Col>
                    <Col sm='12' md='9'>
                        {playerEditor &&
                            <PlayerEditor week={this.state.weekSelect} season={this.state.seasonSelect} />
                        }
                        {userEditor &&
                            <UserEditor week={this.state.weekSelect} season={this.state.seasonSelect} />
                        }
                    </Col>
                </Row>
            </Container>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AdminPanel);