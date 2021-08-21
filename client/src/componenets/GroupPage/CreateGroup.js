import React, { useState, useEffect } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import PropTypes from 'prop-types';

import './groupStyle.css';
import * as Routes from '../../constants/routes';

const CreateGroup = ({ userId, week, groupId, changeGroup, history }) => {

    const [rosterPositions, updateRosterPositions] = useState([]);
    const [positionMap, updatePositionMap] = useState([]);
    const [maxOfPosition, updateMaxOfPosition] = useState([]);
    const [error, updateError] = useState(''); //TODO ERROR DISPLAY
    const [groupName, updateGroupName] = useState('');
    const [groupDesc, updateGroupDesc] = useState('');
    const [groupPosChoose, updateGroupPosChoose] = useState(['QB']);
    const [dbReadyGroupPos, updateDbReadyGroupPos] = useState([{ I: 1, N: 'QB' }]);
    const [groupNameValid, updateGroupNameValid] = useState(false);
    const [groupDescValid, updateGroupDescValid] = useState(false);
    const [groupPosValid, updateGroupPosValid] = useState(true);
    const [showScore, updateShowScore] = useState(false);
    const [scoringMap, updateScoringMap] = useState({});
    const [enteredScore, updateEnteredScore] = useState({});

    useEffect(() => {
        getRosterPositions();
    }, []);

    useEffect(() => {
        if (rosterPositions.length !== 0 && positionMap.length !== 0) {
            convertForDB(groupPosChoose);
        }
    }, [groupPosChoose, rosterPositions, positionMap]);

    useEffect(() => {
        if (rosterPositions.length !== 0 && positionMap.length !== 0) {
            validateForm('groupPos', dbReadyGroupPos);
        }
    }, [dbReadyGroupPos, rosterPositions, positionMap]);

    const getRosterPositions = async () => {
        const dbResponse = await axios.get(`/api/roster/positions`);
        updateRosterPositions(dbResponse.data.rosterPositions);
        updatePositionMap(dbResponse.data.positionMap); //ISSUE IS HERE
        updateMaxOfPosition(dbResponse.data.maxOfPosition);
    };

    const handleSubmit = async event => {
        event.preventDefault();
        const sanitizedScore = {};
        for (const [key, value] of Object.entries(enteredScore)) {
            sanitizedScore[key] = {};
            for (const [innerKey, innerValue] of Object.entries(enteredScore[key])) {
                if (innerValue === `-`) {
                    sanitizedScore[key][innerKey] = 0;
                } else {
                    sanitizedScore[key][innerKey] = innerValue;
                }
            }
        }
        //TODO If 400 Error then the group's name is duplicated
        axios.post(`/api/group/create`,
            {
                userId: userId,
                newGroupScore: sanitizedScore,
                groupName: groupName.trim(),
                groupDesc: groupDesc.trim(),
                groupPositions: dbReadyGroupPos,
            })
            .then(res => {
                changeGroup(res.data._id);
                history.push(Routes.home);
            });
    };

    const handleChange = e => {
        //Breaking this out due to the input validation
        const { name, value } = e.target;

        switch (name) {
            case 'groupDesc': {
                updateGroupDesc(value);
                break;
            }
            case 'groupName': {
                updateGroupName(value);
                break;
            }
        }
        validateForm(name, value);
    };

    const updateGroupsScore = (e) => {
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
        const updatedScore = { ...enteredScore };
        updatedScore[bucket][bucketKey] = value;
        updateEnteredScore(updatedScore);
    };

    const handleRosterUpdate = e => {
        const { name, value } = e.target;
        const groupPositions = groupPosChoose.slice(0);
        groupPositions[name] = value;
        updateGroupPosChoose(groupPositions);
    };

    const convertForDB = (groupPositions) => {
        const dbReadyPositionsCopy = groupPositions.slice(0);
        for (let i = 0; i < groupPositions.length; i++) {
            dbReadyPositionsCopy[i] = rosterPositions.find(position => position.N === groupPositions[i]);
        }
        updateDbReadyGroupPos(dbReadyPositionsCopy);
    };

    const validateForm = (fieldName, value) => {
        let validCheck;

        switch (fieldName) {
            case `groupName`: {
                validCheck = (value.length >= 6) ? true : false;
                updateGroupNameValid(validCheck);
                break;
            }
            case `groupDesc`: {
                validCheck = (value.length >= 6) ? true : false;
                updateGroupDescValid(validCheck);
                break;
            }
            case `groupPos`: {
                const groupPosMap = [];
                for (const groupPos of value) {
                    groupPosMap.push(positionMap[groupPos.I]);
                }
                validCheck = countPositions(groupPosMap);
                updateGroupPosValid(validCheck);
                break;
            }
            default: {
                break;
            }
        }
    };

    const countPositions = (groupPosMap) => {
        let tooMany = [];
        const positionCount = [0, 0, 0, 0, 0];
        for (let i = 0; i < groupPosMap.length; i++) {
            for (let ii = 0; ii < groupPosMap[i].length; ii++) {
                positionCount[groupPosMap[i][ii]]++
            }
        }
        for (let iii = 0; iii < positionCount.length; iii++) {
            if (positionCount[iii] > maxOfPosition[iii]) {
                tooMany.push(rosterPositions[iii].N)
            }
        }
        if (tooMany.length > 0) {
            let errorMessage = '';
            for (let iiii = 0; iiii < tooMany.length; iiii++) {
                errorMessage += ` ${tooMany[iiii]}`;
            }
            updateError(errorMessage);
            return false;
        } else {
            return true;
        }
    };

    const addPosition = () => {
        const groupPositions = groupPosChoose.slice(0);
        if (groupPositions.length < 12) {
            groupPositions.push('QB');
            updateGroupPosChoose(groupPositions);
        }
    };

    const removePosition = () => {
        const groupPositions = groupPosChoose.slice(0);
        if (groupPositions.length > 1) {
            groupPositions.pop();
            updateGroupPosChoose(groupPositions);
        }
    };

    const openScore = async () => {
        const newGroupScore = {};
        const dbResponse = await axios.get(`/api/getScoring`);
        updateScoringMap(dbResponse.data);

        //Create the new group scoring object
        for (const bucket of dbResponse.data.buckets) {
            newGroupScore[bucket] = {};
            for (const key of dbResponse.data[bucket]) {
                newGroupScore[bucket][key] = dbResponse.data.defaultScores[bucket][key];
            }
        }
        await updateEnteredScore(newGroupScore);
        updateShowScore(true);
    };

    const groupValid = (groupNameValid & groupDescValid & groupPosValid);

    return (
        <div>
            <div className='developmentNotice'>
                This page is actively under development. Please check back soon to see the updated version!
            </div>
            <div className='createGroupHeader'>
                Creating a group
            </div>
            <form onSubmit={handleSubmit}>
                <div className='form-group createGroupFormContainer'>
                    <div className='formLabel'>
                        Group Name
                    </div>
                    <div className='createGroupInput'>
                        <input className='form-control' type='text' name='groupName' placeholder='Dragons of Doom' value={groupName} onChange={handleChange} />
                    </div>
                    <small>Must be at least 6 characters</small>
                </div>
                <div className='form-group'>
                    <div className='form-group createGroupFormContainer'>
                        <div className='formLabel'>
                            Group Description
                        </div>
                        <div className='createGroupInput'>
                            <input className='form-control' type='text' name='groupDesc' placeholder='Burninating the Competition' value={groupDesc} onChange={handleChange} />
                        </div>
                        <small>Must be at least 6 characters</small>
                    </div>
                </div>
                <div className='form-group'>
                    <div className='addRemovePositions'>
                        Add or Remove Roster Spots
                        <div>
                            <button type='button' className='btn btn-outline-secondary btn-sm addRemoveButton' onClick={() => addPosition()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" /></svg>
                            </button>
                            <button type='button' className='btn btn-outline-secondary btn-sm addRemoveButton' onClick={() => removePosition()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 10h24v4h-24z" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className='positionSelectInput'>
                        {groupPosChoose.map((position, i) => {
                            return <div className='positionSelectBox' key={`groupPosWrapper-${i}`}>
                                <select className='form-control' onChange={handleRosterUpdate} name={i} key={`groupPos-${i}`} value={groupPosChoose[i]}>
                                    {rosterPositions.map((possiblePos, ii) => <option value={possiblePos.N} key={`possiblePos-${ii}`}>{possiblePos.N}</option>)}
                                </select>
                            </div>
                        })}
                    </div>
                </div>
                <div className='form-group'>
                    <div className='form-group createGroupFormContainer'>
                        <button type='button' className='btn btn-primary' onClick={() => openScore()} disabled={!groupValid}>
                            Enter Scores
                        </button>
                    </div>
                </div>
                {showScore &&
                    <div className='form-group'>
                        <div className='createGroupExplain'>
                            Scores must range from -100 to 100 and cannot go more than two places past the decimal
                        </div>
                        <div className='scoringContainer'>
                            {scoringMap.buckets.map((bucket, i) =>
                                <div className='scoringGroup' key={bucket}>
                                    <div className='scoringHeader'>
                                        {scoringMap.bucketDescription[i]}
                                    </div>
                                    {scoringMap[bucket].map((bucketKey, ii) =>
                                        <ScoringRow
                                            description={scoringMap[`${bucket}Description`][ii]}
                                            bucket={bucket}
                                            bucketKey={bucketKey}
                                            val={enteredScore[bucket][bucketKey]}
                                            handleChange={updateGroupsScore}
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
        </div>
    );
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
    groupId: PropTypes.string,
    changeGroup: PropTypes.func,
    history: PropTypes.object
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(CreateGroup);