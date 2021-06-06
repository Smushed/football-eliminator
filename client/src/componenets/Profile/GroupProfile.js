import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { RosterDisplay } from '../Roster/index';
import Leaderboard from '../Home/Leaderboard';

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
    const [groupDataPulled, updateGroupDataPulled] = useState(false); //Don't know a better way to only pull group data one time
    const [groupPositions, updateGroupPositions] = useState([]);
    const [leaderboard, updateLeaderboard] = useState([]);
    const [week, updateWeek] = useState(0);
    const [season, updateSeason] = useState(``);
    const [dataLocked, updateDataLocked] = useState(true);
    const [rosterPositions, updateRosterPositions] = useState([]);
    const [positionMap, updatePositionMap] = useState([]);
    const [maxOfPosition, updateMaxOfPosition] = useState([]);

    useEffect(() => {
        if (groupName) {
            pullGroupInfo()
        }
        if (currentUser.userId) {
            if (groupInfo.UL) {
                checkForAdmin(groupInfo)
            }
        }
    }, [groupName, updateAvatar, updateGroupInfo, currentUser]);

    const pullGroupInfo = () => {
        if (!groupDataPulled) {
            updateGroupDataPulled(true);
            getRosterPositions();
            axios.get(`/api/group/profile?name=${groupName}&avatar=true&positions=true`)
                .then(res => {
                    updateGroupInfo(res.data.group);
                    updateGroupPositions(res.data.positions);
                    updateAvatar(res.data.avatar);
                    getIdealRoster(res.data.group._id.toString());
                    if (currentUser) {
                        checkForAdmin(res.data.group);
                    }
                });
        }
    };

    const checkForAdmin = (group) => {
        const selfInGroup = group.UL.find(user => user._id === currentUser.userId);
        if (selfInGroup) {
            updateAdminStatus(selfInGroup.A);
        }
    };

    const getIdealRoster = (groupId) => {
        axios.get(`/api/currentSeasonAndWeek`)
            .then(res => {
                const { season, week } = res.data;
                updateWeek(week);
                updateSeason(season);
                axios.get(`/api/group/leaderboard/${season}/${week}/${groupId}`)
                    .then(res2 => updateLeaderboard(res2.data.leaderboard));
            });
    };

    const getRosterPositions = async () => {
        const dbResponse = await axios.get(`/api/roster/positions`);
        const { rosterPositions, positionMap, maxOfPosition } = dbResponse.data;
        updateRosterPositions(rosterPositions);
        updatePositionMap(positionMap);
        updateMaxOfPosition(maxOfPosition);
    };

    return (
        <div className='profileWrapper '>
            <div className='profileLeft'>
                <div className='profileName'>
                    {groupName}
                </div>
                <div className='profileDesc'>
                    {groupInfo.D}
                </div>
                <div className='userAvatarWrapper'>
                    <img className='userAvatar' src={avatar} />
                </div>
                <div className='groupPosHeader'>
                    Group Positions
                    </div>
                {groupPositions.map((pos, i) =>
                    <div key={i} className='groupPos'>
                        {pos.N}
                    </div>
                )}
            </div>
            <div className='profileRight'>
                {adminStatus &&
                    <AvatarInput
                        handleChange={handleChange}
                        fileInputRef={fileInputRef}
                    />
                }
                <div>
                    <Leaderboard
                        week={week}
                        season={season}
                        leaderboard={leaderboard}
                        groupName={groupInfo.N}
                    />
                </div>
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