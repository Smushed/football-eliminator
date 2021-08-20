import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import './profileStyle.css';

import DisplayBox from '../DisplayBox';
import { AvatarInput, UsernameInput, EmailInput, PasswordInput } from './ProfileInputs';

const UserProfile = ({
    authUser,
    currentUser,
    username,
    handleChange,
    fileInputRef,
    checkIfSaveNeeded,
    handleSubmit,
    avatar,
    updateAvatar,
    updatedFields,
    modalOpen }) => {

    const [showPassword, updateShowPassword] = useState(`password`);

    useEffect(() => {
        axios.get(`/api/user/name/${username}`)
            .then(res => {
                updateAvatar(res.data.avatar);
            });
    }, [updateAvatar, username]);

    const toggleShowPassword = () => {
        showPassword === `password` ? updateShowPassword(`text`) : updateShowPassword(`password`);
    };

    return (
        <>
            <div className='developmentNotice'>
                This page is actively under development. Please check back soon to see the updated version!
            </div>
            <div className='profileWrapper '>
                <div className='profileLeft'>
                    <div className='profileName'>
                        {username}
                    </div>
                    <div className='userAvatarWrapper'>
                        <img className='userAvatar' src={avatar} />
                    </div>
                </div>
                <div className='profileRight'>
                    <UsernameInput
                        handleChange={handleChange}
                        username={updatedFields.username}
                        currentUser={currentUser.username}
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
                    <select className='form-select groupDropdown' name='mainGroup' value={updatedFields.mainGroup} onChange={handleChange}>
                        {currentUser.GL && currentUser.GL.map(group => <option key={group._id} value={group._id}>{group.N}</option>)}
                    </select>
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
                                <div key={group._id} className='smallScreenCenterBox'>
                                    <DisplayBox
                                        boxContent={group.N}
                                        type='group'
                                        buttonActive={true}
                                        inGroup={true}
                                    />
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </>
    )
}

UserProfile.propTypes = {
    authUser: PropTypes.any,
    currentUser: PropTypes.object,
    username: PropTypes.string,
    firebase: PropTypes.any,
    handleChange: PropTypes.func,
    fileInputRef: PropTypes.any,
    checkIfSaveNeeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    avatar: PropTypes.any,
    updateAvatar: PropTypes.func,
    updatedFields: PropTypes.object,
    modalOpen: PropTypes.bool
};

export default UserProfile;