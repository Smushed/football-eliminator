import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import Cropper from 'react-easy-crop';
import Slider from 'rc-slider';
import axios from 'axios';
import 'jimp';
// import Jimp from 'jimp/browser/lib/jimp.js';
import toast from 'react-hot-toast';

import {
  UsernameInput,
  EmailInput,
  PasswordInput,
  MainGroupInput,
  EmailToggleInput,
} from './ProfileInputs';

const ReAuth = ({
  firebase,
  updatedFields,
  authUser,
  openCloseModal,
  currentUser,
  history,
  pullUserData,
}) => {
  const [email, setEmail] = useState(``);
  const [password, setPassword] = useState(``);
  const [showPassword, toggleShowPassword] = useState(`password`);
  const [loginErr, addLoginErr] = useState(``);

  const handleUpdate = () => {
    const request = {};
    let needToUpdateDb = false;
    if (updatedFields.password !== ``) {
      authUser.updatePassword(updatedFields.password);
    }
    if (updatedFields.email !== ``) {
      authUser.updateEmail(updatedFields.email);
      request.E = updatedFields.email;
      needToUpdateDb = true;
    }
    if (updatedFields.username !== ``) {
      request.UN = updatedFields.username.trim();
      needToUpdateDb = true;
    }
    if (needToUpdateDb) {
      axios
        .put(`/api/updateProfile`, { request, userId: currentUser.userId })
        .then((res) => {
          pullUserData(authUser.email);
          if (res.data.UN) {
            history.push(`/profile/user/${res.data.UN}`);
          }
        });
    }
  };

  const handleReAuth = () => {
    firebase
      .doSignInWithEmailAndPassword(email, password)
      .then((res) => {
        openCloseModal();
        if (res.credential !== null) {
          firebase.auth.currentUser
            .reauthenticateWithCredential(res.credential)
            .then(() => handleUpdate())
            .catch((err) => console.log(`err`, err));
        } else {
          handleUpdate();
        }
      })
      .catch((err) => addLoginErr(err.message));
  };

  const handleChange = (e) => {
    e.target.name === `email` && setEmail(e.target.value);
    e.target.name === `password` && setPassword(e.target.value);
    if (e.target.name === `togglePassword`) {
      e.target.value === `password`
        ? toggleShowPassword(`text`)
        : toggleShowPassword(`password`);
      return;
    }
  };

  return (
    <>
      <div className='reAuthHeader'>
        Trying to update profile data, relogin required.
      </div>
      <div>{loginErr}</div>
      <EmailInput handleChange={handleChange} email={email} modalOpen={false} />
      <PasswordInput
        handleChange={handleChange}
        password={password}
        showPassword={showPassword}
        modalOpen={false}
      />
      <div className='profileButtonWrapper'>
        <button
          className='btn btn-success profileModalButton'
          onClick={handleReAuth}
        >
          Re-Login
        </button>
        <button
          className='btn btn-danger profileModalButton'
          onClick={() => openCloseModal()}
        >
          Close
        </button>
      </div>
    </>
  );
};

const ImageEditor = ({
  tempAvatar,
  saveCroppedAvatar,
  openCloseModal,
  fileInputRef,
}) => {
  const [crop, updateCrop] = useState({ x: 0, y: 0 });
  const [cropComplete, updateCropComplete] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [zoom, updateZoom] = useState(1);
  const sliderChange = (val) => updateZoom(val);

  const saveAvatar = () => {
    const bufferedAvatar = Buffer.from(tempAvatar.split(',')[1], 'base64');
    Jimp.read(bufferedAvatar)
      .then(async (img) => {
        const { x, y, width, height } = cropComplete;
        //React Easy Crop gives the values that they want to crop as a % of the image size. We need to convert it back for JIMP
        img.crop(
          img.bitmap.width * (0.01 * x),
          img.bitmap.height * (0.01 * y),
          img.bitmap.width * (0.01 * width),
          img.bitmap.height * (0.01 * height)
        );
        img.resize(200, 200);
        let mime = await img.getBase64Async(Jimp.MIME_JPEG);
        fileInputRef.current.value = '';
        saveCroppedAvatar(mime);
      })
      .catch((err) => {
        toast.error('Error Reading File, Please upload again', {
          duration: 4000,
        });
        console.log(`error`, err);
      });
  };

  const getCropComplete = useCallback((croppedArea) => {
    updateCropComplete(croppedArea);
  }, []);

  const closeImageModal = () => {
    fileInputRef.current.value = '';
    openCloseModal();
  };

  return (
    <>
      <div className='cropperWrapper'>
        <Cropper
          image={tempAvatar}
          crop={crop}
          zoom={zoom}
          aspect={1}
          zoomSpeed={0.1}
          onCropComplete={getCropComplete}
          onCropChange={updateCrop}
          onZoomChange={updateZoom}
        />
      </div>
      <div className='sliderWrapper'>
        <Slider
          min={1}
          max={3}
          value={zoom}
          onChange={sliderChange}
          step={0.1}
          railStyle={{
            height: 2,
            backgroundColor: 'lightgray',
          }}
          handleStyle={{
            height: 20,
            width: 20,
            marginLeft: -6,
            marginTop: -8,
            backgroundColor: 'cyan',
            border: 0,
            opacity: 75,
          }}
          trackStyle={{
            background: 'cyan',
          }}
        />
      </div>
      <div className='profileButtonWrapper'>
        <button
          className='btn btn-success profileModalButton'
          onClick={() => saveAvatar()}
        >
          Save Avatar
        </button>
        <button
          className='btn btn-danger profileModalButton'
          onClick={() => closeImageModal()}
        >
          Close
        </button>
      </div>
    </>
  );
};

