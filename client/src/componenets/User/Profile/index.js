import React, { useEffect, useState, useContext } from 'react';
import Session from '../../../contexts/Firebase/Session/index.js';
import 'jimp';
import { useParams } from 'react-router-dom';

import 'rc-slider/assets/index.css';

import UserInfoUpdateForm from './UserInfoUpdateForm.js';
import ReminderUpdateForm from './ReminderUpdateForm.js';
import { CurrentUserContext } from '../../../contexts/CurrentUser';
import GroupBox from '../../Group/Profile/GroupBox.js';

const UserProfile = () => {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [disableAllFields, setDisableAllFields] = useState(false);
  const [currentUserGrouplist, setCurrentUserGrouplist] = useState([]);

  const { currentUser } = useContext(CurrentUserContext);
  const params = useParams();

  useEffect(() => {
    setIsCurrentUser(params.name === currentUser.username);
    setDisableAllFields(params.name !== currentUser.username);
  }, [params.name, currentUser]);

  return (
    <>
      <div className='container'>
        <div className='mt-5 justify-content-center row'>
          <div className='col-xs-12 col-lg-8 border rounded shadow'>
            <UserInfoUpdateForm
              disableAllFields={disableAllFields}
              setDisableAllFields={setDisableAllFields}
              isCurrentUser={isCurrentUser}
              setCurrentUserGrouplist={setCurrentUserGrouplist}
            />
          </div>
        </div>
        {isCurrentUser && (
          <div className='mt-5 justify-content-center row'>
            <div className='col-xs-12 col-lg-8 border rounded shadow'>
              <ReminderUpdateForm
                disableAllFields={disableAllFields}
                currentUser={currentUser}
              />
            </div>
          </div>
        )}
        <div className='mt-5 justify-content-center row'>
          <div className='col-xs-12 col-lg-8 border rounded shadow'>
            {currentUserGrouplist.map((group) => (
              <GroupBox key={group._id} group={group} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Session(UserProfile);
