import { useContext, useEffect, useState } from 'react';
import { CurrentUserContext } from '../../../App';
import { useParams } from 'react-router-dom';
import { axiosHandler, httpErrorHandler } from '../../../utils/axiosHandler';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import toast from 'react-hot-toast';

const Alert = withReactContent(Swal);

const GroupBox = ({ group }) => {
  const [groupBoxInfo, setGroupBoxInfo] = useState({
    groupData: {},
    userScore: {},
    topScore: {},
  });

  const { currentUser, pullUserData } = useContext(CurrentUserContext);
  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    getGroupInfo();
  }, [group]);

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  const params = useParams();

  const getGroupInfo = async () => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/profile/box/${params.name}/${group.name}`,
        axiosCancel.token
      );
      setGroupBoxInfo(data);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const leaveGroup = async () => {
    let res;
    try {
      res = await Alert.fire({
        title: 'Are you sure about that?',
        text: 'This cannot be reversed',
        showCancelButton: true,
        cancelButtonText: 'Stay in group',
        confirmButtonText: 'Leave group',
        confirmButtonColor: '#ffc107',
      });
    } catch (err) {
      toast.error('Error calling delete confirm');
    }
    try {
      if (res.isConfirmed) {
        console.log({ uid: currentUser.userId });
        await axiosHandler.delete(
          `/api/group/user/${group._id}/${currentUser.userId}`
        );
        pullUserData();
      }
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  return (
    <>
      <div className='row mt-2'>
        <h4 className='col-12 text-center'>
          <Link to={`/profile/group/${groupBoxInfo.groupData.name}`}>
            {groupBoxInfo.groupData.name}
          </Link>
        </h4>
      </div>
      <div className='row mt-1'>
        <div className='col-6 ps-4'>
          <div className='row'>
            <div className='col-12'>{groupBoxInfo.groupData.description}</div>
          </div>
          {groupBoxInfo.userlist && (
            <div className='row'>
              <div className='col-12'>
                Current Users: {groupBoxInfo.userlist.length}
              </div>
            </div>
          )}
        </div>
        <div className='col-6 pt-1'>
          <div className='row border-bottom'>
            <div className='col-4 fw-bold'>Top Score</div>
            <div className='col-4'>{groupBoxInfo.topScore.username}</div>
            <div className='col-4'>{groupBoxInfo.topScore.totalScore}</div>
          </div>
          <div className='row'>
            <div className='col-4 fw-bold'>User's Score</div>
            <div className='col-4'>{groupBoxInfo.userScore.username}</div>
            <div className='col-4'>{groupBoxInfo.userScore.totalScore}</div>
          </div>
        </div>
        {params.name === currentUser.username && (
          <div className='row mt-3 mb-2'>
            <div className='col-12 text-center'>
              <button className='btn btn-warning' onClick={() => leaveGroup()}>
                Leave Group
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GroupBox;
