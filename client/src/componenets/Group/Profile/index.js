import React, { useEffect, useState, useRef, useContext } from 'react';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import Session from '../../../contexts/Firebase/Session';
import { Carousel } from 'react-responsive-carousel';

import 'jimp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import 'rc-slider/assets/index.css';
import axios from 'axios';

import { ImageEditor } from '../../Modal';
import { axiosHandler, httpErrorHandler } from '../../../utils/axiosHandler';
import { CurrentUserContext } from '../../../App';

const Alert = withReactContent(Swal);

const GroupProfile = () => {
  const [modalOpen, updateModal] = useState(false);
  const [updatedFields, changeUpdatedFields] = useState({});
  const [avatar, updateAvatar] = useState('');
  const [tempAvatar, updateTempAvatar] = useState('');
  const [groupInfo, updateGroupInfo] = useState({});
  const [groupPositions, updateGroupPositions] = useState({});
  const [scoringDetails, updateScoringDetails] = useState({});
  const [detailedUserlist, updateDetailedUserlist] = useState([]);

  const fileInputRef = useRef(null);

  const { currentUser } = useContext(CurrentUserContext);

  const params = useParams();

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    if (params.name && currentUser.username) {
      pullGroupInfo(params.name);
    }
  }, [params.name, currentUser.username]);

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel('Unmounted');
      }
    };
  }, []);

  const pullGroupInfo = async (groupName) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/profile/${groupName}`,
        axiosCancel.token
      );
      updateGroupInfo(data.group);
      updateGroupPositions(data.positions);
      updateAvatar(data.avatar);
      updateDetailedUserlist(data.userlist);
      updateScoringDetails({
        scoringPoints: data.scoring,
        scoringBucketDescription: data.scoringBucketDescription,
        scoringDetailDescription: data.scoringDetailDescription,
      });
      console.log({ data });
    } catch (err) {
      httpErrorHandler(err);
    }
  };

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
    saveAvatarToAWS(mime);
  };

  //This is fired if someone pressed ESC or clicks off the modal
  const requestCloseModal = () => {
    updateModal(!modalOpen);
    updateTempAvatar('');
  };

  const saveAvatarToAWS = (updatedAvatar) => {
    //Using Fetch here to send along the base64 encoded image
    fetch(`/api/avatar/${groupInfo._id}`, {
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

  return (
    <>
      <div className='d-flex justify-content-center container'>
        <div className='block'>
          <div>{groupInfo.name && groupInfo.name}</div>
          <div>{groupInfo.description && groupInfo.description}</div>
          {/* {adminStatus && (
            <button
              className='btn btn-sm btn-info'
              onClick={() => {
                openCloseModal();
              }}
            >
              Edit Group
            </button>
          )} */}
        </div>
        <div>
          <img name='avatar' src={avatar} />
        </div>
      </div>
      <div>
        <div>Users:</div>
        <div className='d-flex justify-content-center row'>
          {detailedUserlist &&
            detailedUserlist.map((user) => (
              <div key={user._id}>{user.username}</div>
            ))}
        </div>
      </div>
      <div>
        <div>Scoring System:</div>
        {scoringDetails.scoringBucketDescription && (
          <Carousel autoPlay infiniteLoop interval={10000}>
            {Object.keys(scoringDetails.scoringBucketDescription).map(
              (bucket) => (
                <>
                  <div>
                    {scoringDetails.scoringBucketDescription[bucket]} -----
                  </div>
                  {Object.keys(
                    scoringDetails.scoringDetailDescription[bucket]
                  ).map((detail) => (
                    <div>
                      {scoringDetails.scoringDetailDescription[bucket][detail]}
                    </div>
                  ))}
                </>
              )
            )}
          </Carousel>
        )}
      </div>
      <Modal
        onRequestClose={requestCloseModal}
        isOpen={modalOpen}
        contentLabel='modalWindow'
        className={'modalWindow'}
        overlayClassName='modalOverlay'
        ariaHideApp={false}
      >
        <ImageEditor
          tempAvatar={tempAvatar}
          saveCroppedAvatar={saveCroppedAvatar}
          openCloseModal={openCloseModal}
          fileInputRef={fileInputRef}
        />
      </Modal>
    </>
  );
};

export default Session(GroupProfile);
