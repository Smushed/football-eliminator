import React, { useState, useCallback } from 'react';

import Cropper from 'react-easy-crop';
import Slider from 'rc-slider';
import 'jimp';
import toast from 'react-hot-toast';
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';

import { EmailInput, PasswordInput } from './ProfileInputs';

const ReAuth = ({ openCloseModal, reAuthSuccess }) => {
  const [inputs, setInputs] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState('password');
  const [loginErr, addLoginErr] = useState('');

  const handleReAuth = async () => {
    try {
      const credential = EmailAuthProvider.credential(
        inputs.email,
        inputs.password
      );
      await reauthenticateWithCredential(getAuth().currentUser, credential);
      reAuthSuccess(true);
      openCloseModal(false);
    } catch (err) {
      addLoginErr(err.message);
      return;
    }
  };

  const hideShowPassword = () => {
    if (showPassword === 'password') {
      setShowPassword('text');
    } else {
      setShowPassword('password');
    }
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className='row justify-content-center'>
        <div className='col-xs-12 col-lg-10'>
          <div className='text-center mb-3 mt-3 fs-5 border-bottom fw-semibold'>
            Trying to update profile data, relogin required.
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-12'>
          <div className='text-danger text-center'>{loginErr}</div>
        </div>
      </div>
      <div className='row justify-content-center'>
        <div className='col-xs-12 col-lg-8'>
          <EmailInput
            handleChange={handleChange}
            email={inputs.email}
            modalOpen={false}
          />
        </div>
      </div>
      <div className='row justify-content-center'>
        <div className='col-xs-12 col-lg-8'>
          <PasswordInput
            handleChange={handleChange}
            password={inputs.password}
            showPassword={showPassword}
            toggleShowPassword={hideShowPassword}
            modalOpen={false}
          />
        </div>
      </div>
      <div className='d-flex justify-content-evenly mt-4'>
        <button
          className='btn btn-primary profileModalButton'
          onClick={handleReAuth}
        >
          Re-Login
        </button>
        <button
          className='btn btn-secondary profileModalButton'
          onClick={() => {
            openCloseModal(false);
          }}
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
    openCloseModal(false);
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

export { ReAuth, ImageEditor };
