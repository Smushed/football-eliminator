import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import './profileStyle.css';

import DisplayBox from '../DisplayBox';
import PencilSVG from '../../constants/SVG/pencil.svg';

const UserProfile = ({
    currentUser,
    username,
    fileInputRef,
    avatar,
    updateAvatar,
    openCloseModal,
    updateModalState,
    handleChange
}) => {


    useEffect(() => {
        axios.get(`/api/user/name/${username}`)
            .then(res => {
                updateAvatar(res.data.avatar);
            });
    }, [updateAvatar, username]);

    const isCurrentUser = username === currentUser.username;

    return (
        <>
            <div className='flex centerFlex profileHeader'>
                <div className='block marginHeightAuto groupProfileNameDesc'>
                    <div className='profileName marginHeightAuto'>
                        {username}
                    </div>
                    {isCurrentUser &&
                        <button className='btn btn-sm btn-info' onClick={() => { openCloseModal(); updateModalState(`user`) }}>
                            Edit Information
                        </button>
                    }
                </div>

                <div className='profileAvatarWrapper'>
                    <div className='editAvatarSVGWrapper'>
                        <img className='editAvatarSVG' src={PencilSVG} />
                    </div>
                    <label htmlFor='groupAvatar'>
                        <img className={`profileAvatar ${isCurrentUser ? `editAvatar` : ``}`} name='avatar' src={avatar} />
                    </label>
                    {isCurrentUser &&
                        <input id='groupAvatar' name='avatar' type='file' onChange={handleChange} ref={fileInputRef} />
                    }
                </div>
                {/* <div className='profileAvatarWrapper'>
                    <img className='profileAvatar' src={avatar} />
                </div> */}
            </div>

            <div className='profileDisplayHeader'>
                Joined Groups:
            </div>
            <div className='profileWrapper flex flexWrap centerFlex'>
                {currentUser.GL &&
                    currentUser.GL.map((group) =>
                        <DisplayBox
                            key={group._id}
                            boxContent={group._id}
                            type='group'
                            buttonActive={isCurrentUser}
                        />
                    )}
            </div>
        </>
    )
}

UserProfile.propTypes = {
    currentUser: PropTypes.object,
    username: PropTypes.string,
    fileInputRef: PropTypes.any,
    avatar: PropTypes.any,
    updateAvatar: PropTypes.func,
    openCloseModal: PropTypes.func,
    updateModalState: PropTypes.func,
    handleChange: PropTypes.func
};

export default UserProfile;