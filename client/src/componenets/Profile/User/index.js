import React, { useEffect, useState } from 'react';
import Session from '../../Session';
import 'jimp';
import { useParams } from 'react-router-dom';

import 'rc-slider/assets/index.css';
import '../profileStyle.css';

import UserInfoUpdateForm from './UserInfoUpdateForm';
import ReminderUpdateForm from './ReminderUpdateForm';

const UserProfile = ({ currentUser, pullUserData }) => {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [disableAllFields, setDisableAllFields] = useState(false);

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
              currentUser={currentUser}
              pullUserData={pullUserData}
            />
          </div>
        </div>
        <div className='mt-5 justify-content-center row'>
          <div className='col-md-12 col-lg-8 border rounded shadow'>
            <ReminderUpdateForm
              disableAllFields={disableAllFields}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Session(UserProfile);
