import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import '../profileStyle.css';

//OLD DELETE THIS THING

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
    console.log({ insideProfileFields: username });
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

  const handleEmailChange = (e) => {
    const updatedVal = e.target.value === `true`;
    if (e.target.name === `leaderboardEmail`) {
      handleSubmit(updatedVal, emailPref.RE);
    } else {
      handleSubmit(emailPref.LE, updatedVal);
    }
  };

  const handleEmailSubmit = async (LE, RE) => {
    try {
      await axios.put(`/api/user/email/settings/${user._id}/${LE}/${RE}`);
    } catch (err) {
      toast.error('Save Error - Contact Admin - smushedcode@gmail.com', {
        duration: 4000,
      });
    }
    toast.success('Email Preference Saved', {
      duration: 4000,
    });
    getUserEmailPref(user._id);
  };

  return (
    <div className='container'>
      <div className='d-flex mt-5 justify-content-center row text-center'>
        <div className='col-5 border rounded'>
          <div className='block row justify-content-center'>
            <div className='col-6 mt-3'>
              <img className='rounded' name='avatar' src={avatar} />
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
          </div>
          <div className='block row justify-content-center'>
            <div className='row'>
              <h1 className='col-12'>{username}</h1>
            </div>
            <div className='row'>
              <h5 className='col-12'>{currUserEmail}</h5>
            </div>
            <div className='row'>
              <h5 className='col-12'>{mainGroup}</h5>
            </div>
            <div className='row'>
              <div className='col-12'>
                {currentUser && (
                  <>
                    <div className='mt-3'>
                      {currentUser.E && (
                        <div className='form-switch row justify-content-center'>
                          <div className='col-1'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              role='switch'
                              id='leaderboardEmailSwitch'
                              checked={currentUser.E.LE}
                              onChange={handleChange}
                              name='leaderboardEmail'
                            />
                          </div>
                          <div className='col-5 text-start'>
                            <label
                              className='form-check-label'
                              htmlFor='leaderboardEmailSwitch'
                            >
                              Leaderboard Emails
                            </label>
                          </div>
                        </div>
                      )}
                      {currentUser.E && (
                        <div className='form-switch row justify-content-center mb-1'>
                          <div className='col-1'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              role='switch'
                              id='reminderEmailSwitch'
                              checked={currentUser.E.RE}
                              onChange={handleChange}
                              name='reminderEmail'
                            />
                          </div>
                          <div className='col-5'>
                            <label
                              className='form-check-label'
                              htmlFor='reminderEmailSwitch'
                            >
                              Reminder Emails
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
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
      </div>
      <div className='d-flex mt-4 justify-content-center row text-center'>
        <div className='col-5 border rounded'>Want Texts?</div>
      </div>
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
