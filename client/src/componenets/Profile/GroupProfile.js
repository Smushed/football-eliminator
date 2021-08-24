import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Leaderboard from '../Home/Leaderboard';

import './profileStyle.css';

import DisplayBox from '../DisplayBox';
import RosterCarousel from '../Home/RosterCarousel';
import GroupScoreRow from './GroupScoreRow';

import PencilSVG from '../../constants/SVG/pencil.svg';

const GroupProfile = ({
    groupName,
    currentUser,
    handleChange,
    avatar,
    updateAvatar,
    groupInfo,
    updateGroupInfo,
    fileInputRef
}) => {

    const [adminStatus, updateAdminStatus] = useState(false);
    const [groupDataPulled, updateGroupDataPulled] = useState(false); //Don't know a better way to only pull group data one time
    const [week, updateWeek] = useState(0);
    const [season, updateSeason] = useState(``);

    const [leaderboard, updateLeaderboard] = useState([]);

    useEffect(() => {
        if (groupName) {
            pullGroupInfo()
        }
    }, [groupName]);

    useEffect(() => {
        if (currentUser.userId && groupInfo.UL) {
            checkForAdmin(groupInfo, currentUser.userId.toString()); //TODO Gotta be a better way to check for admin status of group
        }
    }, [currentUser, groupInfo.UL])

    const pullGroupInfo = () => {
        if (!groupDataPulled) {
            updateGroupDataPulled(true);
            axios.get(`/api/group/profile?name=${groupName}&avatar=true&positions=true`)
                .then(res => {
                    updateGroupInfo(res.data.group);
                    updateAvatar(res.data.avatar);
                    getLeaderboard(res.data.group._id.toString());

                    if (currentUser.userId) {
                        checkForAdmin(res.data.group, currentUser.userId.toString());
                    }
                });
        }
    };

    const checkForAdmin = (group, userId) => {
        const selfInGroup = group.UL.find(user => user._id.toString() === userId);
        if (selfInGroup) {
            updateAdminStatus(selfInGroup.A);
        }
    };

    const getLeaderboard = (groupId) => {
        axios.get(`/api/currentSeasonAndWeek`)
            .then(res => {
                const { season, week } = res.data;
                updateWeek(week);
                updateSeason(season);

                axios.get(`/api/group/leaderboard/${season}/${week}/${groupId}`)
                    .then(res2 => updateLeaderboard(res2.data.leaderboard));

            });
    };

    return (
        <>
            <div className='flex centerFlex profileHeader'>
                <div className='block marginHeightAuto groupProfileNameDesc'>
                    <div className='profileName'>
                        {groupName}
                    </div>
                    <div className='profileDesc'>
                        {groupInfo.D}
                    </div>
                </div>
                <div className='profileAvatarWrapper'>
                    <div className='editAvatarSVGWrapper'>
                        <img className='editAvatarSVG' src={PencilSVG} />
                    </div>
                    <label htmlFor='groupAvatar'>
                        <img className={`profileAvatar ${adminStatus ? `editAvatar` : ``}`} name='avatar' src={avatar} />
                    </label>
                    {adminStatus && <input id='groupAvatar' name='avatar' type='file' onChange={handleChange} ref={fileInputRef} />}
                </div>
            </div>
            <div className='groupInfoWrapper'>
                <Leaderboard
                    week={week}
                    season={season}
                    leaderboard={leaderboard}
                    groupName={groupInfo.N}
                />
                {groupInfo._id &&
                    <GroupScoreRow
                        editable={false}
                        groupId={groupInfo._id.toString()}
                    />
                }
                <div className='groupUserHeader'>
                    Users:
                </div>
                <div className='flex flexWrap centerFlex'>
                    {groupInfo.UL &&
                        groupInfo.UL.map((user) =>
                            <DisplayBox
                                key={user._id}
                                boxContent={user._id}
                                type='user'
                                buttonActive={adminStatus}
                                inGroup={true}
                                currUserId={currentUser.userId}
                            />)}
                </div>
            </div>
        </>
    )
}

GroupProfile.propTypes = {
    groupName: PropTypes.string,
    currentUser: PropTypes.object,
    avatar: PropTypes.any,
    handleChange: PropTypes.func,
    updateAvatar: PropTypes.func,
    groupInfo: PropTypes.object,
    updateGroupInfo: PropTypes.func,
    fileInputRef: PropTypes.any
};

export default GroupProfile;