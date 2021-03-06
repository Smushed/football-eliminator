import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Prompt } from 'react-router-dom';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import { useToasts } from 'react-toast-notifications';

import Jimp from 'jimp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import 'rc-slider/assets/index.css';
import './profileStyle.css';

import { ReAuth, ImageEditor } from './ModalWindows';
import UserProfile from './UserProfile';
import GroupProfile from './GroupProfile';
import FourOFour from '../404';
import GroupEditor from './GroupEditor';

const Alert = withReactContent(Swal);

const userFields = { username: ``, email: ``, password: ``, avatar: `` };
const groupFields = { groupName: ``, avatar: ``, groupDesc: `` };

const Profile = ({ authUser, currentUser, firebase, match, history }) => {

    const [modalOpen, updateModal] = useState(false);
    const [modalState, updateModalState] = useState(`reAuth`);
    const [updatedFields, changeUpdatedFields] = useState({ ...userFields, ...groupFields });
    const [avatar, updateAvatar] = useState(``);
    const [tempAvatar, updateTempAvatar] = useState(``);

    //Group State
    const [groupInfo, updateGroupInfo] = useState({});
    const [groupPositions, updateGroupPositions] = useState([]);

    const fileInputRef = useRef(null);

    const { addToast } = useToasts();

    useEffect(() => {
        if (match.params.type === `user`) {
            changeUpdatedFields({ ...userFields });
        } else if (match.params.type === `group`) {
            changeUpdatedFields({ ...groupFields });
        }
        return function cleanup() {
            updateAvatar(``);
        }
    }, [match.params.type]);

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
            if (!!e.target.files[0].type.match(`image.*`)) {
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

        //Putting this after the avatar check in case they upload a non image
        changeUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
    };

    const saveCroppedAvatar = (mime) => {
        updateTempAvatar(``);
        updateAvatar(mime);
        openCloseModal();
        updateModalState(`reAuth`);
        changeUpdatedFields({ ...updatedFields, avatar: `active` });
    };

    //This is fired if someone pressed ESC or clicks off the modal
    const requestCloseModal = () => {
        updateModal(!modalOpen);
        updateTempAvatar(``);
    };

    const handleSubmit = () => {
        if (match.params.type === `user`) {
            if (updatedFields.email !== ``) {
                let checkEmail = updatedFields.email.match(/^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                if (!checkEmail) {
                    Alert.fire({
                        type: `warning`,
                        title: `Email is invalid`,
                        text: `Please check the email field and enter again`,
                    });
                    return;
                }
            }
        }

        if (checkIfReAuthNeeded) {
            updateModalState(`reAuth`);
            openCloseModal();
        } else if (updatedFields.avatar) { //Do not require users to re sign in if they`re just updating their avatar
            saveAvatarToAWS(avatar);
        }
    };

    const saveAvatarToAWS = () => {
        const idToUpdate = match.params.type === `user` ? currentUser.userId : groupInfo._id;
        //Using Fetch here to send along the base64 encoded image
        fetch(`/api/avatar/${idToUpdate}`, {
            method: `PUT`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: avatar })
        })
            .then(() => addToast('Avatar Saved', { appearance: 'success', autoDismiss: true }))
    };

    const notAnImage = () => {
        Alert.fire({
            title: `Only Upload Images`,
            text: `File is not an image. Please only upload images`,
            showConfirmButton: false,
            showCancelButton: true,
        });
    };

    const changeGroup = (newGroup) => {
        history.push(`/profile/group/${newGroup}`);
    };

    const checkIfSaveNeeded =
        match.params.type === `user` ?
            updatedFields.avatar !== `` ||
            updatedFields.email !== `` ||
            updatedFields.password !== `` ||
            updatedFields.username !== ``
            :
            false;

    const checkIfReAuthNeeded =
        match.params.type === `user` ?
            updatedFields.email !== `` ||
            updatedFields.password !== `` ||
            updatedFields.username !== ``
            :
            updatedFields.groupName !== ``;

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
                        Sensitive Data Updated<br />Relogin Required
                    </div>
                }
            </div>
            {match.params.type === `user` ?
                <UserProfile
                    authUser={authUser}
                    currentUser={currentUser}
                    username={match.params.name}
                    handleChange={handleChange}
                    fileInputRef={fileInputRef}
                    checkIfSaveNeeded={checkIfSaveNeeded}
                    handleSubmit={handleSubmit}
                    avatar={avatar}
                    updatedFields={updatedFields}
                    modalOpen={modalOpen}
                    updateAvatar={updateAvatar}
                />
                :
                match.params.type === `group` ?
                    <GroupProfile
                        groupName={match.params.name}
                        currentUser={currentUser}
                        updateAvatar={updateAvatar}
                        openCloseModal={openCloseModal}
                        avatar={avatar}
                        groupInfo={groupInfo}
                        updateGroupInfo={updateGroupInfo}
                        updateModalState={updateModalState}
                        modalOpen={modalOpen}
                        groupPositions={groupPositions}
                        updateGroupPositions={updateGroupPositions}
                        changeUpdatedFields={changeUpdatedFields}
                    />
                    :
                    <FourOFour />
            }
            <Modal
                onRequestClose={requestCloseModal}
                isOpen={modalOpen}
                contentLabel='profileModal'
                className={`profileModal ${modalState === `group` && `groupModalHeight`}`}
                overlayClassName='modalOverlay'
                ariaHideApp={false}>
                {modalState === `reAuth` ?
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
                    modalState === `avatar` ?
                        <ImageEditor
                            tempAvatar={tempAvatar}
                            saveCroppedAvatar={saveCroppedAvatar}
                            openCloseModal={openCloseModal}
                            fileInputRef={fileInputRef}
                        />
                        :
                        <GroupEditor
                            updateGroupInfo={updateGroupInfo}
                            groupInfo={groupInfo}
                            groupPositions={groupPositions}
                            updateGroupPositions={updateGroupPositions}
                            updatedFields={updatedFields}
                            changeUpdatedFields={changeUpdatedFields}
                            updateAvatar={updateAvatar}
                            openCloseModal={openCloseModal}
                            changeGroup={changeGroup}
                        />
                }
            </Modal>
        </Fragment>
    );
};

Profile.propTypes = {
    authUser: PropTypes.any,
    currentUser: PropTypes.object,
    firebase: PropTypes.any,
    match: PropTypes.any,
    history: PropTypes.any
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