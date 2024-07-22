import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import * as Routes from '../../constants/routes.js';
import Session from '../Session/index.js';
import { CurrentUserContext, NFLScheduleContext } from '../../App.js';
import { axiosHandler, httpErrorHandler } from '../../utils/axiosHandler.js';
import './grouplistStyle.css';

const Alert = withReactContent(Swal);

const GroupListPage = () => {
  const [grouplist, updateGroupList] = useState([]);

  const { currentUser } = useContext(CurrentUserContext);
  const { getSeasonAndWeek } = useContext(NFLScheduleContext);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel('Unmounted');
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser.grouplist) {
      getSeasonAndWeek();
      getGrouplist();
      if (currentUser.grouplist.length === 0) {
        welcomeModal();
      }
    }
  }, [currentUser.grouplist]);

  const welcomeModal = () => {
    Alert.fire({
      title: 'Welcome to the Eliminator!',
      customClass: {
        htmlContainer: 'alertText',
      },
      html: `Here we play fantasy football with a twist:
            <br />
            <br />
            Each week set a lineup while having access to every offensive player in the NFL. 
            <br />
            <br />
            But, you can only play each player one time per season. 
            <br />
            <br />
            Join a group or create one to begin filling out a roster.
            <br />
            Good Luck!`,
    });
  };

  const getGrouplist = async () => {
    try {
      const res = await axiosHandler.get('/api/group/list', axiosCancel.token);
      updateGroupList(res.data);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  return (
    <div className='container'>
      <div className='row'>
        <h2 className='col-12 text-center header mt-3'>Active Groups</h2>
      </div>

      <div className='row justify-content-center'>
        <div className='col-12 col-xl-8'>
          {grouplist.map((group) => (
            <GroupRow key={`${group.groupId}`} group={group} />
          ))}
        </div>
      </div>
      <div className='row  mt-3'>
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
    </div>
  );
};

const GroupRow = ({ group }) => {
  const [topScore, setTopScore] = useState('');
  const [scoreTooltip, setScoreTooltip] = useState('');
  const [isInGroup, setIsInGroup] = useState(false);
  const [firstAdmin, setFirstAdmin] = useState({});

  const { currentUser, pullUserData } = useContext(CurrentUserContext);
  const { currentNFLTime } = useContext(NFLScheduleContext);

  const axiosCancel = axios.CancelToken.source();
  const history = useHistory();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    getTopScore(group.groupId, currentNFLTime.season);
    buildScoreTooltip(
      group.groupId,
      currentNFLTime.season,
      currentNFLTime.week
    );
    setFirstAdmin(group.userlist.find((user) => user.admin === true));
    if (group.userlist.length >= 1 && currentUser.userId) {
      checkInGroup(currentUser.userId);
    }
  }, [
    group.groupId,
    group.userlist,
    currentNFLTime.season,
    currentUser.userId,
  ]);

  const getTopScore = async (groupId, season) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/topScore/${groupId}/${season}`,
        axiosCancel.token
      );
      setTopScore(`${data.username} - ${data.totalScore}`);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const buildScoreTooltip = async (groupId, season, week) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/leaderboard/${season}/${week}/${groupId}`
      );
      let buildScoreTooltip = '';
      for (const user of data.leaderboard) {
        buildScoreTooltip += `${user.username} - ${user.totalScore}<br/>`;
      }
      setScoreTooltip(buildScoreTooltip);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const checkInGroup = (uId) => {
    const userInGroup = group.userlist.find((user) => user._id === uId);
    setIsInGroup(!userInGroup);
  };

  const joinGroup = async (groupId) => {
    try {
      await axiosHandler.put('/api/group/join/', {
        userId: currentUser.userId,
        groupId: groupId,
      });
      pullUserData(currentUser.email).then(() => {
        history.push(Routes.home);
      });
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  return (
    <div className='row border rounded mt-3'>
      <Tooltip id='scoreTooltip' />
      <div className='row justify-content-center'>
        <div className='col-10'>
          <div className='row mt-1'>
            <div className='col-12 text-center'>
              <Link
                to={`/profile/group/${group.name}`}
                className='link-dark fs-4 fw-bold me-3'
              >
                {group.name}
              </Link>

              {isInGroup && (
                <button
                  className='btn btn-primary btn-sm mb-2'
                  onClick={() => joinGroup(group.groupId)}
                >
                  Join
                </button>
              )}
            </div>
          </div>
          <div className='row mb-2'>
            <div className='col-12 col-md-6'>
              <div className='row'>
                <h6 className='col-12 text-center text-md-start'>
                  {group.description}
                </h6>
              </div>
              <div className='row justify-content-center justfiy-content-md-start'>
                <div className='col-6 col-sm-3 col-md-3'>
                  <strong>Admin:</strong>
                </div>
                <div className='col-6 col-sm-5 col-md-9'>
                  {firstAdmin && firstAdmin.username}
                </div>
              </div>
            </div>
            <div
              className='col-12 col-md-4'
              data-tooltip-id='scoreTooltip'
              data-tooltip-html={scoreTooltip}
              role='button'
            >
              <div className='row justify-content-center justfiy-content-md-start'>
                <div className='col-6 col-sm-3 col-md-5'>
                  <strong>Users:</strong>
                </div>
                <div className='col-6 col-sm-5 col-md-7'>
                  {group.userlist.length}
                </div>
              </div>

              <div className='row justify-content-center justfiy-content-md-start mt-1'>
                <div className='col-6 col-sm-3 col-md-5'>
                  <strong>Top Score:</strong>
                </div>
                <div className='col-6 col-sm-5 col-md-7'>{topScore}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session(GroupListPage);
