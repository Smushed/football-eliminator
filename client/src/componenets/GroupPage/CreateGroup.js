import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import PropTypes from 'prop-types';

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
    }

    componentDidMount() {
        this.getRosterPositions();
    }

    getRosterPositions = async () => {
        const dbResponse = await axios.get(`/api/roster/positions`);
        const { rosterPositions, positionMap, maxOfPosition } = dbResponse.data;
        this.setState({ rosterPositions, positionMap, maxOfPosition });
    };

    handleSubmit = async event => {
        event.preventDefault();
        const sanitizedScore = {};
        for (const [key, value] of Object.entries(this.state.enteredScore)) {
            sanitizedScore[key] = {};
            for (const [innerKey, innerValue] of Object.entries(this.state.enteredScore[key])) {
                if (innerValue === `-`) {
                    sanitizedScore[key][innerKey] = 0;
                } else {
                    sanitizedScore[key][innerKey] = innerValue;
                }
            }
        }
        axios.post(`/api/createGroup`,
            {
                userId: this.props.userId,
                newGroupScore: sanitizedScore,
                groupName: this.state.groupName.trim(),
                groupDesc: this.state.groupDesc.trim(),
                groupPositions: this.state.dbReadyGroupPos,
            })
            .then(res => {
                console.log(res.data)
                window.location.reload(false);
            });
    };

    handleChange = e => {
        //Breaking this out due to the input validation
        const { name, value } = e.target;

        this.setState({ [e.target.name]: e.target.value },
            () => this.validateForm(name, value));
    };

    updateGroupsScore = (e) => {
        let { name, value } = e.target;
        let maxLength = 0;
        if (value >= 10) {
            maxLength = 5;
        } else if (value <= -10) {
            maxLength = 6
        } else {
            maxLength = 4;
        }
        if (value === `-`) {
            //Do Nothing
        } else if (isNaN(+value)) {
            return;
        } else if (value > 100) {
            return;
        } else if (value < -100) {
            return;
        } else if (value.length > maxLength) {
            return;
        }
        const [bucket, bucketKey] = name.split(`-`);
        const updatedScore = { ...this.state.enteredScore };
        updatedScore[bucket][bucketKey] = value;
        this.setState({ enteredScore: updatedScore });
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
        }
        this.setState({ dbReadyGroupPos: dbReadyPositions },
            () => this.validateForm('groupPos', dbReadyPositions));

    };

    validateForm = (fieldName, value) => {
        let validCheck;

        switch (fieldName) {
            case `groupName`: {
                validCheck = (value.length >= 6) ? true : false;
                this.setState({ groupNameValid: validCheck });
                break;
            }
            case `groupDesc`: {
                validCheck = (value.length >= 6) ? true : false;
                this.setState({ groupDescValid: validCheck });
                break;
            }
            case `groupPos`: {
                const groupPosMap = [];
                for (const groupPos of value) {
                    groupPosMap.push(this.state.positionMap[groupPos.I]);
                }
                validCheck = this.countPositions(groupPosMap);
                this.setState({ groupPosValid: validCheck });
                break;
            }
            default: {
                break;
            }
        }
    };

    countPositions = (groupPosMap) => {
        let tooMany = [];
        const positionCount = [0, 0, 0, 0, 0];
        for (let i = 0; i < groupPosMap.length; i++) {
            for (let ii = 0; ii < groupPosMap[i].length; ii++) {
                positionCount[groupPosMap[i][ii]]++
            }
        }
        for (let iii = 0; iii < positionCount.length; iii++) {
            if (positionCount[iii] > this.state.maxOfPosition[iii]) {
                tooMany.push(this.state.rosterPositions[iii].N)
            }
        }
        if (tooMany.length > 0) {
            let errorMessage = '';
            for (let iiii = 0; iiii < tooMany.length; iiii++) {
                errorMessage += ` ${tooMany[iiii]}`;
            }
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
        }
    };

    openScore = async () => {
        const newGroupScore = {};
        const dbResponse = await axios.get(`/api/getScoring`);
        this.setState({ scoringMap: dbResponse.data });

        //Create the new group scoring object
        for (const bucket of dbResponse.data.buckets) {
            newGroupScore[bucket] = {};
            for (const key of dbResponse.data[bucket]) {
                newGroupScore[bucket][key] = dbResponse.data.defaultScores[bucket][key];
            }
        }

        this.setState({ showScore: true, enteredScore: newGroupScore });
    };

    render() {
        const groupValid = (this.state.groupNameValid & this.state.groupDescValid & this.state.groupPosValid);

        return (
            <Fragment>
                <div className='createGroupHeader'>
                    Creating a group
                </div>
                <form onSubmit={this.handleSubmit}>
                    <div className='form-group createGroupFormContainer'>
                        <div className='formLabel'>
                            Group Name
                        </div>
                        <div className='createGroupInput'>
                            <input className='form-control' type='text' name='groupName' placeholder='Dragons of Doom' value={this.state.groupName} onChange={this.handleChange} />
                        </div>
                        <small>Must be at least 6 characters</small>
                    </div>
                    <div className='form-group'>
                        <div className='form-group createGroupFormContainer'>
                            <div className='formLabel'>
                                Group Description
                            </div>
                            <div className='createGroupInput'>
                                <input className='form-control' type='text' name='groupDesc' placeholder='Burninating the Competition' value={this.state.groupDesc} onChange={this.handleChange} />
                            </div>
                            <small>Must be at least 6 characters</small>
                        </div>
                    </div>
                    <div className='form-group'>
                        <div className='addRemovePositions'>
                            Add or Remove Roster Spots
                            <div>
                                <button type='button' className='btn btn-outline-secondary btn-sm addRemoveButton' onClick={() => this.addPosition()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" /></svg>
                                </button>
                                <button type='button' className='btn btn-outline-secondary btn-sm addRemoveButton' onClick={() => this.removePosition()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 10h24v4h-24z" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className='positionSelectInput'>
                            {this.state.groupPosChose.map((position, i) => {
                                return <div className='positionSelectBox' key={`groupPosWrapper-${i}`}>
                                    <select className='form-control' onChange={this.handleRosterUpdate} name={i} key={`groupPos-${i}`} value={this.state.groupPosChose[i]}>
                                        {this.state.rosterPositions.map((possiblePos, ii) => <option value={possiblePos.N} key={`possiblePos-${ii}`}>{possiblePos.N}</option>)}
                                    </select>
                                </div>
                            })}
                        </div>
                    </div>
                    <div className='form-group'>
                        <div className='form-group createGroupFormContainer'>
                            <button type='button' className='btn btn-primary' onClick={() => this.openScore()} disabled={!groupValid}>
                                Enter Scores
                        </button>
                        </div>
                    </div>
                    {this.state.showScore &&
                        <div className='form-group'>
                            <div className='createGroupExplain'>
                                Scores must range from -100 to 100 and cannot go more than two places past the decimal
                            </div>
                            <div className='scoringContainer'>
                                {this.state.scoringMap.buckets.map((bucket, i) =>
                                    <div className='scoringGroup' key={bucket}>
                                        <div className='scoringHeader'>
                                            {this.state.scoringMap.bucketDescription[i]}
                                        </div>
                                        {this.state.scoringMap[bucket].map((bucketKey, ii) =>
                                            <ScoringRow
                                                description={this.state.scoringMap[`${bucket}Description`][ii]}
                                                bucket={bucket}
                                                bucketKey={bucketKey}
                                                val={this.state.enteredScore[bucket][bucketKey]}
                                                handleChange={this.updateGroupsScore}
                                                key={`${bucket}${bucketKey}`} />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='fullWidth'>
                                <button className='btn btn-success'>Create Group!</button>
                            </div>
                        </div>
                    }
                </form>
            </Fragment>
        );
    }
}


const ScoringRow = ({ description, bucket, bucketKey, val, handleChange }) => (
    <div className='groupScoreRow'>
        <label>{description}</label>
        <input className='form-control' type='text' name={`${bucket}-${bucketKey}`} value={val} onChange={handleChange} />
    </div>
);

ScoringRow.propTypes = {
    description: PropTypes.string,
    bucket: PropTypes.string,
    bucketKey: PropTypes.string,
    val: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    handleChange: PropTypes.func
};

CreateGroup.propTypes = {
    userId: PropTypes.string,
    week: PropTypes.number,
    groupId: PropTypes.string
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CreateGroup);