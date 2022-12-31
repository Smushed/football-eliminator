import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import CloseSVG from '../../constants/SVG/close.svg';
import './displayBoxStyle.css';

import toast, { Toaster } from 'react-hot-toast';

const Alert = withReactContent(Swal);

//boxContent is the Id of either the user or the group
//type is either user or group.. which type it is is what the box is DISPLAYING
//      So on the group page where it's showing users, the type will be USER
const DisplayBox = ({
  boxContent,
  type,
  buttonActive,
  currUserId = null,
  currPageId,
  updatePage,
}) => {
  const [displayData, updateDisplayData] = useState({});

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    type === `user` && getUserData();
    type === `group` && getGroupData();

    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, [type]);

  const getUserData = () => {
    axios
      .get(`/api/user/profile/box/${boxContent}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        const { name, avatar, score } = res.data;
        updateDisplayData({ name, avatar, score: score.toFixed(2) });
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getGroupData = () => {
    axios
      .get(`/api/group/profile/box/${boxContent}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        const { name, avatar, score } = res.data;
        updateDisplayData({ name, avatar, score: score.toFixed(2) });
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const clickButton = async () => {
    if (currUserId === null) {
      return;
    }
    const alertTitle = `Are you sure you want to ${
      type === 'user' ? 'remove' : 'leave'
    } ${displayData.name}?`;
    const alertText = `This is final. ${
      type === 'user' ? 'Their' : 'Your'
    } scores and rosters for this group will be deleted. There is no way to reverse this.`;

    Alert.fire({
      title: alertTitle,
      text: alertText,
      type: 'warning',
      confirmButtonColor: '#DC3545',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then(async (res) => {
      if (res.value) {
        if (type === 'user') {
          kickUser();
        }
        if (type === 'group') {
          adminCheck();
        }
      }
    });
  };

  const kickUser = async () => {
    try {
      await axios.delete(
        `/api/group/user/${currPageId}/${boxContent}/${currUserId}`
      );
      updatePage();
    } catch (err) {
      toast.error(err.response.data, {
        duration: 4000,
      });
    }
  };

  const adminCheck = async () => {
    try {
      const onlyAdmin = await axios.get(
        `/api/group/admin/verify/${currPageId}/${boxContent}`,
        { cancelToken: axiosCancel.token }
      );
      if (onlyAdmin.status === 210) {
        adminPrompt(onlyAdmin.data);
      } else {
        leaveGroup();
      }
    } catch (err) {
      if (err.message !== `Unmounted`) {
        console.log(err);
      }
      toast.error('Error verifying admins, contact Kevin', {
        duration: 4000,
      });
    }
  };

  const adminPrompt = async (nonAdmins) => {
    const possibleAdmins = nonAdmins.map((user) => user.UN);
    const adminChoice = await Alert.fire({
      title: 'Select a user to be new admin of the group.',
      input: 'select',
      inputOptions: possibleAdmins,
    });

    try {
      await axios.put(
        `/api/group/admin/upgrade/${
          nonAdmins[adminChoice.value]._id
        }/${boxContent}`
      );
      leaveGroup();
    } catch (err) {
      toast.error('Error upgrading to admin, contact Kevin', {
        duration: 4000,
      });
    }
  };

  const leaveGroup = async () => {
    try {
      await axios.delete(`/api/user/group/${currPageId}/${boxContent}`);
      updatePage();
    } catch (err) {
      toast.error(err.response.data, {
        duration: 4000,
      });
    }
  };

  return (
    <div className={`displayBox ` + (buttonActive && `withButtonHeight`)}>
      <Link to={`/profile/${type}/${displayData.name}`}>
        <div className='displayBoxName'>{displayData.name}</div>
      </Link>
      <div className='displayBoxAvatarWrapper'>
        <img className='displayBoxAvatar' src={displayData.avatar} />
      </div>
      <div className='displayBoxScoreWrapper'>
        <div>{type === 'user' ? 'Score: ' : 'Top Score: '}</div>
        <div>{displayData.score}</div>
      </div>
      {buttonActive && (
        <div className='textCenter addRemoveButton'>
          {boxContent !== currUserId && (
            <button
              className='btn btn-danger btn-sm'
              onClick={() => clickButton()}
            >
              {type === 'group' ? 'Leave Group' : 'Remove User'}
              <img className='closeSVGFit' src={CloseSVG} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

DisplayBox.propTypes = {
  boxContent: PropTypes.string,
  type: PropTypes.string,
  buttonActive: PropTypes.bool, //Button Active for removing users from a group (if group page) or leaving group (if user profile page)
  currUserId: PropTypes.string,
  currPageId: PropTypes.string,
  updatePage: PropTypes.func,
};

export default DisplayBox;
