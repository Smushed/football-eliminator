import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

import './groupStyle.css';

class CreateGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rosterPositions: [],
            positionMap: [],
            maxOfPosition: [],
            errorPositions: '', //String to give user an error message
            groupName: '',
            groupDesc: '',
            groupPosChose: ['QB'],
            dbReadyGroupPos: [{ I: 1, N: 'QB' }],
            groupNameValid: false,
            groupDescValid: false,
            groupPosValid: true,
            showScore: false,
            scoringMap: {},
            enteredScore: {},
        };
    };

    componentDidMount() {
        this.getRosterPositions();
    };

    getRosterPositions = async () => {
        const dbResponse = await axios.get(`/api/getRosterPositions`);
        const { rosterPositions, positionMap, maxOfPosition } = dbResponse.data;
        this.setState({ rosterPositions, positionMap, maxOfPosition });
    };

    handleSubmit = async event => {
        event.preventDefault();
        console.log(`hit`)
    };

    handleChange = e => {
        //Breaking this out due to the input validation
        const { name, value } = e.target;

        this.setState({ [e.target.name]: e.target.value },
            () => this.validateForm(name, value));
    };

    updateGroupsScore = (e) => {

    };

    handleRosterUpdate = e => {
        const { name, value } = e.target;
        const groupPositions = this.state.groupPosChose.slice(0);
        groupPositions[name] = value;
        this.setState({ groupPosChose: groupPositions },
            () => this.convertForDB(groupPositions));
    };

    convertForDB = (groupPositions) => {
        const dbReadyPositions = groupPositions.slice(0);
        for (let i = 0; i < groupPositions.length; i++) {
            dbReadyPositions[i] = this.state.rosterPositions.find(position => position.N === groupPositions[i]);
        };
        this.setState({ dbReadyGroupPos: dbReadyPositions },
            () => this.validateForm('groupPos', dbReadyPositions));

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
                this.setState({ groupDescValid: validCheck });
                break;
            case `groupPos`:
                const groupPosMap = [];
                for (const groupPos of value) {
                    groupPosMap.push(this.state.positionMap[groupPos.I]);
                };
                validCheck = this.countPositions(groupPosMap);
                this.setState({ groupPosValid: validCheck });
                break;
            default:
                break;
        };
    };

    countPositions = (groupPosMap) => {
        let tooMany = [];
        const positionCount = [0, 0, 0, 0, 0];
        for (let i = 0; i < groupPosMap.length; i++) {
            for (let ii = 0; ii < groupPosMap[i].length; ii++) {
                positionCount[groupPosMap[i][ii]]++
            };
        };
        for (let iii = 0; iii < positionCount.length; iii++) {
            if (positionCount[iii] > this.state.maxOfPosition[iii]) {
                tooMany.push(this.state.rosterPositions[iii].N)
            };
        };
        if (tooMany.length > 0) {
            let errorMessage = '';
            for (let iiii = 0; iiii < tooMany.length; iiii++) {
                errorMessage += ` ${tooMany[iiii]}`;
            };
            this.setState({ errorPositions: errorMessage })
            return false;
        } else {
            return true;
        }
    };

    addPosition = () => {
        const groupPositions = this.state.groupPosChose.slice(0);
        if (groupPositions.length <= 12) {
            groupPositions.push('QB');
            this.setState({ groupPosChose: groupPositions },
                () => this.convertForDB(groupPositions));
        }
    };

    removePosition = () => {
        const groupPositions = this.state.groupPosChose.slice(0);
        if (groupPositions.length > 1) {
            groupPositions.pop();
            this.setState({ groupPosChose: groupPositions },
                () => this.convertForDB(groupPositions));
        };
    };

    openScore = async () => {
        const newGroupScore = {};
        const dbResponse = await axios.get(`/api/getScoring`);
        this.setState({ scoringMap: dbResponse.data });
        console.log(this.state.scoringMap)

        //Create the new group scoring object
        for (const bucket of dbResponse.data.buckets) {
            newGroupScore[bucket] = {};
            for (const key of dbResponse.data[bucket]) {
                newGroupScore[bucket][key] = 0;
            };
        };

        this.setState({ showScore: true, enteredScore: newGroupScore })
    };

    render() {
        // const groupValid = (this.state.groupNameValid & this.state.groupDescValid & this.state.groupPosValid);
        const groupValid = true;

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
                        <input className='form-control' type='text' name='groupDesc' placeholder='Burninating the Competition' value={this.state.groupDesc} onChange={this.handleChange} />
                        <small>Must be at least 6 characters</small>
                    </div>
                    <div className='form-group'>
                        <div>
                            Add or Remove Roster Spots
                            <div>
                                <button type='button' onClick={() => this.addPosition()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" /></svg>
                                </button>
                                <button type='button' onClick={() => this.removePosition()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 10h24v4h-24z" /></svg>
                                </button>
                            </div>
                        </div>
                        {this.state.groupPosChose.map((position, i) => {
                            return <select className='form-control' onChange={this.handleRosterUpdate} name={i} key={`groupPos-${i}`} value={this.state.groupPosChose[i]}>
                                {this.state.rosterPositions.map((possiblePos, ii) => <option value={possiblePos.N} key={`possiblePos-${ii}`}>{possiblePos.N}</option>)}
                            </select>
                        })}
                    </div>
                    <div className='form-group'>
                        <button type='button' onClick={() => this.openScore()} disabled={!groupValid}>
                            Enter Scores
                        </button>
                    </div>
                    {this.state.showScore &&
                        <div className='form-group'>
                            <div className='scoringContainer'>
                                {this.state.scoringMap.buckets.map(bucket =>
                                    <div className='scoringGroup' key={bucket}>
                                        {this.state.scoringMap[bucket].map((bucketKey, ii) =>
                                            <ScoringRow
                                                description={this.state.scoringMap[`${bucket}Description`][ii]}
                                                bucket={bucket}
                                                bucketKey={bucketKey}
                                                val={this.state.enteredScore[bucket][bucketKey]}
                                                onChange={this.updateGroupsScore}
                                                key={`${bucket}${bucketKey}`} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                </form>
            </Fragment>
        )
    };
};

const ScoringRow = (props) => (
    <div>
        {props.bucket} {props.bucketKey} {props.val}
        <label>{props.description}</label>
        <input className='form-control' type='text' name={props} value={props.val} onChange={props.handleChange} />
    </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CreateGroup);