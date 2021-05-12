import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import { Label, Input, Container, Button, Row, Col } from 'reactstrap';
import * as Routes from '../../constants/routes';
import axios from 'axios';
import PropTypes from 'prop-types';

import PlayerEditor from './PlayerEditor';
import UserEditor from './UserEditor';
import GroupEditor from './GroupEditor';

AdminPanel.propTypes = {
    season: PropTypes.string,
    week: PropTypes.number,
    currentUser: PropTypes.object,
    history: PropTypes.any,
    groupId: PropTypes.string
}

class AdminPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userEditor: false,
            playerEditor: false,
            groupEditor: false,
            weekSelect: 1,
            seasonSelect: ``
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.season !== prevProps.season) { // season here because it's the last prop we pass in. Probably not the best way
            this.checkAdminStatus(this.props.currentUser)
            console.log(this.props.week)
            this.setState({ weekSelect: this.props.week, seasonSelect: this.props.season });
        }
    }

    componentDidMount() {
        if (typeof this.props.season !== `undefined`) {
            this.setState({ seasonSelect: this.props.season });
        }
        if (typeof this.props.week !== `undefined`) {
            console.log(this.props.week)
            this.setState({ weekSelect: this.props.week });
        }
        if (typeof this.props.currentUser !== `undefined`) {
            this.checkAdminStatus(this.props.currentUser);
        }
    }

    checkAdminStatus = (currentUser) => {
        if (currentUser.isAdmin === false) {
            this.props.history.push(Routes.home);
        }
    };

    showPlayerEditor = () => {
        this.setState({ playerEditor: true, userEditor: false, groupEditor: false });
    };

    showUserEditor = () => {
        this.setState({ playerEditor: false, userEditor: true, groupEditor: false });
    };

    showGroupEditor = () => {
        this.setState({ playerEditor: false, userEditor: false, groupEditor: true });
    };

    createAllRosters = async () => {
        const dbResponse = await axios.post(`/api/createAllRosters/${this.state.seasonSelect}`);
        console.log(dbResponse)
    };

    getMatchups = async () => {
        const dbResponse = await axios.post(`/api/pullMatchUpsForDB/${this.state.seasonSelect}/${this.state.weekSelect}`);
        console.log(dbResponse)
    };

    //This is to handle the change for the Input Type in the position search below
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        const { playerEditor, userEditor, groupEditor } = this.state;

        return (
            this.props.currentUser.isAdmin ?
                <Container fluid={true}>
                    <Row>
                        <Col sm='12' md='3'>
                            <Label for='seasonSelect'>Select Season</Label>
                            <Input value={this.state.seasonSelect} type='select' name='seasonSelect' id='seasonSelect' onChange={this.handleChange}>
                                <option>2019-2020-regular</option>
                                <option>2020-2021-regular</option>
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
                            <br />
                            <br />
                            <Button color='primary' onClick={this.showGroupEditor}>Group Editor</Button>
                            <br />
                            <br />
                            <Button color='primary' onClick={this.createAllRosters}>Create All Rosters</Button>
                            <br />
                            <br />
                            <Button color='primary' onClick={this.getMatchups}>Get Matchups</Button>
                        </Col>
                        <Col sm='12' md='9'>
                            {playerEditor &&
                                <PlayerEditor week={this.state.weekSelect} season={this.state.seasonSelect} groupId={this.props.groupId} />
                            }
                            {userEditor &&
                                <UserEditor week={this.state.weekSelect} season={this.state.seasonSelect} />
                            }
                            {groupEditor &&
                                <GroupEditor week={this.state.weekSelect} season={this.state.seasonSelect} />
                            }
                        </Col>
                    </Row>
                </Container>
                :
                <div>
                    {/* IF the user is not an admin, return a blank div so they can't see anything */}
                </div>
        )
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AdminPanel);