import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Leaderboard from '../../Leaderboard/TableLeaderboard';

import './profileStyle.css';

import DisplayBox from '../../DisplayBox';
import GroupScoreRow from './GroupScoreRow';

import PencilSVG from '../../constants/SVG/pencil.svg';

const GroupProfile = ({
  groupName,
  currentUser,
  handleChange,
  avatar,
  updateAvatar,
  groupInfo,
  updateGroupInfo,
  fileInputRef,
  openCloseModal,
  updateModalState,
}) => {
  const [adminStatus, updateAdminStatus] = useState(false);
  const [week, updateWeek] = useState(0);
  const [season, updateSeason] = useState(``);

  const [leaderboard, updateLeaderboard] = useState([]);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    if (groupName) {
      pullGroupInfo();
    }
  }, [groupName]);

  useEffect(() => {
    if (currentUser.userId && groupInfo.UL) {
      checkForAdmin(groupInfo, currentUser.userId.toString());
    }
  }, [currentUser, groupInfo.UL]);

  const pullGroupInfo = () => {
    axios
      .get(`/api/group/profile?name=${groupName}&avatar=true&positions=true`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateGroupInfo(res.data.group);
        updateAvatar(res.data.avatar);
        getLeaderboard(res.data.group._id.toString());

        if (currentUser.userId) {
          checkForAdmin(res.data.group, currentUser.userId.toString());
        }
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const checkForAdmin = (group, userId) => {
    const selfInGroup = group.UL.find((user) => user._id.toString() === userId);
    if (selfInGroup) {
      updateAdminStatus(selfInGroup.A);
    }
  };

  const getLeaderboard = (groupId) => {
    axios
      .get(`/api/nfldata/currentSeasonAndWeek`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        const { season, week } = res.data;
        updateWeek(week);
        updateSeason(season);

        axios
          .get(`/api/group/leaderboard/${season}/${week}/${groupId}`, {
            cancelToken: axiosCancel.token,
          })
          .then((res2) => updateLeaderboard(res2.data.leaderboard))
          .catch((err) => {
            if (err.message !== `Unmounted`) {
              console.log(err);
            }
          });
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  return (
    <>
      <div className='d-flex justify-content-center profileHeader container'>
        <div className='block marginHeightAuto groupProfileNameDesc'>
          <div>{groupName}</div>
          <div>{groupInfo.D}</div>
          {adminStatus && (
            <button
              className='btn btn-sm btn-info'
              onClick={() => {
                openCloseModal();
                updateModalState(`group`);
              }}
            >
              Edit Group
            </button>
          )}
        </div>
        <div className='profileAvatarWrapper'>
          <div className='editAvatarSVGWrapper'>
            <img className='editAvatarSVG' src={PencilSVG} />
          </div>
          <label htmlFor='groupAvatar'>
            <img
              className={`profileAvatar ${adminStatus ? `editAvatar` : ``}`}
              name='avatar'
              src={avatar}
            />
          </label>
          {adminStatus && (
            <input
              id='groupAvatar'
              name='avatar'
              type='file'
              onChange={handleChange}
              ref={fileInputRef}
            />
          )}
        </div>
      </div>
      <div>
        <Leaderboard
          week={week}
          season={season}
          leaderboard={leaderboard}
          groupName={groupInfo.N}
        />
        {groupInfo._id && (
          <GroupScoreRow editable={false} groupId={groupInfo._id.toString()} />
        )}
        <div className='profileDisplayHeader'>Users:</div>
        <div className='d-flex justify-content-center row'>
          {groupInfo.UL &&
            groupInfo.UL.map((user) => (
              <DisplayBox
                key={user._id}
                boxContent={user._id}
                type='user'
                buttonActive={adminStatus}
                inGroup={true}
                currUserId={currentUser.userId}
                currPageId={groupInfo._id}
                updatePage={pullGroupInfo}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default GroupProfile;
