import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import Session from '../../Session';
import axios from 'axios';

import 'jimp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import 'rc-slider/assets/index.css';
import '../profileStyle.css';

import { ReAuth, ImageEditor } from '../ModalWindows';
// import UserProfileFields from './UserProfileFields';

const Alert = withReactContent(Swal);

const userFields = {
  username: ``,
  email: ``,
  password: ``,
  mainGroup: ``,
  leaderboardEmail: true,
  reminderEmail: true,
};

const UserProfile = ({
  authUser,
  currentUser,
  firebase,
  match,
  history,
  pullUserData,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState(`reAuth`);
  const [updatedFields, changeUpdatedFields] = useState({
    ...userFields,
  });
  const [mainGroupName, setMainGroupName] = useState(``);
  const [avatar, setAvatar] = useState(``);
  const [tempAvatar, setTempAvatar] = useState(``);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const fileInputRef = useRef(null);
  const axiosCancel = axios.CancelToken.source();

  // useEffect(() => {
  //     changeUpdatedFields({ ...userFields, mainGroup: currentUser.MG });
  // }, [currentUser]);

  useEffect(() => {
    setIsCurrentUser(match.params.username === currentUser.username);
    userProfilePull(currentUser.username);
    getMainGroupName(currentUser);
  }, [match.params.username, currentUser]);

  const openCloseModal = (cmd) => {
    setModalOpen(cmd);
  };

  const handleChange = (e) => {
    if (e.target.name === `avatar`) {
      if (!!e.target.files[0].type.match(`image.*`)) {
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
      changeUpdatedFields({
        ...updatedFields,
        [e.target.name]: e.target.value ? true : false,
      });
    }
    changeUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
  };

  const saveCroppedAvatar = (mime) => {
    setTempAvatar(``);
    setAvatar(mime);
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
        setAvatar(res.data.avatar);
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
      method: `PUT`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: updatedAvatar }),
    }).then(() =>
      toast.success('Avatar Saved', {
        duration: 4000,
      })
    );
  };

  const notAnImage = () => {
    Alert.fire({
      title: `Only Upload Images`,
      text: `File is not an image. Please only upload images`,
      showConfirmButton: false,
      showCancelButton: true,
    });
  };

  return (
    <>
      <div className={modalOpen ? 'greyBackdrop' : ''} />

      <div className='container'>
        <div className='mt-5 justify-content-center row'>
          <div className='col-5 border rounded'>
            <div className='row justify-content-center'>
              <div className='col-6 mt-3 text-center'>
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
            <div className='row justify-content-center mt-3'>
              <div className='col-6'>
                <small htmlFor='usernameInput' className='form-label'>
                  Username
                </small>
                <input
                  id='usernameInput'
                  type='text'
                  className='form-control'
                  value={currentUser.username}
                />
              </div>

              {/* <h1 className='col-6'>{currentUser && currentUser.username}</h1> */}
            </div>
            <div className='row justify-content-center'>
              <div className='col-6'>
                <small htmlFor='emailInput' className='form-label'>
                  Email
                </small>
                <input
                  type='text'
                  className='form-control'
                  value={authUser ? authUser.email : ``}
                />
              </div>
              {/* <h5 className='col-6'>{authUser && authUser.email}</h5> */}
            </div>
            <div className='row justify-content-center'>
              <div className='col-6'>
                <small htmlFor='mainGroupDropdown' className='form-label'>
                  Main Group
                </small>
                <select
                  type='text'
                  className='form-select'
                  value={mainGroupName}
                >
                  {currentUser.GL &&
                    currentUser.GL.map((group) => (
                      <option key={group._id} value={group.N}>
                        {group.N}
                      </option>
                    ))}
                </select>
              </div>
              {/* <h5 className='col-6'>{mainGroupName}</h5> */}
            </div>
            <div className='row justify-content-center'>
              <div className='col-6'>
                <div className='mt-3'>
                  {currentUser.E && (
                    <div className='form-switch row'>
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
                      <div className='col-10 text-start'>
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
                    <div className='form-switch row mb-1'>
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
                      <div className='col-10'>
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
              </div>
            </div>
            <div className='row'>
              <div className='col-6'>
                {isCurrentUser && (
                  <button
                    className='btn btn-sm btn-info'
                    onClick={() => {
                      openCloseModal(true);
                      setModalState('user');
                    }}
                  >
                    Edit Information
                  </button>
                )}
              </div>
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
            updatedFields={updatedFields}
            authUser={authUser}
            currentUser={currentUser}
            history={history}
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
