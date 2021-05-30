import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Prompt } from 'react-router-dom';
import axios from 'axios';
import { withAuthorization } from '../Session';
import Modal from 'react-modal';
import { withFirebase } from '../Firebase';
import PropTypes from 'prop-types';

import Jimp from 'jimp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import 'rc-slider/assets/index.css';
import './profileStyle.css';

import DisplayBox from '../DisplayBox';
import { AvatarInput, UsernameInput, EmailInput, PasswordInput } from './ProfileInputs';
import { ReAuth, ImageEditor } from './ModalWindows';

const Alert = withReactContent(Swal);

//Using the new style of route /:type/:name dynamically load which page to display, user or group
//Also update what state is used based on what is displayed
//Break it out into 2 different components and then manage which state is shared and what state should be broken out

const Profile = ({ authUser, currentUser, groupList, firebase }) => {

    const [showPassword, updateShowPassword] = useState(`password`);
    const [modalOpen, updateModal] = useState(false);
    const [modalState, updateModalState] = useState('reAuth');
    const [updatedFields, changeUpdatedFields] = useState({ email: ``, password: ``, username: ``, avatar: `` });
    const [avatar, updateAvatar] = useState(``);
    const [tempAvatar, updateTempAvatar] = useState(``);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (currentUser.userId !== undefined) {
            axios.get(`/api/avatar/${currentUser.userId}`).then(res => updateAvatar(res.data))
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
            <Prompt
                when={checkIfSaveNeeded}
                message='Information is Unsaved. Are you sure you want to leave?'
            />
            <div className={modalOpen ? 'greyBackdrop' : ''} />
            <div className='notificationHeader'>
                {checkIfSaveNeeded &&
                    `Submit to Save Changes`
                }
                {checkIfReAuthNeeded &&
                    <div className='relogNotify'>
                        Data Changed. Relogin Required
                    </div>
                }
            </div>
            <div className='userProfileWrapper '>
                <div className='userProfileLeft'>
                    <div className='profileName'>
                        {currentUser.username}
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
                        {groupList.map((group) =>
                            <DisplayBox
                                key={group._id}
                                boxContent={group.N}
                                type='group'
                                buttonActive={true}
                                inGroup={true}
                            />)}
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

Profile.propTypes = {
    authUser: PropTypes.any,
    currentUser: PropTypes.object,
    groupList: PropTypes.array,
    firebase: PropTypes.any
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

export default withFirebase(withAuthorization(condition)(Profile));