const UserEditor = ({
  changeUpdatedFields,
  updatedFields,
  currentUser,
  authUser,
  updateModalState,
  openCloseModal,
}) => {
  const [showPassword, updateShowPassword] = useState(`password`);
  const [emailPref, updateEmailPref] = useState({});

  useEffect(() => {
    getEmailPref(currentUser.userId);
  }, [currentUser.userId]);

  const getEmailPref = async (userId) => {
    const emailPref = await axios.get(`/api/user/emailPref/${userId}`);
    changeUpdatedFields({
      ...updatedFields,
      reminderEmail: emailPref.data.RE,
      leaderboardEmail: emailPref.data.LE,
    });
    updateEmailPref(emailPref.data);
  };

  const toggleShowPassword = () => {
    showPassword === `password`
      ? updateShowPassword(`text`)
      : updateShowPassword(`password`);
  };

  const handleChange = (e) => {
    if (
      e.target.name === `leaderboardEmail` ||
      e.target.name === 'reminderEmail'
    ) {
      const updatedVal = e.target.value === `true`;
      changeUpdatedFields({ ...updatedFields, [e.target.name]: updatedVal });
    } else {
      changeUpdatedFields({
        ...updatedFields,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async () => {
    if (updatedFields.email !== ``) {
      let checkEmail = updatedFields.email.match(
        /^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (!checkEmail) {
        toast.error('Invalid Email - Please check', {
          duration: 5000,
          position: 'top-center',
        });
        return;
      }
    }

    if (updatedFields.mainGroup !== currentUser.MG) {
      try {
        await axios.put(
          `/api/user/group/main/${updatedFields.mainGroup}/${currentUser.userId}`
        );
        toast.success('Main group updated', {
          duration: 4000,
        });
      } catch (err) {
        toast.error('Error saving main group', {
          duration: 4000,
        });
      }
    }

    if (
      updatedFields.leaderboardEmail !== emailPref.LE ||
      updatedFields.reminderEmail !== emailPref.RE
    ) {
      await axios.put(
        `/api/user/emailPref/${currentUser.userId}/${updatedFields.leaderboardEmail}/${updatedFields.reminderEmail}`
      );
    }

    if (
      updatedFields.email !== `` ||
      updatedFields.password !== `` ||
      updatedFields.username !== ``
    ) {
      updateModalState('reAuth');
      return;
    }
    openCloseModal();
  };

  return (
    <>
      <UsernameInput
        handleChange={handleChange}
        username={updatedFields.username}
        currentUser={currentUser.username}
      />
      <PasswordInput
        handleChange={handleChange}
        toggleShowPassword={toggleShowPassword}
        password={updatedFields.password}
        showPassword={showPassword}
      />
      <EmailInput
        authUser={authUser}
        handleChange={handleChange}
        email={updatedFields.email}
      />
      <MainGroupInput
        currentUser={currentUser}
        mainGroup={updatedFields.mainGroup}
        handleChange={handleChange}
      />
      <EmailToggleInput
        leaderboardEmailPref={updatedFields.leaderboardEmail}
        reminderEmailPref={updatedFields.reminderEmail}
        handleChange={handleChange}
      />
      <div className='submitButtonWrapper'>
        <button
          className='btn btn-primary btn-lg'
          onClick={() => handleSubmit()}
        >
          Save
        </button>
      </div>
    </>
  );
};

UserEditor.propTypes = {
  changeUpdatedFields: PropTypes.func,
  updatedFields: PropTypes.object,
  currentUser: PropTypes.object,
  authUser: PropTypes.object,
  updateModalState: PropTypes.func,
  openCloseModal: PropTypes.func,
};

ReAuth.propTypes = {
  firebase: PropTypes.any,
  updatedFields: PropTypes.object,
  authUser: PropTypes.any,
  openCloseModal: PropTypes.func,
  currentUser: PropTypes.object,
  history: PropTypes.any,
  pullUserData: PropTypes.func,
};

ImageEditor.propTypes = {
  saveCroppedAvatar: PropTypes.func,
  fileInputRef: PropTypes.any,
  tempAvatar: PropTypes.any,
  openCloseModal: PropTypes.func,
};

export { ReAuth, ImageEditor, UserEditor };
