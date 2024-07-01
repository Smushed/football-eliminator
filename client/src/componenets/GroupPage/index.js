import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import './groupStyle.css';
import * as Routes from '../../constants/routes';
import Session from '../Session';
import { CurrentUserContext, NFLScheduleContext } from '../../App.js';

const Alert = withReactContent(Swal);

const GroupPage = ({ history, pullUserData }) => {
  const [groupList, updateGroupList] = useState([]);

  const { currentUser } = useContext(CurrentUserContext);
  const { currentNFLTime } = useContext(NFLScheduleContext);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    if (!currentUser.grouplist) {
      return;
    }
    if (currentUser.grouplist.length === 0) {
      welcomeModal();
    }
    getGroupList();
  }, [currentUser.grouplist]);

  const welcomeModal = () => {
    Alert.fire({
      type: `success`,
      title: `Welcome to the Eliminator!`,
      html: `Here we play fantasy football with a twist:
            <br />
            <br />
            - Each week set a lineup while having access to every offensive player in the NFL. 
            <br />
            - But, you can only play each player one time per season. 
            <br />
            <br />
            Join a group or create one to begin filling out your roster.`,
    });
  };

  const getGroupList = async () => {
    axios
      .get(`/api/group/list`, { cancelToken: axiosCancel.token })
      .then((res) => updateGroupList(res.data))
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const joinGroup = (groupId) => {
    axios
      .put(`/api/group/join/`, {
        userId: currentUser.userId,
        groupId: groupId,
      })
      .then(() => {
        pullUserData(currentUser.email).then(() => {
          history.push(Routes.home);
        });
      });
  };

  return (
    <div className='container'>
      <div className='row'>
        <h2 className='col-12 text-center header mt-3'>Active Groups</h2>
      </div>
      <div className='row'>
        <div className='text-muted col-12 text-center'>
          Not seeing a group that interests you?
        </div>
      </div>
      <div className='row mt-1'>
        <div className='col-12 text-center'>
          <Link to={`/group/create`}>
            <button className='btn btn-outline-success btn-sm'>
              Create Group
            </button>
          </Link>
        </div>
      </div>
      <div className='row justify-content-center'>
        <div className='col-12 col-xl-8'>
          {groupList.map((group) => (
            <GroupRow
              season={currentNFLTime.season}
              key={group.id}
              group={group}
              joinGroup={joinGroup}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const GroupRow = ({ group, joinGroup, season }) => {
  const [groupAvatar, updateGroupAvatar] = useState([]);
  const [topScore, updateTopScore] = useState(0);
  const [ulTooltip, updateULTooltip] = useState(``);
  const [isInGroup, updateIsInGroup] = useState(false);

  const { currentUser } = useContext(CurrentUserContext);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    getAvatar(group.id);
    getTopScore(group.id, season);
    BuildULTooltip(group.userlist);
    if (group.userlist.length >= 1 && currentUser.userId) {
      checkInGroup(currentUser.userId);
    }
  }, [group.id, group.UL, season, currentUser.userId]);

  const getAvatar = (groupId) => {
    axios
      .get(`/api/group/avatar/${groupId}`, { cancelToken: axiosCancel.token })
      .then((res) => {
        updateGroupAvatar(res.data);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getTopScore = (groupId, season) => {
    axios
      .get(`/api/group/topScore/${groupId}/${season}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateTopScore(res.data.TS);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const BuildULTooltip = (userList) => {
    let ulTooltip = ``;
    for (const user of userList) {
      ulTooltip += `${user.UN}<br/>`;
    }
    updateULTooltip(ulTooltip);
  };

  const checkInGroup = (uId) => {
    const userInGroup = group.UL.find((user) => user._id === uId);
    updateIsInGroup(!userInGroup);
  };

  const firstAdmin = group.UL.find((user) => user.A === true);

  return (
    <div className='row border rounded mt-3'>
      <Tooltip id='userListTooltip' />
      <div className='col-sm-12 col-md-2 m-2'>
        <div className='row d-flex justify-content-center'>
          <div className='col-5 col-md-12'>
            <img
              alt={`${group.N} Avatar`}
              className='smallImg'
              src={groupAvatar}
            />
          </div>
          <div className='col-6 d-md-none'>
            <Link to={`/profile/group/${group.N}`} className='link-dark'>
              <h4>{group.N}</h4>
            </Link>
          </div>
        </div>
      </div>
      <div className='col-sm-12 col-md-9'>
        <div className='row'>
          <div className='d-none d-md-block col-12 text-center'>
            <Link to={`/profile/group/${group.N}`} className='link-dark'>
              <h4>{group.N}</h4>
            </Link>
          </div>
        </div>
        <div className='row'>
          <h6 className='col-12 col-md-6 text-center text-md-start'>
            {group.D}
          </h6>
          <div className='col-12 col-md-4'>
            <div className='row'>
              <div className='col-6 col-md-12'>
                <div className='row'>
                  <div className='col-6'>
                    <strong>Admin:</strong>
                  </div>
                  <div className='col-6'>{firstAdmin && firstAdmin.UN}</div>
                  <div
                    className='col-6'
                    data-tooltip-id='userListTooltip'
                    data-tooltip-html={ulTooltip}
                  >
                    <strong>Users:</strong>
                  </div>
                  <div
                    className='col-6'
                    data-tooltip-html={ulTooltip}
                    data-tooltip-id='userListTooltip'
                  >
                    {group.userlist.length}
                  </div>
                </div>
              </div>

              <div className='col-6 col-md-12'>
                <div className='row'>
                  <div className='col-6'>
                    <strong>Top Score:</strong>
                  </div>
                  <div className='col-6'>{topScore && topScore.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-4 text-center'>
            {isInGroup && (
              <button
                className='btn btn-outline-primary mb-2 btn-sm'
                onClick={() => joinGroup(group.id)}
              >
                Join
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session(GroupPage);
