import React, { useEffect, useState, useRef, useContext } from 'react';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import Session from '../../Session';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import 'jimp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { getAuth, updatePassword, updateEmail } from 'firebase/auth';

import { ReAuth, ImageEditor } from '../ModalWindows';
import { AvatarContext } from '../../Avatars';
import 'rc-slider/assets/index.css';
import '../profileStyle.css';

import {
  EmailInput,
  MainGroupInput,
  PasswordInput,
  UsernameInput,
} from '../ProfileInputs';

const Alert = withReactContent(Swal);

const UserProfile = ({ currentUser, pullUserData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState('reAuth');
  const [reAuthSuccess, setReAuthSuccess] = useState(false);
  const [originalState, setOriginalState] = useState({});
  const [tempAvatar, setTempAvatar] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [disableAllFields, setDisableAllFields] = useState(false);
  const [showHidePassword, setShowHidePassword] = useState('password');
  const [errors, setErrors] = useState([]);
  const [userFieldsOnPage, setUserFieldsOnPage] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    mainGroup: '',
    leaderboardEmail: true,
    reminderEmail: true,
    groupList: [],
  });

  const fileInputRef = useRef(null);
  const axiosCancel = axios.CancelToken.source();

  const { addUserAvatarsToPull, repullUserAvatars, userAvatars } =
    useContext(AvatarContext);
  const params = useParams();
  const history = useHistory();

  useEffect(() => {
    setIsCurrentUser(params.name === currentUser.username);
    setDisableAllFields(params.name !== currentUser.username);
  }, [params.name, currentUser]);

  useEffect(() => {
    if (userFieldsOnPage.id === '') {
      userProfilePull(params.name);
    }
  }, [params.name]);

  useEffect(() => {
    if (reAuthSuccess) {
      updateUserInfo();
    }
  }, [reAuthSuccess]);

  const openCloseModal = (cmd) => {
    setModalOpen(cmd);
    if (cmd === false && params.name === currentUser.username) {
      setDisableAllFields(false);
    }
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
      return; //User cancelled the crop, return
    } else if (
      e.target.name === `leaderboardEmail` ||
      e.target.name === `reminderEmail`
    ) {
      setUserFieldsOnPage({
        ...userFieldsOnPage,
        [e.target.name]: e.target.checked,
      });
    } else {
      setUserFieldsOnPage({
        ...userFieldsOnPage,
        [e.target.name]: e.target.value,
      });
    }
  };

  const updateInfo = () => {
    const updatedFields = buildUpdates(originalState, userFieldsOnPage);
    const errors = validateUpdates(updatedFields);
    if (errors.length > 0) {
      return;
    }
    if (
      updatedFields.email ||
      updatedFields.username ||
      updatedFields.password
    ) {
      setDisableAllFields(true);
      setModalState('reAuth');
      openCloseModal(true);
    } else {
      updateUserInfo();
    }
  };

  const buildUpdates = (original, compare) => {
    const diff = {};
    for (const key in original) {
      if (original[key] !== compare[key]) {
        diff[key] = compare[key];
      }
    }
    return diff;
  };

  const validateUpdates = ({ username, password, email }) => {
    const errors = [];
    if (username) {
      if (username.length < 6 || userFieldsOnPage.username.length > 20) {
        errors.push('Username must be at least 6 characters and less than 20');
      }
    }
    if (password) {
      const noSpacesInPassword = password.match(/^\S*$/);
      if (password.length < 6 || !noSpacesInPassword) {
        errors.push(
          'Password must be 6 characters or longer and have no spaces'
        );
      }
    }
    if (email) {
      const checkEmail = email.match(
        /^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (!checkEmail) {
        errors.push('Invalid email');
      }
    }
    setErrors(errors);
    return errors;
  };

  const updateUserInfo = () => {
    const updatedFields = buildUpdates(originalState, userFieldsOnPage);
    const validationErrors = validateUpdates(updatedFields);
    if (validationErrors.length > 0) {
      return;
    }
    let needToUpdateDb = false;
    const request = {};
    const authUser = getAuth().currentUser;

    setReAuthSuccess(false);
    if (updatedFields.password !== undefined) {
      updatePassword(authUser, updatedFields.password)
        .then()
        .catch(() =>
          toast.error('Error Updating Password', {
            position: 'top-right',
            duration: 4000,
          })
        );
    }
    if (updatedFields.email !== undefined) {
      updateEmail(authUser, updatedFields.email)
        .then()
        .catch(() =>
          toast.error('Error Updating Email', {
            position: 'top-right',
            duration: 4000,
          })
        );
      request.E = updatedFields.email;
      needToUpdateDb = true;
    }
    if (updatedFields.username !== undefined) {
      request.UN = updatedFields.username.trim();
      needToUpdateDb = true;
    }
    if (updatedFields.leaderboardEmail !== undefined) {
      request.LE = updatedFields.leaderboardEmail;
      needToUpdateDb = true;
    }
    if (updatedFields.mainGroup !== undefined) {
      request.MG = updatedFields.mainGroup;
      needToUpdateDb = true;
    }
    if (updatedFields.reminderEmail !== undefined) {
      request.RE = updatedFields.reminderEmail;
      needToUpdateDb = true;
    }
    if (needToUpdateDb) {
      axios
        .put(`/api/user/updateProfile`, { request, userId: currentUser.userId })
        .then((res) => {
          if (request.E !== undefined) {
            pullUserData(request.E);
          } else {
            pullUserData(currentUser.email);
          }
          if (request.UN !== undefined) {
            history.push(`/profile/user/${request.UN}`);
            return;
          }
          userProfilePull(params.name);
          toast.success('Profile Updated', {
            position: 'top-right',
            duration: 4000,
          });
        })
        .catch((err) =>
          toast.error(err.message, { position: 'top-right', duration: 4000 })
        );
    }
  };

  const createProfileFields = async (user) => {
    try {
      const emailRes = await axios.get(`/api/user/emailPref/${user._id}`);
      const groupList = await axios.get(
        `/api/group/details/byUser/${user._id}`
      );
      const builtUser = {
        password: '',
        id: user._id,
        username: user.UN,
        email: user.E,
        leaderboardEmail: emailRes.data.LE,
        reminderEmail: emailRes.data.RE,
        mainGroup: user.MG,
        groupList: groupList.data,
      };
      setOriginalState(builtUser);
      setUserFieldsOnPage(builtUser);
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
    setTempAvatar('');
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
        toast.error(err.response.data, {
          position: 'top-right',
          duration: 4000,
        });
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
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
      <div className='container'>
        <div className='mt-5 justify-content-center row'>
          <div className='col-xs-12 col-lg-8 border rounded shadow'>
            <div className='row mt-2'>
              <div className='col-12 text-center'>
                {errors.map((error, i) => (
                  <div className='text-danger' key={`err-${i}`}>
                    {error}
                  </div>
                ))}
              </div>
            </div>
            <div className='row justify-content-center'>
              <div className='col-6 mt-5 text-center'>
                <img
                  className={`rounded ${currentUser ? 'mt-5' : 'mt-1'}`}
                  name='avatar'
                  src={userAvatars[userFieldsOnPage.id]}
                />
              </div>
              <div className='col-6 mt-2'>
                <UsernameInput
                  handleChange={handleChange}
                  placeholderUsername={userFieldsOnPage.username}
                  username={userFieldsOnPage.username}
                  disabled={disableAllFields}
                />
                <EmailInput
                  email={userFieldsOnPage.email}
                  handleChange={handleChange}
                  placeholderEmail={userFieldsOnPage.email}
                  disabled={disableAllFields}
                />
                {isCurrentUser && (
                  <PasswordInput
                    password={userFieldsOnPage.password}
                    showPassword={showHidePassword}
                    toggleShowPassword={toggleShowPassword}
                    handleChange={handleChange}
                    disabled={disableAllFields}
                  />
                )}
                <div className='row justify-content-center'>
                  <div className='col-12'>
                    <MainGroupInput
                      groupList={userFieldsOnPage.groupList}
                      mainGroup={userFieldsOnPage.mainGroup}
                      handleChange={handleChange}
                      disabled={disableAllFields}
                    />
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
                            disabled={disableAllFields}
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
                            disabled={disableAllFields}
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
                <div className='row justify-content-center mt-3 mb-4 text-center'>
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
                      <button className='btn btn-primary' onClick={updateInfo}>
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
        className='profileModal'
        overlayClassName='modalOverlay'
        ariaHideApp={false}
      >
        {modalState === `reAuth` ? (
          <ReAuth
            openCloseModal={openCloseModal}
            reAuthSuccess={setReAuthSuccess}
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

export default Session(UserProfile);
