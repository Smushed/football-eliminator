import { useState, useEffect, useContext, useRef } from 'react';
import { ReAuth, ImageEditor } from '../../Modal';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useHistory } from 'react-router-dom';
import { getAuth, updatePassword } from 'firebase/auth';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  EmailInput,
  MainGroupInput,
  PasswordInput,
  UsernameInput,
} from '../../Tools/ProfileInputs';
import { AvatarContext } from '../../../contexts/Avatars';
import { differencesInObj } from '../../../utils/genericTools';
import { axiosHandler, httpErrorHandler } from '../../../utils/axiosHandler';
import { CurrentUserContext } from '../../../contexts/CurrentUser';

const Alert = withReactContent(Swal);

const UserInfoUpdateForm = ({
  disableAllFields,
  setDisableAllFields,
  isCurrentUser,
  setCurrentUserGrouplist,
}) => {
  const [showHidePassword, setShowHidePassword] = useState('password');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState('reAuth');
  const [tempAvatar, setTempAvatar] = useState('');
  const [errors, setErrors] = useState([]);
  const [originalState, setOriginalState] = useState({});
  const [reAuthSuccess, setReAuthSuccess] = useState(false);
  const [userFieldsOnPage, setUserFieldsOnPage] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    mainGroup: '',
    grouplist: [],
  });

  const { addUserAvatarsToPull, repullUserAvatars, userAvatars } =
    useContext(AvatarContext);
  const { currentUser, pullUserData } = useContext(CurrentUserContext);
  const history = useHistory();
  const params = useParams();
  const fileInputRef = useRef(null);
  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    const authUser = getAuth().currentUser;
    if (currentUser && authUser) {
      userProfilePull(params.name);
    }
  }, [params.name, currentUser]);

  useEffect(() => {
    if (reAuthSuccess) {
      updateUserInfo();
    }
  }, [reAuthSuccess]);

  const requestCloseModal = () => {
    openCloseModal(false);
    setTempAvatar('');
  };

  const notSupportedImage = () => {
    Alert.fire({
      title: 'Webp not supported',
      text: 'Webp files are not currently supported by editor, sorry for the inconvenience',
      showCancelButton: true,
      showConfirmButton: false,
    });
  };

  const openCloseModal = (cmd) => {
    setModalOpen(cmd);
    if (cmd === false && isCurrentUser) {
      setDisableAllFields(false);
    }
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

  const saveAvatarToAWS = (updatedAvatar) => {
    fetch(`/api/avatar/${currentUser.userId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: updatedAvatar }),
    })
      .then(() => {
        toast.success('Avatar Saved');
        repullUserAvatars([userFieldsOnPage.id]);
        return;
      })
      .catch(() => toast.error('Error Saving the Avatar'));
  };

  const saveCroppedAvatar = (mime) => {
    setTempAvatar('');
    openCloseModal(false);
    setModalState(`reAuth`);
    saveAvatarToAWS(mime);
  };

  const userProfilePull = async (username) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/user/name/${username}`,
        axiosCancel.token
      );
      createProfileFields(data.user);
      if (!userAvatars[data.user._id]) {
        addUserAvatarsToPull([data.user._id]);
      }
    } catch (err) {
      httpErrorHandler(err);
    }
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

  const createProfileFields = async (user) => {
    try {
      const grouplist = await axiosHandler.get(
        `/api/group/details/all/user/${user._id}`,
        axiosCancel.token
      );
      setCurrentUserGrouplist(grouplist.data);
      const builtUser = {
        password: '',
        id: user._id,
        username: user.username,
        email: user.email,
        mainGroup: user.mainGroup,
        grouplist: grouplist.data,
      };
      setOriginalState(builtUser);
      setUserFieldsOnPage(builtUser);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const updateInfo = () => {
    const updatedFields = differencesInObj(originalState, userFieldsOnPage);
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

  const updateUserInfo = async () => {
    const updatedFields = differencesInObj(originalState, userFieldsOnPage);
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
    if (updatedFields.username !== undefined) {
      request.username = updatedFields.username.trim();
      needToUpdateDb = true;
    }
    if (updatedFields.mainGroup !== undefined) {
      request.mainGroup = updatedFields.mainGroup;
      needToUpdateDb = true;
    }
    if (needToUpdateDb) {
      try {
        await axiosHandler.put(`/api/user/update`, {
          request,
          userId: currentUser.userId,
        });
        pullUserData();
        if (request.username !== undefined) {
          history.push(`/profile/user/${request.username}`);
          return;
        }
        userProfilePull(params.name);
        toast.success('Profile Updated', {
          position: 'top-right',
          duration: 4000,
        });
      } catch (err) {
        httpErrorHandler(err);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'avatar') {
      if (!!e.target.files[0].type.match('image.*')) {
        const file = e.target.files[0];
        fileInputRef.current.value = '';
        if (file.type === 'image/webp') {
          notSupportedImage();
          e.target.value = '';
          return;
        }
        Jimp.read(URL.createObjectURL(file), async (err, img) => {
          if (err) {
            console.log(err);
            toast.error('Error processing image!');
            return;
          }
          const mime = await img.getBase64Async(Jimp.MIME_JPEG);
          setTempAvatar(mime);
        });
        setModalState('avatar');
        openCloseModal(true);
      } else {
        notAnImage();
        e.target.value = '';
      }
      return; //User cancelled the crop, return
    } else if (e.target.name === 'email') {
      toast.error('Email updating not currently supported', {
        duration: 4000,
        position: 'top-right',
      });
      return;
    } else {
      setUserFieldsOnPage({
        ...userFieldsOnPage,
        [e.target.name]: e.target.value,
      });
    }
  };

  return (
    <>
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
        <div className='col-md-12 col-lg-6 mt-1 text-center'>
          <img
            className={`rounded ${currentUser ? 'mt-5' : 'mt-1'}`}
            name='avatar'
            src={userAvatars[userFieldsOnPage.id]}
          />
        </div>
        <div className='col-md-12 col-lg-6 mt-2'>
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
            disabled={true}
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
              {userFieldsOnPage.grouplist.length > 0 && (
                <MainGroupInput
                  grouplist={userFieldsOnPage.grouplist}
                  mainGroup={userFieldsOnPage.mainGroup}
                  handleChange={handleChange}
                  disabled={disableAllFields}
                />
              )}
            </div>
          </div>
        </div>
        {isCurrentUser ? (
          <div className='row justify-content-center mt-3 mb-4 text-center'>
            <div className='col-6'>
              <label className='btn btn-primary'>
                Upload Avatar
                <input
                  type='file'
                  hidden={true}
                  ref={fileInputRef}
                  disabled={disableAllFields}
                  name='avatar'
                  onChange={handleChange}
                />
              </label>
            </div>
            <div className='col-6'>
              <button
                className='btn btn-primary'
                onClick={updateInfo}
                disabled={disableAllFields}
              >
                Update Info
              </button>
            </div>
          </div>
        ) : (
          <div className='mt-5' />
        )}
      </div>
      <Modal
        onRequestClose={requestCloseModal}
        isOpen={modalOpen}
        contentLabel='modalWindow'
        className='modalWindow'
        overlayClassName='modalOverlay'
        ariaHideApp={false}
      >
        {modalState === 'reAuth' ? (
          <ReAuth
            openCloseModal={openCloseModal}
            reAuthSuccess={setReAuthSuccess}
          />
        ) : (
          modalState === 'avatar' && (
            <ImageEditor
              tempAvatar={tempAvatar}
              saveCroppedAvatar={saveCroppedAvatar}
              openCloseModal={openCloseModal}
            />
          )
        )}
      </Modal>
    </>
  );
};

export default UserInfoUpdateForm;
