import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import Session from '../Session';

import 'jimp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import 'rc-slider/assets/index.css';
import './profileStyle.css';

import { ReAuth, ImageEditor, UserEditor } from './ModalWindows';
import GroupEditor from './GroupEditor';
import UserProfile from './UserProfile';
import GroupProfile from './GroupProfile';
import FourOFour from '../404';

const Alert = withReactContent(Swal);

const userFields = {
  username: ``,
  email: ``,
  password: ``,
  mainGroup: ``,
  leaderboardEmail: true,
  reminderEmail: true,
};
const groupFields = { groupName: ``, groupDesc: `` };

const Profile = ({
  authUser,
  currentUser,
  firebase,
  match,
  history,
  pullUserData,
}) => {
  const [modalOpen, updateModal] = useState(false);
  const [modalState, updateModalState] = useState(`reAuth`);
  const [updatedFields, changeUpdatedFields] = useState({
    ...userFields,
    ...groupFields,
  });
  const [avatar, updateAvatar] = useState(``);
  const [tempAvatar, updateTempAvatar] = useState(``);
  const [groupInfo, updateGroupInfo] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (match.params.type === `user`) {
      changeUpdatedFields({ ...userFields, mainGroup: currentUser.MG });
    }
  }, [match.params.type, currentUser]);

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
        Jimp.read(URL.createObjectURL(e.target.files[0]), async (err, img) => {
          if (err) {
            console.log(err);
            toast.error(`Error processing image!`);
            return;
          }
          const mime = await img.getBase64Async(Jimp.MIME_JPEG);
          updateTempAvatar(mime);
        });
        updateModalState(`avatar`);
        openCloseModal();
      } else {
        notAnImage();
        e.target.value = '';
      }
      return; //Don't want to set updated fields here in case the user cancels the crop
    }
    changeUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
  };

  const saveCroppedAvatar = (mime) => {
    updateTempAvatar(``);
    updateAvatar(mime);
    openCloseModal();
    updateModalState(`reAuth`);
    saveAvatarToAWS(mime);
  };

  //This is fired if someone pressed ESC or clicks off the modal
  const requestCloseModal = () => {
    updateModal(!modalOpen);
    updateTempAvatar(``);
  };

  const saveAvatarToAWS = (updatedAvatar) => {
    const idToUpdate =
      match.params.type === `user` ? currentUser.userId : groupInfo._id;
    //Using Fetch here to send along the base64 encoded image
    fetch(`/api/user/avatar/${idToUpdate}`, {
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

  const changeGroup = (newGroup) => {
    history.push(`/profile/group/${newGroup}`);
  };

  return (
    <>
      <div className={modalOpen ? 'greyBackdrop' : ''} />

      {match.params.type === `user` ? (
        <UserProfile
          currentUser={currentUser}
          username={match.params.name}
          fileInputRef={fileInputRef}
          avatar={avatar}
          openCloseModal={openCloseModal}
          updateAvatar={updateAvatar}
          handleChange={handleChange}
          updateModalState={updateModalState}
          pullUserData={pullUserData}
          currUserEmail={authUser && authUser.email}
        />
      ) : match.params.type === `group` ? (
        <GroupProfile
          groupName={match.params.name}
          currentUser={currentUser}
          handleChange={handleChange}
          updateAvatar={updateAvatar}
          fileInputRef={fileInputRef}
          avatar={avatar}
          groupInfo={groupInfo}
          updateGroupInfo={updateGroupInfo}
          updateModalState={updateModalState}
          openCloseModal={openCloseModal}
        />
      ) : (
        <FourOFour />
      )}
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
        ) : modalState === `avatar` ? (
          <ImageEditor
            tempAvatar={tempAvatar}
            saveCroppedAvatar={saveCroppedAvatar}
            openCloseModal={openCloseModal}
            fileInputRef={fileInputRef}
          />
        ) : modalState === `group` ? (
          <GroupEditor
            updateGroupInfo={updateGroupInfo}
            groupInfo={groupInfo}
            updatedFields={updatedFields}
            changeUpdatedFields={changeUpdatedFields}
            openCloseModal={openCloseModal}
            changeGroup={changeGroup}
          />
        ) : (
          <UserEditor
            changeUpdatedFields={changeUpdatedFields}
            updatedFields={updatedFields}
            currentUser={currentUser}
            modalOpen={modalOpen}
            authUser={authUser}
            updateModalState={updateModalState}
            openCloseModal={openCloseModal}
          />
        )}
      </Modal>
    </>
  );
};

Profile.propTypes = {
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

export default Session(Profile);
