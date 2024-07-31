import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import Session from '../Session';

import 'jimp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import 'rc-slider/assets/index.css';
import './profileStyle.css';

import { ReAuth, ImageEditor, UserEditor } from '../../Modal';
import GroupEditor from './GroupEditor';
import GroupProfile from './GroupProfile';

const Alert = withReactContent(Swal);

const userFields = {
  username: '',
  email: '',
  password: '',
  mainGroup: '',
  leaderboardEmail: true,
  reminderEmail: true,
};
const groupFields = { groupName: '', groupDesc: '' };

const Profile = ({
  authUser,
  currentUser,
  firebase,
  match,
  history,
  pullUserData,
}) => {
  const [modalOpen, updateModal] = useState(false);
  const [modalState, updateModalState] = useState('reAuth');
  const [updatedFields, changeUpdatedFields] = useState({
    ...userFields,
    ...groupFields,
  });
  const [avatar, updateAvatar] = useState('');
  const [tempAvatar, updateTempAvatar] = useState('');
  const [groupInfo, updateGroupInfo] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (match.params.type === 'user') {
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
    if (e.target.name === 'avatar') {
      //Checks if the file uploaded is an image
      if (!!e.target.files[0].type.match('image.*')) {
        Jimp.read(URL.createObjectURL(e.target.files[0]), async (err, img) => {
          if (err) {
            console.log(err);
            toast.error('Error processing image!');
            return;
          }
          const mime = await img.getBase64Async(Jimp.MIME_JPEG);
          updateTempAvatar(mime);
        });
        updateModalState('avatar');
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
    updateTempAvatar('');
    updateAvatar(mime);
    openCloseModal();
    updateModalState('reAuth');
    saveAvatarToAWS(mime);
  };

  //This is fired if someone pressed ESC or clicks off the modal
  const requestCloseModal = () => {
    updateModal(!modalOpen);
    updateTempAvatar('');
  };

  const saveAvatarToAWS = (updatedAvatar) => {
    const idToUpdate =
      match.params.type === 'user' ? currentUser.userId : groupInfo._id;
    //Using Fetch here to send along the base64 encoded image
    fetch(`/api/avatar/${idToUpdate}`, {
      method: 'PUT',
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
      title: 'Only Upload Images',
      text: 'File is not an image. Please only upload images',
      showConfirmButton: false,
      showCancelButton: true,
    });
  };

  const changeGroup = (newGroup) => {
    history.push(`/profile/group/${newGroup}`);
  };

  return (
    <>
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
      <Modal
        onRequestClose={requestCloseModal}
        isOpen={modalOpen}
        contentLabel='modalWindow'
        className={'modalWindow'}
        overlayClassName='modalOverlay'
        ariaHideApp={false}
      >
        {modalState === 'avatar' ? (
          <ImageEditor
            tempAvatar={tempAvatar}
            saveCroppedAvatar={saveCroppedAvatar}
            openCloseModal={openCloseModal}
            fileInputRef={fileInputRef}
          />
        ) : (
          <GroupEditor
            updateGroupInfo={updateGroupInfo}
            groupInfo={groupInfo}
            updatedFields={updatedFields}
            changeUpdatedFields={changeUpdatedFields}
            openCloseModal={openCloseModal}
            changeGroup={changeGroup}
          />
        )}
      </Modal>
    </>
  );
};

export default Session(Profile);
