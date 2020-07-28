import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Input, Form, FormGroup, Button, Row, Col } from 'reactstrap';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ReactTable from 'react-table';

import 'react-table/react-table.css';
import './userEditorStyle.css';

const Alert = withReactContent(Swal);

class UserEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSelected: false,
            selectedUser: {
                username: ''
            },
            groupSelect: ``,
            userArray: [],
            loading: true,
            QB: 0,
            RB1: 0,
            RB2: 0,
            WR1: 0,
            WR2: 0,
            Flex: 0,
            TE: 0,
            K: 0
        };
    };

    componentDidMount() {
        axios.get(`/api/getAllUsers`).then(res => {
            this.setState({ loading: false, userArray: res.data });
        });
    };

    loading() {
        Alert.fire({
            title: 'Loading',
            text: 'Working your request',
            imageUrl: 'https://media.giphy.com/media/3o7aDczpCChShEG27S/giphy.gif',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'Loading Football',
            showConfirmButton: false,
            showCancelButton: false
        });
    };
    doneLoading() {
        Alert.close()
    };

    dummyRoster = async () => {
        const dummyRoster = [
            this.state.QB,
            this.state.RB1,
            this.state.RB2,
            this.state.WR1,
            this.state.WR2,
            this.state.Flex,
            this.state.TE,
            this.state.K
        ];

        await axios.put(`/api/dummyRoster/`,
            { userId: this.state.selectedUser._id, groupId: this.state.groupSelect, season: this.props.season, week: this.props.week, dummyRoster });
        // this.setState({ QB: 0, RB1: 0, RB2: 0, WR1: 0, WR2: 0, Flex: 0, TE: 0, K: 0 })
    };

    createRoster = async () => {
        const dbResponse = await axios.post(`/api/createRoster/${this.state.selectedUser}`);
        console.log(dbResponse)
    };

    //This is to handle the change for the Input Type in the position search below
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    selectUser = (user) => {
        this.setState({ selectedUser: user, isSelected: true, groupSelect: user.groupList[0] })
    };

    calculateScores = async () => {
        this.loading();
        await axios.get(`/api/calculateScore/${this.props.season}/${this.props.week}/`);
        this.doneLoading();
    };

    fillDummyRoster = () => {
        this.setState({
            QB: 7549,
            RB1: 8285,
            RB2: 9791,
            WR1: 9952,
            WR2: 7013,
            Flex: 7380,
            TE: 7299,
            K: 6997
        });
    };

    render() {
        return (
            <div>
                <Row>
                    <Col xs='6'>
                        <SelectedUser selectedUser={this.state.selectedUser} />
                    </Col>
                    <Col xs='6'>
                        {this.state.isSelected &&
                            <Input value={this.state.groupSelect} type='select' name='groupSelect' id='groupSelect' onChange={this.handleChange}>
                                {this.state.selectedUser.groupList.map((group, i) =>
                                    <option key={i}>{group}</option>)}
                            </Input>
                        }
                    </Col>
                </Row>
                <Row>
                    <Col xs='12'>
                        <Button onClick={this.calculateScores} color='primary' className='calculateScoreButton'>
                            Update Scores
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form onSubmit={this.dummyRoster}>
                            <FormGroup>
                                <Row>
                                    <Col sm='12' md='6'>
                                        <div className='playerIdInput'>
                                            <Row>
                                                <Col sm='12' md='2' className='positionColumn'>
                                                    QB
                                                </Col>
                                                <Col sm='12' md='10'>
                                                    <Input value={this.state.QB} type='text' name='QB' id='QB' onChange={this.handleChange} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm='12' md='2' className='positionColumn'>
                                                    RB1
                                                </Col>
                                                <Col sm='12' md='10'>
                                                    <Input value={this.state.RB1} type='text' name='RB1' id='RB1' onChange={this.handleChange} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm='12' md='2' className='positionColumn'>
                                                    RB2
                                                </Col>
                                                <Col sm='12' md='10'>
                                                    <Input value={this.state.RB2} type='text' name='RB2' id='RB2' onChange={this.handleChange} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm='12' md='2' className='positionColumn'>
                                                    WR1
                                                </Col>
                                                <Col sm='12' md='10'>
                                                    <Input value={this.state.WR1} type='text' name='WR1' id='WR1' onChange={this.handleChange} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm='12' md='2' className='positionColumn'>
                                                    WR2
                                                </Col>
                                                <Col sm='12' md='10'>
                                                    <Input value={this.state.WR2} type='text' name='WR2' id='WR2' onChange={this.handleChange} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm='12' md='2' className='positionColumn'>
                                                    Flex
                                                </Col>
                                                <Col sm='12' md='10'>
                                                    <Input value={this.state.Flex} type='text' name='Flex' id='Flex' onChange={this.handleChange} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm='12' md='2' className='positionColumn'>
                                                    TE
                                                </Col>
                                                <Col sm='12' md='10'>
                                                    <Input value={this.state.TE} type='text' name='TE' id='TE' onChange={this.handleChange} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm='12' md='2' className='positionColumn'>
                                                    K
                                                </Col>
                                                <Col sm='12' md='10'>
                                                    <Input value={this.state.K} type='text' name='K' id='K' onChange={this.handleChange} />
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                    {this.state.isSelected &&
                                        <Col sm='12' md='6'>
                                            {/* If the admin hasn't yet selected a user then they will not be allowed to view */}
                                            <Button onClick={this.fillDummyRoster} disabled={!this.state.selectedUser} className='userEditorButton'>
                                                Fill Dummy Roster
                                            </Button>
                                            <Button color='secondary' onClick={this.dummyRoster} disabled={!this.state.selectedUser} className='userEditorButton'>
                                                Submit Dummy Roster
                                            </Button>
                                            <Button color='info' onClick={this.createRoster} disabled={!this.state.selectedUser} className='userEditorButton rightButton'>
                                                TODO Create User Roster
                                        </Button>
                                        </Col>
                                    }
                                </Row>
                            </FormGroup>
                        </Form>
                    </Col>
                </Row>
                <UserTable userArray={this.state.userArray} loading={this.state.loading} selectUser={this.selectUser} />
            </div>
        );
    };
};

const SelectedUser = (props) => {
    return (
        <div className='selectedUser'>
            Selected User: <input value={props.selectedUser.username} type='text' disabled />
        </div>
    );
};

const UserTable = (props) => {
    return (
        <Row>
            <Col xs='12'>
                <ReactTable
                    data={props.userArray}
                    columns={[
                        { Header: 'Username', accessor: 'username', show: true },
                        { Header: 'email', accessor: 'email', show: true },
                        { Header: 'Id', accessor: '_id', show: true }
                    ]}
                    loading={props.loading}
                    filterable
                    defaultPageSize={20}
                    className="-highlight"
                    getTdProps={(state, rowInfo) => {
                        return {
                            onClick: () => {
                                if (!rowInfo) { return };
                                props.selectUser(rowInfo.original);
                            }
                        };
                    }}
                />
            </Col>
        </Row>
    );
};


const condition = authUser => !!authUser;

export default withAuthorization(condition)(UserEditor);

//These should really be taken together since they're used together
export { UserTable, SelectedUser };