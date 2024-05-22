import React, { useEffect, useState, useRef, useContext } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import Session from '../../Session';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'jimp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import 'rc-slider/assets/index.css';
import '../profileStyle.css';

import { ReAuth, ImageEditor } from '../ModalWindows';
import { AvatarContext } from '../../Avatars';

import EyeSVG from '../../../constants/SVG/eye.svg';
import EyeSlashSVG from '../../../constants/SVG/eye-slash.svg';

const Alert = withReactContent(Swal);

const userFields = {
  id: '',
  username: '',
  email: '',
  password: '',
  mainGroup: '',
  leaderboardEmail: true,
  reminderEmail: true,
  groupList: [],
};

const UserProfile = ({ authUser, currentUser, firebase, pullUserData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState('reAuth');
  const [userFieldsOnPage, setUserFieldsOnPage] = useState(userFields);
  const [mainGroupName, setMainGroupName] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showHidePassword, setShowHidePassword] = useState('password');

  const fileInputRef = useRef(null);
  const axiosCancel = axios.CancelToken.source();

  const { addUserAvatarsToPull, repullUserAvatars, userAvatars } =
    useContext(AvatarContext);
  const params = useParams();

  useEffect(() => {
    setIsCurrentUser(params.name === currentUser.username);
    getMainGroupName(currentUser);
  }, [params.name, currentUser]);

  useEffect(() => {
    if (userFieldsOnPage.id === '') {
      userProfilePull(params.name);
    }
  }, [params.name]);

  const openCloseModal = (cmd) => {
    setModalOpen(cmd);
  };

  const handleChange = (e) => {
    if (e.target.name === `avatar`) {
      if (!!e.target.files[0].type.match(`image.*`)) {
        if (e.target.files[0].type === 'image/webp') {
          notSupportedImage();
          e.target.value = '';
          return;
        }
        Jimp.read(URL.createObjectURL(e.target.files[0]), async (err, img) => {
          if (err) {
            console.log(err);
            toast.error(`Error processing image!`);
            return;
          }
          const mime = await img.getBase64Async(Jimp.MIME_JPEG);
          setTempAvatar(mime);
        });
        setModalState(`avatar`);
        openCloseModal(true);
      } else {
        notAnImage();
        e.target.value = '';
      }
      //User cancelled the crop, return
      return;
    } else if (
      e.target.name === `leaderboardEmail` ||
      e.target.name === `reminderEmail`
    ) {
      setUserFieldsOnPage({
        ...userFieldsOnPage,
        [e.target.name]: e.target.value ? true : false,
      });
    } else {
      setUserFieldsOnPage({
        ...userFieldsOnPage,
        [e.target.name]: e.target.value,
      });
    }
  };

  const createProfileFields = async (user) => {
    try {
      const emailRes = await axios.get(`/api/user/emailPref/${user._id}`);
      const groupList = await axios.get(
        `/api/group/details/byUser/${user._id}`
      );
      console.log({ groupList });
      setUserFieldsOnPage({
        id: user._id,
        username: user.UN,
        email: user.E,
        leaderboardEmail: emailRes.LE,
        reminderEmail: emailRes.RE,
        groupList: groupList.data,
      });
    } catch (err) {
      toast.error('Error pulling data, try again later', {
        position: 'top-right',
        duration: 4000,
      });
      console.log({ err });
    }
  };

  const saveCroppedAvatar = (mime) => {
    setTempAvatar('');
    openCloseModal(false);
    setModalState(`reAuth`);
    saveAvatarToAWS(mime);
  };

  const requestCloseModal = () => {
    openCloseModal(false);
    setTempAvatar(``);
  };

  const userProfilePull = (username) => {
    axios
      .get(`/api/user/name/${username}`, { cancelToken: axiosCancel.token })
      .then((res) => {
        createProfileFields(res.data.user);
        if (!userAvatars[res.data.user._id]) {
          addUserAvatarsToPull([res.data.user._id]);
        }
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getMainGroupName = (currUser) => {
    if (currUser.GL !== undefined) {
      for (const group of currUser.GL) {
        if (currUser.MG === group._id) {
          setMainGroupName(group.N);
          return;
        }
      }
    }
  };

  const saveAvatarToAWS = (updatedAvatar) => {
    fetch(`/api/user/avatar/${currentUser.userId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: updatedAvatar }),
    })
      .then(() => {
        toast.success('Avatar Saved', {
          position: 'top-right',
          duration: 4000,
        });
        repullUserAvatars([userFieldsOnPage.id]);
        return;
      })
      .catch(() =>
        toast.error('Error Saving the Avatar', {
          position: 'top-right',
          duration: 4000,
        })
      );
  };

  const notSupportedImage = () => {
    Alert.fire({
      title: 'Webp not supported',
      text: 'Webp files are not currently supported by editor, sorry for the inconvenience',
      showCancelButton: true,
      showConfirmButton: false,
    });
  };

  const notAnImage = () => {
    Alert.fire({
      title: `Only images allowed`,
      text: `File is not an image. Please only upload images`,
      showConfirmButton: false,
      showCancelButton: true,
    });
  };

  const toggleShowPassword = () => {
    if (showHidePassword === 'password') {
      setShowHidePassword('input');
    } else {
      setShowHidePassword('password');
    }
  };

  return (
    <>
      <div className={modalOpen ? 'greyBackdrop' : ''} />

      <div className='container'>
        <div className='mt-5 justify-content-center row'>
          <div className='col-xs-12 col-lg-8 border rounded'>
            <div className='row justify-content-center'>
              <div className='col-6 mt-5 text-center'>
                <img
                  className='rounded'
                  name='avatar'
                  src={userAvatars[userFieldsOnPage.id]}
                />
              </div>
              <div className='col-6'>
                <div className='row justify-content-center mt-3'>
                  <div className='col-12'>
                    <small htmlFor='usernameInput' className='form-label'>
                      Username
                    </small>
                    <input
                      id='usernameInput'
                      type='text'
                      className='form-control'
                      value={userFieldsOnPage.username}
                    />
                  </div>
                </div>
                <div className='row justify-content-center'>
                  <div className='col-12'>
                    <small htmlFor='emailInput' className='form-label'>
                      Email
                    </small>
                    <input
                      type='text'
                      className='form-control'
                      value={userFieldsOnPage.email}
                    />
                  </div>
                </div>
                {isCurrentUser && (
                  <div className='row justify-content-center'>
                    <div className='col-12'>
                      <small htmlFor='emailInput' className='form-label'>
                        Password
                      </small>
                      <div className='input-group'>
                        <input
                          type={showHidePassword}
                          className='form-control'
                          // value={userFieldsOnPage.email}
                        />
                        <span className='input-group-text'>
                          {showHidePassword === 'password' ? (
                            <img
                              src={EyeSVG}
                              alt='Show'
                              className='passwordHideShowSVG'
                              onClick={() => toggleShowPassword()}
                            />
                          ) : (
                            <img
                              src={EyeSlashSVG}
                              alt='Show'
                              className='passwordHideShowSVG'
                              onClick={() => toggleShowPassword()}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className='row justify-content-center'>
                  <div className='col-12'>
                    <small htmlFor='mainGroupDropdown' className='form-label'>
                      Main Group
                    </small>
                    <select
                      type='text'
                      className='form-select'
                      value={mainGroupName}
                    >
                      {userFieldsOnPage.groupList &&
                        userFieldsOnPage.groupList.map((group) => (
                          <option key={group._id} value={group.N}>
                            {group.N}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className='row justify-content-center'>
                  <div className='col-12'>
                    <div className='mt-3'>
                      <div className='form-switch row'>
                        <div className='col-1'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            role='switch'
                            id='leaderboardEmailSwitch'
                            checked={userFieldsOnPage.leaderboardEmail}
                            onChange={handleChange}
                            name='leaderboardEmail'
                          />
                        </div>
                        <div className='col-10 text-start'>
                          <label
                            className='form-check-label'
                            htmlFor='leaderboardEmailSwitch'
                          >
                            Leaderboard Emails
                          </label>
                        </div>
                      </div>
                      <div className='form-switch row mb-1'>
                        <div className='col-1'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            role='switch'
                            id='reminderEmailSwitch'
                            checked={userFieldsOnPage.reminderEmail}
                            onChange={handleChange}
                            name='reminderEmail'
                          />
                        </div>
                        <div className='col-10'>
                          <label
                            className='form-check-label'
                            htmlFor='reminderEmailSwitch'
                          >
                            Reminder Emails
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {currentUser && (
                <div className='row justify-content-center mt-2 mb-2 text-center'>
                  <div className='col-6'>
                    <label className='btn btn-primary'>
                      Upload Avatar
                      <input
                        type='file'
                        hidden={true}
                        ref={fileInputRef}
                        name='avatar'
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                  <div className='col-6'>
                    {isCurrentUser && (
                      <button
                        className='btn btn-primary'
                        onClick={() => {
                          openCloseModal(true);
                          setModalState('user');
                        }}
                      >
                        Update Info
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='d-flex mt-4 justify-content-center row text-center'>
          <div className='col-5 border rounded'>Want Texts?</div>
        </div>
      </div>

      <Modal
        onRequestClose={requestCloseModal}
        isOpen={modalOpen}
        contentLabel='profileModal'
        className={`profileModal ${
          modalState === `group` && `groupModalHeight`
        }`}
        overlayClassName='modalOverlay'
        ariaHideApp={false}
      >
        {modalState === `reAuth` ? (
          <ReAuth
            openCloseModal={openCloseModal}
            firebase={firebase}
            updatedFields={userFieldsOnPage}
            authUser={authUser}
            currentUser={currentUser}
            pullUserData={pullUserData}
          />
        ) : (
          modalState === `avatar` && (
            <ImageEditor
              tempAvatar={tempAvatar}
              saveCroppedAvatar={saveCroppedAvatar}
              openCloseModal={openCloseModal}
              fileInputRef={fileInputRef}
            />
          )
        )}
      </Modal>
    </>
  );
};

UserProfile.propTypes = {
  authUser: PropTypes.any,
  currentUser: PropTypes.object,
  firebase: PropTypes.any,
  match: PropTypes.any,
  history: PropTypes.any,
  pullUserData: PropTypes.func,
};

// const VerifyEmailButton = ({ authUser }) =>
//     <div className='verifyEmailDiv floatRight notifications'>
//         Please Verify your Email
//     <br />
//         <button className='btn btn-info' onClick={() => this.sendAuthEmail(authUser)}>Send Verification Email</button>
//     </div>;

// const SentVerifyEmail = () => <div className='sentEmail floatRight notifications'>Email has been sent</div>;

// const SmallVerifyEmailButton = ({ authUser }) =>
//     <div className='verifyEmailDiv floatRight notifications smallVerifyEmailBtn'>
//         <button className='btn btn-info btn-sm' onClick={() => this.sendAuthEmail(authUser)}>Verifiy Email</button>
//     </div>;

// const SmallSentVerifyEmail = () => <div className='sentEmail smallSentEmail floatRight notifications'>Sent!</div>;

export default Session(UserProfile);
