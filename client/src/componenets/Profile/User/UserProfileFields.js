import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import '../profileStyle.css';

const UserProfileFields = ({
  currentUser,
  username,
  fileInputRef,
  avatar,
  updateAvatar,
  openCloseModal,
  updateModalState,
  handleChange,
  pullUserData,
  currUserEmail,
}) => {
  const axiosCancel = axios.CancelToken.source();
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [mainGroup, setMainGroup] = useState('');

  useEffect(() => {
    userProfilePull();
    return () => {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    setIsCurrentUser(username === currentUser.username);
    checkMainGroup(currentUser);
  }, [username, currentUser]);

  const userProfilePull = () => {
    axios
      .get(`/api/user/name/${username}`, { cancelToken: axiosCancel.token })
      .then((res) => {
        updateAvatar(res.data.avatar);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const repullUser = () => pullUserData(currUserEmail);

  const checkMainGroup = (currUser) => {
    if (currUser.GL !== undefined) {
      for (const group of currUser.GL) {
        if (currUser.MG === group._id) {
          setMainGroup(group.N);
          return;
        }
      }
    }
  };

  return (
    <div className='container'>
      <div className='d-flex justify-content-center mt-5 row'>
        <div className='col-2'>
          <label htmlFor='profileAvatar'>
            <img className='profileAvatar' name='avatar' src={avatar} />
          </label>
          {isCurrentUser && (
            <input
              id='groupAvatar'
              name='avatar'
              type='file'
              onChange={handleChange}
              ref={fileInputRef}
            />
          )}
        </div>
        <div className='block col-6'>
          <div className='row'>
            <h1 className='col-3 text-center'>{username}</h1>
          </div>

          <div className='row'>
            <h4 className='col-3 mr-3'>Email: </h4>
            <h5 className='col-9'>{currUserEmail}</h5>
          </div>
          <div className='row'>
            <h4 className='col-3 mr-3'>Main Group: </h4>
            <h5 className='col-9'>{mainGroup}</h5>
          </div>
          <div className='row'>
            <h4 className='col-3 mr-3'>Emails: </h4>
            <h5 className='col-9'>{'CHANGE ME'}</h5>
          </div>
          <div className='row'>
            <div className='col-6'>
              {isCurrentUser && (
                <button
                  className='btn btn-sm btn-info'
                  onClick={() => {
                    openCloseModal(true);
                    updateModalState('user');
                  }}
                >
                  Edit Information
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <div className='row'>
        <h1 className='col-12 text-center mt-4'>Your Groups:</h1>
      </div>
      <div className='d-flex justify-content-center row'>
        {currentUser.GL &&
          currentUser.GL.map((group) => (
            <GroupDisplayWithLeaderboard
              key={group._id}
              groupId={group._id}
              currentUserId={currentUser.userId}
              isCurrentUser={isCurrentUser}
              repullUser={repullUser}
            />
          ))}
      </div> */}
    </div>
  );
};

UserProfileFields.propTypes = {
  currentUser: PropTypes.object,
  username: PropTypes.string,
  fileInputRef: PropTypes.any,
  avatar: PropTypes.any,
  updateAvatar: PropTypes.func,
  openCloseModal: PropTypes.func,
  updateModalState: PropTypes.func,
  handleChange: PropTypes.func,
  pullUserData: PropTypes.func,
  currUserEmail: PropTypes.string,
};

export default UserProfileFields;
