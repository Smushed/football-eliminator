import React, { Component, Fragement } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Label, Input, Form, FormGroup, Button, Row, Col } from 'reactstrap';
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
            selectedUser: ``,
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
        console.log(`yes`)

        const dummyRoster = {
            QB: this.state.QB,
            RB1: this.state.RB1,
            RB2: this.state.RB2,
            WR1: this.state.WR1,
            WR2: this.state.WR2,
            Flex: this.state.Flex,
            TE: this.state.TE,
            K: this.state.K
        };

        const loaded = await axios.put(`/api/dummyRoster/`,
            { userId: this.state.selectedUser, season: this.props.season, week: this.props.week, dummyRoster })
        console.log(loaded)
    };


    //This is to handle the change for the Input Type in the position search below
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        const columns = [
            { Header: 'Username', accessor: 'username', show: true },
            { Header: 'email', accessor: 'email', show: true },
            { Header: 'Id', accessor: '_id', show: true }];


        return (
            <div>
                <Row>
                    <Col xs='12'>
                        <div className='selectedUser'>
                            Selected User: <Input value={this.state.selectedUser} type='text' disabled />
                        </div>
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
                                    <Col sm='12' md='6'>
                                        {/* If the admin hasn't yet selected a user then they will not be allowed to view */}
                                        <Button color='secondary' onClick={this.dummyRoster} disabled={!this.state.selectedUser} className='dummyRosterButton'>
                                            Submit Dummy Roster
                                        </Button>
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12'>
                        <ReactTable
                            data={this.state.userArray}
                            columns={columns}
                            loading={this.state.loading}
                            filterable
                            defaultPageSize={20}
                            className="-highlight"
                            getTdProps={(state, rowInfo) => {
                                return {
                                    onClick: () => {
                                        console.log(rowInfo.original)
                                        this.setState({ selectedUser: rowInfo.original._id })
                                    }
                                }
                            }}
                        />
                    </Col>
                </Row>
            </div>
        )
    }


};


const condition = authUser => !!authUser;

export default withAuthorization(condition)(UserEditor);