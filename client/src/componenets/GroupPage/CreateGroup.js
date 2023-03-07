import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

import './groupStyle.css';
import * as Routes from '../../constants/routes';

import UpArrow from '../../constants/SVG/upArrow.svg';
import DownArrow from '../../constants/SVG/downArrow.svg';
import Plus from '../../constants/SVG/plus.svg';
import Minus from '../../constants/SVG/minus.svg';

import ReactTooltip from 'react-tooltip';

import Session from '../Session';

const CreateGroup = ({ email, pullUserData, userId, changeGroup, history }) => {
  const [rosterPositions, updateRosterPositions] = useState([]);
  const [positionMap, updatePositionMap] = useState([]);
  const [maxOfPosition, updateMaxOfPosition] = useState([]);
  const [groupName, updateGroupName] = useState('');
  const [groupDesc, updateGroupDesc] = useState('');
  const [groupPosChoose, updateGroupPosChoose] = useState([
    'QB',
    'RB',
    'RB',
    'WR',
    'WR',
    'TE',
    'Flex',
  ]);
  const [dbReadyGroupPos, updateDbReadyGroupPos] = useState([
    { I: 0, N: 'QB' },
    { I: 1, N: `RB` },
    { I: 1, N: `RB` },
    { I: 2, N: `WR` },
    { I: 2, N: `WR` },
    { I: 3, N: `TE` },
    { I: 6, N: `Flex` },
  ]);
  const [groupNameValid, updateGroupNameValid] = useState(false);
  const [groupDescValid, updateGroupDescValid] = useState(false);
  const [groupPosValid, updateGroupPosValid] = useState(true);
  const [showScore, updateShowScore] = useState(false);
  const [scoringMap, updateScoringMap] = useState({});
  const [enteredScore, updateEnteredScore] = useState({});

  const axiosCancel = axios.CancelToken.source();

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
    await axios
      .get(`/api/roster/positions`, { cancelToken: axiosCancel.token })
      .then((res) => {
        updateRosterPositions(res.data.rosterPositions);
        updatePositionMap(res.data.positionMap);
        updateMaxOfPosition(res.data.maxOfPosition);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const sanitizedScore = {};
    for (const [key] of Object.entries(enteredScore)) {
      sanitizedScore[key] = {};
      for (const [innerKey, innerValue] of Object.entries(enteredScore[key])) {
        if (innerValue === `-`) {
          sanitizedScore[key][innerKey] = 0;
        } else {
          sanitizedScore[key][innerKey] = innerValue;
        }
      }
    }
    axios
      .post(`/api/group/create`, {
        userId: userId,
        newGroupScore: sanitizedScore,
        groupName: groupName.trim(),
        groupDesc: groupDesc.trim(),
        groupPositions: dbReadyGroupPos,
      })
      .then((res) => {
        changeGroup(res.data._id);
        pullUserData(email).then(() => {
          history.push(Routes.home);
        });
      });
  };

  const handleChange = (e) => {
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
      maxLength = 6;
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

  const handleRosterUpdate = (e) => {
    const { name, value } = e.target;
    const groupPositions = groupPosChoose.slice(0);
    groupPositions[name] = value;
    updateGroupPosChoose(groupPositions);
  };

  const convertForDB = (groupPositions) => {
    const dbReadyPositionsCopy = groupPositions.slice(0);
    for (let i = 0; i < groupPositions.length; i++) {
      dbReadyPositionsCopy[i] = rosterPositions.find(
        (position) => position.N === groupPositions[i]
      );
    }
    updateDbReadyGroupPos(dbReadyPositionsCopy);
  };

  const validateForm = (fieldName, value) => {
    let validCheck;

    switch (fieldName) {
      case `groupName`: {
        validCheck = value.length >= 6 ? true : false;
        updateGroupNameValid(validCheck);
        break;
      }
      case `groupDesc`: {
        validCheck = value.length >= 6 ? true : false;
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
        positionCount[groupPosMap[i][ii]]++;
      }
    }
    for (let iii = 0; iii < positionCount.length; iii++) {
      if (positionCount[iii] > maxOfPosition[iii]) {
        tooMany.push(rosterPositions[iii].N);
      }
    }
    if (tooMany.length > 0) {
      let errorMessage = '';
      for (let iiii = 0; iiii < tooMany.length; iiii++) {
        errorMessage += `Too Many ${tooMany[iiii]}s`;
      }
      toast.error(errorMessage, {
        duration: 4000,
      });
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

  const openScore = () => {
    const newGroupScore = {};
    axios
      .get(`/api/getScoring`, { cancelToken: axiosCancel.token })
      .then((res) => {
        updateScoringMap(res.data);
        //Create the new group scoring object
        for (const bucket of res.data.buckets) {
          newGroupScore[bucket] = {};
          for (const key of res.data[bucket]) {
            newGroupScore[bucket][key] = res.data.defaultScores[bucket][key];
          }
        }
        updateEnteredScore(newGroupScore);
        updateShowScore(true);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const adjustPosOrder = (order, index) => {
    const groupPositions = groupPosChoose.slice(0);
    let newPos;
    if (order === 'up') {
      if (index === 0) {
        return;
      }
      newPos = index--;
    } else {
      if (index === groupPositions.length) {
        return;
      }
      newPos = index++;
    }
    const itemMoved = groupPositions.splice(index, 1)[0];
    groupPositions.splice(newPos, 0, itemMoved);
    updateGroupPosChoose(groupPositions);
  };

  const groupValid = groupNameValid & groupDescValid & groupPosValid;

  return (
    <div className='container'>
      <ReactTooltip html={true} />
      <div className='row mb-2'>
        <h2 className='col-12 text-center mt-3'>Create group</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className='row mb-4'>
          <div className='col-12 col-md-6 form-group d-flex justify-content-md-end justify-content-center'>
            <div className='row'>
              <h5 className='col-12 text-center mb-0'>Group Name</h5>
              <div className='col-12 text-center'>
                <label htmlFor='groupName'>
                  <small>Minimum 6 characters</small>
                </label>
                <input
                  className='form-control'
                  type='text'
                  name='groupName'
                  placeholder='Dragons of Doom'
                  value={groupName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className='col-12 col-md-6 form-group d-flex justify-content-md-start justify-content-center mt-3 mt-md-0'>
            <div className='row'>
              <h5 className='col-12 text-center'>Group Description</h5>
              <div className='col-12 text-center'>
                <label htmlFor='groupDesc'>
                  <small>Minimum 6 characters</small>
                </label>
                <textarea
                  className='form-control'
                  type='text'
                  name='groupDesc'
                  placeholder='Burninating the Competition'
                  value={groupDesc}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='row justify-content-center'>
          <div className='col-12 col-md-4'>
            <div className='row'>
              <h3 className='col-12 text-center'>Add / Remove Roster Spots</h3>
            </div>
            <div className='col-12 text-center'>
              <button
                type='button'
                className='btn btn-info btn-sm circleButton border'
                onClick={() => addPosition()}
              >
                <img src={Plus} />
              </button>
              <button
                type='button'
                className='btn btn-info btn-sm circleButton border ms-2'
                onClick={() => removePosition()}
              >
                <img src={Minus} />
              </button>
            </div>
          </div>

          <div className='col-12 col-md-4'>
            <div className='row'>
              {groupPosChoose.map((position, i) => {
                return (
                  <div
                    className='form-group row justify-content-center'
                    key={`groupPosWrapper-${i}`}
                  >
                    <div className='col-8'>
                      <select
                        className='form-select mb-1 col-8'
                        onChange={handleRosterUpdate}
                        name={i}
                        key={`groupPos-${i}`}
                        value={groupPosChoose[i]}
                      >
                        {rosterPositions.map((possiblePos, ii) => (
                          <option
                            value={possiblePos.N}
                            key={`possiblePos-${ii}`}
                          >
                            {possiblePos.N}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='col-4'>
                      <button
                        type='button'
                        className='btn btn-outline-info btn-sm circleButton border ms-2'
                        onClick={() => adjustPosOrder('up', i)}
                      >
                        <img src={UpArrow} />
                      </button>
                      <button
                        type='button'
                        className='btn btn-outline-info btn-sm circleButton border ms-2'
                        onClick={() => adjustPosOrder('down', i)}
                      >
                        <img src={DownArrow} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className='row mt-2 justify-content-center'>
          <div
            className='col-2 text-center'
            data-tip={`${
              !groupValid ? 'Please clear errors before proceeding' : ''
            }`}
          >
            <button
              type='button'
              className='btn btn-primary'
              onClick={() => openScore()}
              disabled={!groupValid}
            >
              Enter Scores
            </button>
          </div>
        </div>

        {showScore && (
          <div className='form-group'>
            <div className='row'>
              <div className='col-12 text-center'>
                <small>
                  Scores must range from -100 to 100 and cannot go more than two
                  places past the decimal
                </small>
              </div>
            </div>
            <div className='row justify-content-center'>
              {scoringMap.buckets.map((bucket, i) => (
                <div className='col-12 col-sm-4 col-md-2' key={bucket}>
                  <h4>{scoringMap.bucketDescription[i]}</h4>
                  {scoringMap[bucket].map((bucketKey, ii) => (
                    <ScoringRow
                      description={scoringMap[`${bucket}Description`][ii]}
                      bucket={bucket}
                      bucketKey={bucketKey}
                      val={enteredScore[bucket][bucketKey]}
                      handleChange={updateGroupsScore}
                      key={`${bucket}${bucketKey}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className='row'>
              <div className='col-12 text-center'>
                <button
                  className='btn btn-success btn-lg'
                  disabled={!groupValid}
                >
                  Create Group!
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

const ScoringRow = ({ description, bucket, bucketKey, val, handleChange }) => (
  <div className='groupScoreRow'>
    <div className='groupScoreDesc'>{description}</div>
    <input
      className='form-control groupScoreConfigInput'
      type='text'
      name={`${bucket}-${bucketKey}`}
      value={val}
      onChange={handleChange}
    />
  </div>
);

ScoringRow.propTypes = {
  description: PropTypes.string,
  bucket: PropTypes.string,
  bucketKey: PropTypes.string,
  val: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  handleChange: PropTypes.func,
};

CreateGroup.propTypes = {
  email: PropTypes.string,
  pullUserData: PropTypes.func,
  userId: PropTypes.string,
  week: PropTypes.number,
  groupId: PropTypes.string,
  changeGroup: PropTypes.func,
  history: PropTypes.object,
};

export default Session(CreateGroup);
