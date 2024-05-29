import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const GroupEditor = ({
  groupInfo,
  updatedFields,
  changeUpdatedFields,
  updateGroupInfo,
  openCloseModal,
  changeGroup,
}) => {
  const [rosterPositions, updateRosterPositions] = useState([]);
  const [positionMap, updatePositionMap] = useState([]);
  const [maxOfPosition, updateMaxOfPosition] = useState([]);
  const [groupPositions, updateGroupPositions] = useState([]);

  const [groupScore, updateGroupScore] = useState({});
  const [posDescMap, updatePosDescMap] = useState({});
  const [newGroupPos, updateNewGroupPos] = useState([]);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    if (groupInfo._id) {
      pullGroupScoring(groupInfo._id);
      getRosterPositions();
      getGroupPositions(groupInfo._id);
    }
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, [groupInfo._id]);

  const pullGroupScoring = (groupId) => {
    axios
      .get(`/api/group/scoring/${groupId}?withDesc=true`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateGroupScore(res.data.groupScore);
        updatePosDescMap({
          bucketMap: res.data.bucketMap,
          posMap: res.data.map,
        });
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getRosterPositions = () => {
    axios
      .get(`/api/roster/positions`, { cancelToken: axiosCancel.token })
      .then((res) => {
        const { rosterPositions, positionMap, maxOfPosition } = res.data;
        updateRosterPositions(rosterPositions);
        updatePositionMap(positionMap);
        updateMaxOfPosition(maxOfPosition);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getGroupPositions = (groupId) => {
    axios
      .get(`/api/group/positions/${groupId}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => updateGroupPositions(res.data))
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const handleChange = (e) => {
    if (e.target.name === `groupName`) {
      changeUpdatedFields({
        ...updatedFields,
        [e.target.name]: e.target.value,
      });
    } else if (e.target.name === `groupDesc`) {
      changeUpdatedFields({
        ...updatedFields,
        [e.target.name]: e.target.value,
      });
    } else {
      const [field] = e.target.name.split(`-`);
      if (field === `rosterPos`) {
        changeRosterPos(e.target.name, e.target.value);
      } else if (field === `groupScore`) {
        changeGroupScoreField(e.target.name, e.target.value);
      }
    }
  };

  const changeRosterPos = (name, value) => {
    // eslint-disable-next-line no-unused-vars
    const [x, index] = name.split(`-`);
    const updatedPos = rosterPositions.find((pos) => pos.N === value);
    const updatedGroupPos = [...groupPositions];
    updatedGroupPos[index] = updatedPos;

    const newPosMap = [];
    for (const pos of updatedGroupPos) {
      newPosMap.push(positionMap[pos.I]);
    }

    const underLimit = countPositions(newPosMap);
    if (underLimit) {
      updateGroupPositions(updatedGroupPos);
      changeUpdatedFields({ ...updatedFields, groupPos: `active` });
    }
  };

  const countPositions = (newPosMap) => {
    let tooMany = [];
    const positionCount = [0, 0, 0, 0, 0];
    for (let i = 0; i < newPosMap.length; i++) {
      for (let ii = 0; ii < newPosMap[i].length; ii++) {
        positionCount[newPosMap[i][ii]]++;
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
        errorMessage += ` ${tooMany[iiii]}`;
      }
      toast.error(`Too many ${errorMessage}`, {
        duration: 5000,
        position: 'top-center',
      });
      return false;
    } else {
      return true;
    }
  };

  const changeGroupScoreField = (name, value) => {
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
    // eslint-disable-next-line no-unused-vars
    const [x, bucket, bucketKey] = name.split(`-`);
    const updatedScore = { ...groupScore };
    updatedScore[bucket][bucketKey] = value;
    changeUpdatedFields({ ...updatedFields, groupScore: `active` });
    updateGroupScore(updatedScore);
  };

  const addPosition = () => {
    const updatedPositions = groupPositions.slice(0);
    if (updatedPositions.length < 12) {
      if (updatedPositions.length < 3) {
        updatedPositions.push({ I: 0, N: 'QB' });
      } else if (updatedPositions.length < 8) {
        updatedPositions.push({ I: 1, N: 'RB' });
      } else {
        updatedPositions.push({ I: 2, N: 'WR' });
      }
      updateNewGroupPos(updatedPositions);
      updateGroupPositions(updatedPositions);
      changeUpdatedFields({ ...updatedFields, groupPositions: `active` });
    }
  };

  const removePosition = () => {
    const updatedPositions = groupPositions.slice(0);
    if (updatedPositions.length > 1) {
      updatedPositions.pop();
      updateNewGroupPos(updatedPositions);
      updateGroupPositions(updatedPositions);
      changeUpdatedFields({ ...updatedFields, groupPositions: `active` });
    }
  };

  const updateGroup = () => {
    const data = {};
    if (updatedFields.groupScore === `active`) {
      data.groupScore = groupScore;
    }
    if (updatedFields.groupPositions === `active`) {
      data.groupPos = newGroupPos;
    }
    if (updatedFields.groupName !== ``) {
      data.groupName = updatedFields.groupName;
    }
    if (updatedFields.groupDesc !== ``) {
      data.groupDesc = updatedFields.groupDesc;
    }
    axios
      .put(
        `/api/group`,
        { data, id: groupInfo._id },
        { cancelToken: axiosCancel.token }
      )
      .then(() => {
        if (updatedFields.groupName !== ``) {
          changeGroup(updatedFields.groupName);
          openCloseModal();
          return;
        }
        axios
          .get(
            `/api/group/profile?name=${groupInfo.N}&avatar=true&positions=true`
          )
          .then(
            (res) => {
              updateGroupInfo(res.data.group);
              updateGroupPositions(res.data.positions);
              openCloseModal();
            },
            { cancelToken: axiosCancel.token }
          )
          .catch((err) => {
            if (err.message !== 'Unmounted') {
              toast.error('Error occured while saving', {
                duration: 5000,
              });
            }
          });
      })
      .catch((err) => {
        if (err.message !== 'Unmounted') {
          toast.error('Error occured while saving', {
            duration: 5000,
          });
        }
      });
  };

  const scoreBuckets = Object.keys(groupScore);

  return (
    <>
      <div className='groupEditorHeaderWrapper'>
        <div className='groupEditorHeaderHalf'>
          <div className='groupEditorHeader'>Name</div>
          <small className='ms-1'>Must be at least 6 characters</small>
          <input
            className='form-control'
            name='groupName'
            type='text'
            value={updatedFields.groupName}
            placeholder={groupInfo.N}
            onChange={handleChange}
          />
        </div>
        <div className='groupEditorHeaderHalf'>
          <div className='groupEditorHeader'>Description</div>
          <small className='ms-1'>Must be at least 6 characters</small>
          <input
            className='form-control groupDescInput'
            name='groupDesc'
            type='textbox'
            value={updatedFields.groupDesc}
            placeholder={groupInfo.D}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className='groupPosWrapper'>
        <div className='groupPosHeaderWrapper'>
          <div className='groupPosHeader'>Group Positions</div>
          <div>
            <small>Add or Remove Roster Spots</small>
            <div className='groupEditorAddRemoveButtons'>
              <button
                className='btn btn-outline-info btn-sm'
                onClick={addPosition}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                >
                  <path d='M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z' />
                </svg>
              </button>
              <button
                className='btn btn-outline-info btn-sm'
                onClick={removePosition}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                >
                  <path d='M0 10h24v4h-24z' />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div>
          {groupPositions.length > 0 &&
            groupPositions.map((pos, i) => (
              <div key={i} className='groupPos'>
                <select
                  className='form-select groupPosDropdowns'
                  value={pos.N}
                  name={`rosterPos-${i}`}
                  onChange={handleChange}
                >
                  {rosterPositions.map((rosPos, ii) => (
                    <option key={ii} value={rosPos.N}>
                      {rosPos.N}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </div>
      </div>
      {posDescMap.bucketMap &&
        scoreBuckets.map((bucket) => (
          <div key={bucket} className='groupScoreBucket'>
            <div className='groupScoreBucketName'>
              {posDescMap.bucketMap[bucket]}
            </div>
            <div className='groupScoreFields'>
              {Object.keys(groupScore[bucket]).map((scoreField) => (
                <div key={scoreField} className='groupScoreInputWrapper'>
                  <div>{posDescMap.posMap[bucket][scoreField]} </div>
                  <input
                    className='form-control groupScoreInput'
                    name={`groupScore-${bucket}-${scoreField}`}
                    value={groupScore[bucket][scoreField]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      <div className='submitButtonWrapper'>
        <button className='btn btn-lg btn-info' onClick={updateGroup}>
          Update Group
        </button>
      </div>
    </>
  );
};

export default GroupEditor;
