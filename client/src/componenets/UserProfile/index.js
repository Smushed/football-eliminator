import React, { Fragment, useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';
import Modal from 'react-modal';
import { withFirebase } from '../Firebase';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';
import Slider from 'rc-slider';
import Jimp from 'jimp';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import 'rc-slider/assets/index.css';
import './userProfileStyle.css';

const Alert = withReactContent(Swal);

const UserProfile = ({ authUser, currentUser, groupList, firebase }) => {

    const [showPassword, updateShowPassword] = useState(`password`);
    const [modalOpen, updateModal] = useState(false);
    const [modalState, updateModalState] = useState('reAuth');
    const [updatedFields, changeUpdatedFields] = useState({ email: ``, password: ``, username: ``, avatar: `` });
    const [avatar, updateAvatar] = useState(``);
    const [tempAvatar, updateTempAvatar] = useState(``);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (currentUser.userId !== undefined) {
            axios.get(`api/getAvatar/${currentUser.userId}`).then(res => updateAvatar(res.data))
        }
    }, [currentUser]);

    // const sendAuthEmail = (authUser) => {
    //     authUser.sendEmailVerification();
    //     this.setState({ emailSent: true });
    // };

    const openCloseModal = () => {
        updateModal(!modalOpen);
    };

    const handleChange = (e) => {
        if (e.target.name === `avatar`) {

            //Checks if the file uploaded is an image
            if (!!e.target.files[0].type.match('image.*')) {
                Jimp.read((URL.createObjectURL(e.target.files[0])), async (err, img) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    const mime = await img.getBase64Async(Jimp.MIME_JPEG);
                    updateTempAvatar(mime);
                })
                updateModalState(`avatar`);
                openCloseModal();
            } else {
                notAnImage();
                e.target.value = '';
            }
            return; //Don't want to set updated fields here in case the user cancels the crop
        }

        if (e.target.name === `togglePassword`) {
            e.target.value === `password` ? updateShowPassword(`text`) : updateShowPassword(`password`);
            return;
        }

        //Putting this after the avatar check in case they upload a non image
        changeUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
    };

    const saveCroppedAvatar = (mime) => {
        updateTempAvatar(``);
        updateAvatar(mime);
        openCloseModal();
        updateModalState(`reAuth`)
        changeUpdatedFields({ ...updatedFields, avatar: `active` });
    };

    //This is fired if someone pressed ESC or clicks off the modal
    const requestCloseModal = () => {
        updateModal(!modalOpen);
        updateTempAvatar(``)
    };

    const handleSubmit = () => {
        if (updatedFields.email !== ``) {
            let checkEmail = updatedFields.email.match(/^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            if (!checkEmail) {
                Alert.fire({
                    type: 'warning',
                    title: `Email is invalid`,
                    text: `Please check the email field and enter again`,
                });
                return;
            }
        }

        if (checkIfReAuthNeeded) {
            updateModalState(`reAuth`);
            openCloseModal();
        } else if (updatedFields.avatar) { //Do not require users to re sign in if they're just updating their avatar
            saveAvatarToAWS(avatar);
        }
    };

    const saveAvatarToAWS = () => {
        //Using Fetch here to send along the base64 encoded image
        fetch(`/api/uploadAvatar/${currentUser.userId}`, {
            method: `PUT`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: avatar })
        })
            .then(res => console.log(res))
    };

    const notAnImage = () => {
        Alert.fire({
            title: `Only Upload Images`,
            text: `Image not selected. Please only upload images`,
            showConfirmButton: false,
            showCancelButton: true,
        });
    };

    const checkIfSaveNeeded =
        updatedFields.avatar !== `` ||
        updatedFields.email !== `` ||
        updatedFields.password !== `` ||
        updatedFields.username !== ``;

    const checkIfReAuthNeeded =
        updatedFields.email !== `` ||
        updatedFields.password !== `` ||
        updatedFields.username !== ``;

    return (
        <Fragment>
            <div className={modalOpen ? 'greyBackdrop' : ''} />
            <div className='notificationHeader'>
                {checkIfSaveNeeded &&
                    `Submit to Save Changes`
                }
                {checkIfReAuthNeeded &&
                    <div className='relogNotify'>
                        Profile Data Changed. Relogin Required
                    </div>
                }
            </div>
            <div className='userProfileWrapper '>
                <div className='userProfileLeft'>
                    <div className='profileName'>
                        {currentUser.username}&apos;s Profile
                    </div>
                    <div className='userAvatarWrapper'>
                        <img className='userAvatar' src={avatar} />
                    </div>
                </div>
                <div className='userProfileRight'>
                    <UsernameInput
                        handleChange={handleChange}
                        username={updatedFields.username}
                        currentUser={currentUser}
                        modalOpen={modalOpen}
                    />
                    <PasswordInput
                        handleChange={handleChange}
                        password={updatedFields.password}
                        showPassword={showPassword}
                        modalOpen={modalOpen}
                    />
                    <EmailInput
                        authUser={authUser}
                        handleChange={handleChange}
                        email={updatedFields.email}
                        modalOpen={modalOpen}
                    />
                    <AvatarInput
                        handleChange={handleChange}
                        fileInputRef={fileInputRef}
                    />
                    <div className='submitButtonWrapper'>
                        <button disabled={!checkIfSaveNeeded} className='btn btn-primary btn-lg' onClick={() => handleSubmit()}>
                            Submit
                        </button>
                    </div>
                    <div className='editField'>
                        <div>
                            Joined Groups:
                        </div>
                        {groupList.map((group) => <div key={group.N}>{group.N} {group.D} {group._id}</div>)}
                    </div>
                </div>
            </div>
            <Modal
                onRequestClose={requestCloseModal}
                isOpen={modalOpen}
                contentLabel='profileModal'
                className='userProfileModal'
                overlayClassName='modalOverlay'
                ariaHideApp={false}>
                {modalState === 'reAuth' ?
                    <ReAuth
                        openCloseModal={openCloseModal}
                        firebase={firebase}
                        updatedFields={updatedFields}
                        authUser={authUser}
                        currentUser={currentUser}
                        saveAvatarToAWS={saveAvatarToAWS}
                        avatar={avatar}
                    />
                    :
                    <ImageEditor
                        tempAvatar={tempAvatar}
                        saveCroppedAvatar={saveCroppedAvatar}
                        openCloseModal={openCloseModal}
                        fileInputRef={fileInputRef}
                    />
                }
            </Modal>
        </Fragment>
    );
};

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
                saveCroppedAvatar(mime)
            }).catch(err => {
                //TODO Display an error message to the user
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

const AvatarInput = ({ handleChange, fileInputRef }) =>
    <div className='editField'>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Avatar:
            </span>
            <div>
                <label htmlFor='avatarInput' className='customFileUploadButton' >
                    Upload Avatar
                </label>
            </div>
            <input type='file' name='avatar' id='avatarInput' className='avatarInputButton' onChange={handleChange} ref={fileInputRef} />
        </div>
    </div>

const UsernameInput = ({ handleChange, username, currentUser, modalOpen }) =>
    <div className={'editField' + (modalOpen ? ' lowerOpacity' : '')}>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Username:
            </span>
            <input className='form-control' name='username' value={username} type='text' onChange={handleChange} placeholder={currentUser.username} />
        </div>
    </div>;

const PasswordInput = ({ handleChange, password, showPassword, modalOpen }) =>
    <div className={'editField' + (modalOpen ? ' lowerOpacity' : '')}>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Password:
                    </span>
            <input className='form-control' name='password' value={password} type={showPassword} onChange={handleChange} placeholder='Password' />
            <span className='input-group-text fieldDescription'>
                <input className='largeCheckbox input-group-text fieldDescription' type='checkbox' value={showPassword} name='togglePassword' onChange={handleChange} />
                &nbsp;Show
            </span>
        </div>
    </div>;

const EmailInput = ({ email, handleChange, authUser, modalOpen }) =>
    <div className={'editField' + (modalOpen ? ' lowerOpacity' : '')}>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Email:
            </span>
            <input className='form-control' name='email' value={email} type='email' onChange={handleChange} placeholder={authUser ? authUser.email : 'Email'} />
        </div>
    </div>;

ImageEditor.propTypes = {
    saveCroppedAvatar: PropTypes.func,
    fileInputRef: PropTypes.any,
    tempAvatar: PropTypes.any,
    openCloseModal: PropTypes.func,
};

AvatarInput.propTypes = {
    fileInputRef: PropTypes.any,
    handleChange: PropTypes.func
}

UserProfile.propTypes = {
    authUser: PropTypes.any,
    currentUser: PropTypes.object,
    groupList: PropTypes.array,
    firebase: PropTypes.any
};

UsernameInput.propTypes = {
    handleChange: PropTypes.func,
    username: PropTypes.string,
    currentUser: PropTypes.object,
    modalOpen: PropTypes.bool
};

EmailInput.propTypes = {
    email: PropTypes.string,
    handleChange: PropTypes.func,
    authUser: PropTypes.any,
    modalOpen: PropTypes.bool

};

PasswordInput.propTypes = {
    handleChange: PropTypes.func,
    password: PropTypes.string,
    showPassword: PropTypes.string,
    modalOpen: PropTypes.bool
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

const condition = authUser => !!authUser;

export default withFirebase(withAuthorization(condition)(UserProfile));