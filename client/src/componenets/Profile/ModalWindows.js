import React, { Fragment, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import Cropper from 'react-easy-crop';
import Slider from 'rc-slider';
import axios from 'axios';
import Jimp from 'jimp';
import { useToasts } from 'react-toast-notifications';

import { EmailInput, PasswordInput } from './ProfileInputs';

const ReAuth = ({ firebase, updatedFields, authUser, openCloseModal, currentUser, saveAvatarToAWS, avatar }) => {

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
            request.UN = updatedFields.username;
            needToUpdateDb = true;
        }
        if (updatedFields.avatar !== ``) {
            saveAvatarToAWS(avatar)
        }
        if (needToUpdateDb) {
            axios.put(`/api/updateProfile`, { request, userId: currentUser.userId })
                .then(res => console.log(res))
        }
    };

    const handleReAuth = () => {
        firebase.doSignInWithEmailAndPassword(email, password)
            .then(res => {
                openCloseModal()
                if (res.credential !== null) {
                    firebase.auth.currentUser.reauthenticateWithCredential(res.credential)
                        .then(() => handleUpdate())
                        .catch(err => console.log(`err`, err));
                } else {
                    handleUpdate();
                }
            })
            .catch(err => addLoginErr(err.message));
    };

    const handleChange = (e) => {
        e.target.name === `email` && setEmail(e.target.value);
        e.target.name === `password` && setPassword(e.target.value);
        if (e.target.name === `togglePassword`) {
            e.target.value === `password` ? toggleShowPassword(`text`) : toggleShowPassword(`password`);
            return;
        }
    };

    return (
        <Fragment>
            <div className='reAuthHeader'>Trying to update profile data, relogin required.</div>
            <div>{loginErr}</div>
            <EmailInput
                handleChange={handleChange}
                email={email}
                modalOpen={false}
            />
            <PasswordInput
                handleChange={handleChange}
                password={password}
                showPassword={showPassword}
                modalOpen={false}
            />
            <div className='profileButtonWrapper'>
                <button className='btn btn-success profileModalButton' onClick={handleReAuth}>
                    Re-Login
            </button>
                <button className='btn btn-danger profileModalButton' onClick={() => openCloseModal()}>
                    Close
            </button>
            </div>
        </Fragment>
    );
};

const ImageEditor = ({ tempAvatar, saveCroppedAvatar, openCloseModal, fileInputRef }) => {

    const [crop, updateCrop] = useState({ x: 0, y: 0 });
    const [cropComplete, updateCropComplete] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [zoom, updateZoom] = useState(1);
    const sliderChange = val => updateZoom(val);

    const { addToast } = useToasts();

    const saveAvatar = () => {
        const bufferedAvatar = Buffer.from(tempAvatar.split(',')[1], 'base64');
        Jimp.read(bufferedAvatar)
            .then(async img => {
                const { x, y, width, height } = cropComplete;
                //React Easy Crop gives the values that they want to crop as a % of the image size. We need to convert it back for JIMP
                img.crop((img.bitmap.width * (0.01 * x)),
                    (img.bitmap.height * (0.01 * y)),
                    (img.bitmap.width * (0.01 * width)),
                    (img.bitmap.height * (0.01 * height)));
                img.resize(200, 200);
                let mime = await img.getBase64Async(Jimp.MIME_JPEG);
                fileInputRef.current.value = '';
                saveCroppedAvatar(mime);
            }).catch(err => {
                addToast('Error Reading File, Please upload again', { appearance: 'error', autoDismiss: true });
                console.log(`error`, err)
            });
    };

    const getCropComplete = useCallback(croppedArea => {
        updateCropComplete(croppedArea);
    }, []);

    const closeImageModal = () => {
        fileInputRef.current.value = '';
        openCloseModal();
    };

    return (
        <Fragment>
            <div className='cropperWrapper'>
                <Cropper
                    image={tempAvatar}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    zoomSpeed={0.10}
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
                    step={0.10}
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
                        background: 'cyan'
                    }}
                />
            </div>
            <div className='profileButtonWrapper'>
                <button className='btn btn-success profileModalButton' onClick={() => saveAvatar()}>
                    Save Avatar
                </button>
                <button className='btn btn-danger profileModalButton' onClick={() => closeImageModal()}>
                    Close
                </button>
            </div>
        </Fragment>
    );
};

ReAuth.propTypes = {
    avatar: PropTypes.any,
    saveAvatarToAWS: PropTypes.func,
    firebase: PropTypes.any,
    updatedFields: PropTypes.object,
    authUser: PropTypes.any,
    openCloseModal: PropTypes.func,
    currentUser: PropTypes.object
};

ImageEditor.propTypes = {
    saveCroppedAvatar: PropTypes.func,
    fileInputRef: PropTypes.any,
    tempAvatar: PropTypes.any,
    openCloseModal: PropTypes.func
};

export { ReAuth, ImageEditor };