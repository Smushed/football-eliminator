import React, { useState, useEffect, useContext } from 'react';
import * as Routes from '../../constants/routes';
import Session from '../../contexts/Firebase/Session';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { CurrentUserContext } from '../../contexts/CurrentUser';
import { NFLScheduleContext } from '../../contexts/NFLSchedule';

const AdminPanel = ({ season }) => {
  const [groupSelect, setGroupSelect] = useState('');
  const [groupList, setGroupList] = useState([]);
  const [currentGroup, setCurrentGroup] = useState({});
  const [displayToggle, setDisplayToggle] = useState('group');
  const [userSelect, setUserSelect] = useState('');
  const [groupPositions, setGroupPositions] = useState({});
  const [groupScore, setGroupScore] = useState({});
  const [groupWindow, setGroupWindow] = useState('score');

  const { currentUser } = useContext(CurrentUserContext);
  const { currentNFLTime } = useContext(NFLScheduleContext);

  useEffect(() => {
    pullGroupList();
  }, []);

  useEffect(() => {
    if (currentUser.admin === false) {
      history.push(Routes.home);
    }
  }, [currentUser.admin]);

  const history = useHistory();
  const params = useParams();

  const pullGroupList = async () => {
    try {
      const { data } = await axios.get('/api/group/list');
      setGroupList(data);
      setGroupSelect(data[0].groupId);
      setCurrentGroup(data[0]);
      setUserSelect(data[0].userlist[0]._id);
      pullGroupPositions(data[0].groupId);
      pullGroupScore(data[0].groupId);
    } catch (err) {
      toast.error(err, { position: 'top-right', duration: 10000 });
      console.log({ err });
    }
  };

  const saveGroupInformation = async () => {
    try {
      await axios.put(
        '/api/group',
        {
          data: {
            name: currentGroup.name,
            description: currentGroup.description,
            groupId: currentGroup.groupId,
          },
        },
        { headers: { token: getAuth().currentUser.accessToken } }
      );
      toast.success('Group updated successfully', {
        position: 'top-right',
        duration: 4000,
      });
    } catch (err) {
      toast.error(err.response.data, {
        position: 'top-right',
        duration: 4000,
      });
    }
  };

  const pullUserDetails = async (userId) => {
    const fullSeason = await axios.get(
      `/api/roster/fullSeason/${userId}/${groupSelect}/${currentNFLTime.season}`
    );
  };

  const pullGroupPositions = async (groupId) => {
    // const { data } = await axios.get(`/api/group/profile/${groupName}`);
    console.log({ groupPositions: data });
    setGroupPositions(data);
  };

  const pullGroupScore = async (groupId) => {
    const { data } = await axios.get(`/api/group/scoring/${groupId}`);
    console.log({ groupScore: data });
    setGroupScore(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'groupSelect') {
      setGroupSelect(value);
      setCurrentGroup(groupList.find((group) => group.groupId === value));
      pullGroupPositions(value);
      pullGroupScore(value);
    }
    if (name === 'userSelect') {
      setUserSelect(value);
      pullUserDetails(value);
    }
    if (name === 'groupDescription') {
      if (value.length < 6) {
        toast.error('Description must be at least 6 characters long');
        return;
      }
      setCurrentGroup({ ...currentGroup, description: value });
    }
    if (name === 'groupName') {
      if (value.length < 6) {
        toast.error('Group name must be at least 6 characters long');
        return;
      }
      setCurrentGroup({ ...currentGroup, name: value });
    }
  };

  return (
    <div className='container'>
      <div className='row'>
        <h2 className='col-12 text-center mt-3'>Group to Edit</h2>
      </div>
      <div className='row justify-content-center mb-3'>
        <div className='col-12 col-md-3 mt-2'>
          <select
            className='form-select'
            type='select'
            name='groupSelect'
            value={groupSelect}
            onChange={handleChange}
          >
            {groupList.map((group) => (
              <option key={group.groupId} value={group.groupId}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='border-bottom'></div>
      <div className='row justify-content-center'>
        <div className='col-12 col-md-6 text-center mt-2'>
          <button
            className='btn btn-primary'
            onClick={() => setDisplayToggle('group')}
          >
            Group Edit
          </button>
        </div>
        <div className='col-12 col-md-6 text-center mt-2'>
          <button
            className='btn btn-primary'
            onClick={() => setDisplayToggle('player')}
          >
            Player Edit
          </button>
        </div>
      </div>
      <div className='row mt-3'>
        {currentGroup.name && (
          <>
            <div className='col-12'>
              <small htmlFor='groupName'>Group Name</small>
              <input
                disabled={displayToggle !== 'group'}
                value={currentGroup.name}
                onChange={handleChange}
                name='groupName'
                className='form-control'
              />
            </div>
            <div className='col-12'>
              <small htmlFor='groupDescription' className='form-label'>
                Description
              </small>
              <textarea
                disabled={displayToggle !== 'group'}
                name='groupDescription'
                className='form-control'
                rows='3'
                value={currentGroup.description}
                onChange={handleChange}
              />
            </div>

            {displayToggle === 'group' ? (
              <div className='row mt-2 justify-content-center'>
                <div className='col-6'>
                  <div className='col-6'>
                    <button
                      className='btn btn-primary'
                      onClick={saveGroupInformation}
                    >
                      Save Group Information
                    </button>
                  </div>
                </div>
                <div className='col-6'>
                  <div className='col-12'>
                    <button
                      className='btn btn-primary'
                      onClick={() => setGroupWindow('score')}
                    >
                      Edit Group Score
                    </button>
                  </div>
                  <div className='col-12 mt-2'>
                    <button
                      className='btn btn-primary'
                      onClick={() => setGroupWindow('position')}
                    >
                      Edit Group Positions
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className='row mt-3 justify-content-center'>
                <div className='col-12 col-md-6'>
                  <select
                    className='form-select'
                    type='select'
                    name='userSelect'
                    value={userSelect}
                    onChange={handleChange}
                  >
                    {currentGroup.userlist.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* <div className='row justify-content-center mt-3'>
        <div className='col-12 col-md-3'>
          <label htmlFor='seasonSelect'>Select Season</label>
          <select
            className='form-select'
            value={seasonSelect}
            type='select'
            name='seasonSelect'
            onChange={handleChange}
          >
            <option>2019-2020-regular</option>
            <option>2020-2021-regular</option>
            <option>2021-2022-regular</option>
            <option>2022-2023-regular</option>
            <option>2023-2024-regular</option>
            <option>2024-2025-regular</option>
          </select>
          <label htmlFor='weekSelect'>Select Week</label>
          <select
            className='form-select'
            value={weekSelect}
            type='select'
            name='weekSelect'
            onChange={handleChange}
          >
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
            <option>18</option>
          </select>
        </div>
        <div className='col-12 col-md-2 d-flex align-items-center'>
          <button
            className='btn btn-primary'
            onClick={() => searchSeasonWeekForGroup()}
          >
            Search Week
          </button>
        </div>
      </div> */}
      <div className='row'>
        {/* {weeklyGroupRosters.map((roster) => (
          <div className='col-xs-12 col-lg-6' key={roster.username}>
            <AdminRosterDisplay
              roster={roster.roster}
              pastLockWeek={true}
              headerText={`${
                roster.username +
                (roster.username.slice(-1) === 's' ? "'" : "'s")
              } Roster`}
            />
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default Session(AdminPanel);
