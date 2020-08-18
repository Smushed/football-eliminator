import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

class CreateGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rosterPositions: [],
            groupName: '',
            groupDesc: '',
            groupPosChose: [{}],
            groupNameValid: false,
            groupDescValid: false,
            groupPosValid: false
        };
    };

    componentDidMount() {
        this.getRosterPositions();
    };

    getRosterPositions = async () => {
        const dbResponse = await axios.get(`/api/getRosterPositions`);
        this.setState({ rosterPositions: dbResponse.data });
    };

    handleSubmit = async event => {
        event.preventDefault();
        console.log(`hit`)
    };

    handleChange = event => {
        //Breaking this out due to the input validation
        const name = event.target.name;
        const value = event.target.value;

        this.setState({ [event.target.name]: event.target.value },
            () => this.validateForm(name, value));

    };

    validateForm = (fieldName, value) => {
        let validCheck;

        switch (fieldName) {
            case `groupName`:
                validCheck = (value.length >= 6) ? true : false;
                this.setState({ groupNameValid: validCheck });
                break;
            case `groupDesc`:
                validCheck = (value.length >= 6) ? true : false;
                this.setState({ groupDesc: validCheck });
                break;
            case `groupPositions`:
                let checkUsername = value.match(/^([a-z0-9-_])+$/i);
                let usernameLength = value.length >= 3 && value.length <= 16;
                validCheck = checkUsername && usernameLength ? true : false;
                this.setState({ usernameValid: validCheck });
                break;
            default:
                break;
        };
    };

    addPosition = () => {
        const groupPositions = this.state.groupPosChose.slice(0);
        groupPositions.push({});
        this.setState({ groupPosChose: groupPositions });
    };

    removePosition = () => {
        const groupPositions = this.state.groupPosChose.slice(0);
        if (groupPositions.length > 1) {
            groupPositions.pop();
            this.setState({ groupPosChose: groupPositions });
        };
    };

    render() {
        return (
            <Fragment>
                <div>Creating a group</div>
                <form onSubmit={this.handleSubmit}>
                    <div className='form-group'>
                        <label>Group Name</label>
                        <input className='form-control' type='text' name='groupName' placeholder='Dragons of Doom' value={this.state.groupName} onChange={this.handleChange} />
                        <small>Must be at least 6 characters</small>
                    </div>
                    <div className='form-group'>
                        <label>Group Description</label>
                        <input className='form-control' type='text' name='groupDesc' placeholder='Burninating the Competition' value={this.state.groupName} onChange={this.handleChange} />
                        <small>Must be at least 6 characters</small>
                    </div>
                    <div className='form-group'>
                        <div>
                            <button type='button' onClick={() => this.addPosition()}>
                                Plus Button
                            </button>
                            Add or Remove Roster Spots
                            <button type='button' onClick={() => this.removePosition()}>
                                Minus Button
                            </button>
                        </div>
                        {this.state.groupPosChose.map((position, i) => {
                            return <select className='form-control' name={`groupPos-${i}`}>Yup
                                {this.state.rosterPositions.map((possiblePos, i) => <option>{possiblePos.N}</option>)}
                            </select>
                        })}
                    </div>
                </form>
            </Fragment>
        )
    };
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CreateGroup);