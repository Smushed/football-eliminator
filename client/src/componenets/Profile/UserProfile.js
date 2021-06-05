import React, { useState } from 'react';
import PropTypes from 'prop-types';

import './profileStyle.css';

import DisplayBox from '../DisplayBox';
import { AvatarInput, UsernameInput, EmailInput, PasswordInput } from './ProfileInputs';

const UserProfile = ({
    authUser,
    currentUser,
    handleChange,
    fileInputRef,
    checkIfSaveNeeded,
    handleSubmit,
    avatar,
    updatedFields,
    modalOpen }) => {

    const [showPassword, updateShowPassword] = useState(`password`);

    const toggleShowPassword = () => {
        showPassword === `password` ? updateShowPassword(`text`) : updateShowPassword(`password`);
    };

    return (
        <div className='profileWrapper '>
            <div className='profileLeft'>
                <div className='profileName'>
                    {currentUser.username}
                </div>
                <div className='userAvatarWrapper'>
                    <img className='userAvatar' src={avatar} />
                </div>
            </div>
            <div className='profileRight'>
                <UsernameInput
                    handleChange={handleChange}
                    username={updatedFields.username}
                    currentUser={currentUser}
                    modalOpen={modalOpen}
                />
                <PasswordInput
                    handleChange={handleChange}
                    toggleShowPassword={toggleShowPassword}
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
                    {currentUser.GL &&
                        currentUser.GL.map((group) =>
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
    )
}

UserProfile.propTypes = {
    authUser: PropTypes.any,
    currentUser: PropTypes.object,
    firebase: PropTypes.any,
    handleChange: PropTypes.func,
    fileInputRef: PropTypes.any,
    checkIfSaveNeeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    avatar: PropTypes.any,
    updatedFields: PropTypes.object,
    modalOpen: PropTypes.bool
};

export default UserProfile;