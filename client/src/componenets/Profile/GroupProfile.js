import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import './profileStyle.css';

import DisplayBox from '../DisplayBox';
import { AvatarInput } from './ProfileInputs';

const GroupProfile = ({
    groupName,
    currentUser,
    handleChange,
    fileInputRef,
    checkIfSaveNeeded,
    handleSubmit,
    avatar,
    updateAvatar,
    groupInfo,
    updateGroupInfo,
    updatedFields,
    modalOpen }) => {

    const [adminStatus, updateAdminStatus] = useState(false);

    useEffect(() => {
        if (groupName) {
            pullGroupInfo()
        }
        if (currentUser.userId) {
            if (groupInfo.UL) {
                checkForAdmin(groupInfo)
            } else {
                pullGroupInfo();
            }
        }
    }, [groupName, updateAvatar, updateGroupInfo, currentUser]);

    const pullGroupInfo = () => {
        axios.get(`/api/group/name/${groupName}`)
            .then(res => {
                updateGroupInfo(res.data.group);
                updateAvatar(res.data.avatar);
                if (currentUser) {
                    checkForAdmin(res.data.group);
                }
            });
    }

    const checkForAdmin = (group) => {
        const selfInGroup = group.UL.find(user => user._id === currentUser.userId);
        if (selfInGroup) {
            updateAdminStatus(selfInGroup.A);
        }
    }

    return (
        <div className='profileWrapper '>
            <div className='profileLeft'>
                <div className='profileName'>
                    {groupName}
                </div>
                <div className='userAvatarWrapper'>
                    <img className='userAvatar' src={avatar} />
                </div>
            </div>
            <div className='profileRight'>
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
                        Active Users:
                    </div>
                    {groupInfo.UL &&
                        groupInfo.UL.map((user) =>
                            <DisplayBox
                                key={user._id}
                                boxContent={user.UN}
                                type='user'
                                buttonActive={adminStatus}
                                inGroup={true}
                            />)}
                </div>
            </div>
        </div>
    )
}

GroupProfile.propTypes = {
    groupName: PropTypes.string,
    currentUser: PropTypes.object,
    handleChange: PropTypes.func,
    fileInputRef: PropTypes.any,
    checkIfSaveNeeded: PropTypes.bool,
    handleSubmit: PropTypes.func,
    avatar: PropTypes.any,
    updateAvatar: PropTypes.func,
    updatedFields: PropTypes.object,
    modalOpen: PropTypes.bool,
    groupInfo: PropTypes.object,
    updateGroupInfo: PropTypes.func
};

export default GroupProfile;