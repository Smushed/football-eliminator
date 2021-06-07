import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { RosterDisplay } from '../Roster/index';
import Leaderboard from '../Home/Leaderboard';

import './profileStyle.css';

import DisplayBox from '../DisplayBox';
import { AvatarInput } from './ProfileInputs';
import BestRostersCollapse from '../Home/BestRostersCollapse';

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
    const [week, updateWeek] = useState(0);
    const [season, updateSeason] = useState(``);
    const [dataLocked, updateDataLocked] = useState(true);
    const [rosterPositions, updateRosterPositions] = useState([]);
    const [positionMap, updatePositionMap] = useState([]);
    const [maxOfPosition, updateMaxOfPosition] = useState([]);

    //Roster Data For Group
    const [rostersOpen, updateRostersOpen] = useState(true);
    const [leaderboard, updateLeaderboard] = useState([]);
    const [idealRoster, updateIdealRoster] = useState([]);
    const [bestRoster, updateBestRoster] = useState([]);
    const [bestRosterUser, updateBestRosterUser] = useState(``);
    const [leaderRoster, updateLeaderRoster] = useState([]);

    useEffect(() => {
        if (groupName) {
            pullGroupInfo()
        }
        if (currentUser.userId) {
            if (groupInfo.UL) {
                checkForAdmin(groupInfo, currentUser.userId.toString()); //TODO Gotta be a better way to check for admin status of group
            }
        }
    }, [groupName, currentUser]);

    const pullGroupInfo = () => {
        if (!groupDataPulled) {
            updateGroupDataPulled(true);
            getRosterPositions();
            axios.get(`/api/group/profile?name=${groupName}&avatar=true&positions=true`)
                .then(res => {
                    updateGroupInfo(res.data.group);
                    updateGroupPositions(res.data.positions);
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

                axios.get(`/api/group/roster/bestAndLead/${season}/${week}/${groupId}`)
                    .then(res3 => {
                        updateBestRosterUser(res3.data.bestRoster.U);
                        updateBestRoster(res3.data.bestRoster.R);
                        updateLeaderRoster(res3.data.leaderRoster);
                    });

                axios.get(`/api/roster/ideal/${season}/${week}/${groupId}`)
                    .then(res4 => {
                        updateIdealRoster(res4.data)
                    });
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
                    <Fragment>
                        <AvatarInput
                            handleChange={handleChange}
                            fileInputRef={fileInputRef}
                        />
                        <div className='submitButtonWrapper'>
                            <button disabled={!checkIfSaveNeeded} className='btn btn-primary btn-lg' onClick={() => handleSubmit()}>
                                Submit
                            </button>
                        </div>
                    </Fragment>
                }
                <div>
                    <Leaderboard
                        week={week}
                        season={season}
                        leaderboard={leaderboard}
                        groupName={groupInfo.N}
                    />
                </div>
                <div>
                    Roster Collapse Stuff
                    <div>
                        <button className='btn btn-outline-info' onClick={() => updateRostersOpen(!rostersOpen)}>
                            Open Rosters
                        </button>
                        <BestRostersCollapse
                            rowOpen={rostersOpen}
                            week={+week}
                            bestRosterUser={bestRosterUser}
                            bestRoster={bestRoster}
                            groupPositions={groupPositions}
                            idealRoster={idealRoster}
                            leaderboard={leaderboard}
                            leaderRoster={leaderRoster}
                        />
                    </div>
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