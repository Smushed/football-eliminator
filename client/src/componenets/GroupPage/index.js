import React, { useState, useEffect } from 'react';
import { withAuthorization } from '../Session';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import './groupStyle.css';
import * as Routes from '../../constants/routes';

const Alert = withReactContent(Swal);

const GroupPage = ({
    history,
    email,
    pullUserData,
    userId,
    noGroup,
    season
}) => {

    const [groupList, updateGroupList] = useState([]);

    const axiosCancel = axios.CancelToken.source();

    useEffect(() => {
        if (noGroup) { welcomeModal() }
        getGroupList();

        return function cancelAPICalls() {
            if (axiosCancel) {
                axiosCancel.cancel(`Unmounted`);
            }
        }
    }, [noGroup]);

    const welcomeModal = () => {
        Alert.fire({
            type: `success`,
            title: `Welcome to the Eliminator!`,
            html: `Here we play fantasy football with a twist:
            <br />
            <br />
            - Each week set a lineup while having access to every offensive player in the NFL. 
            <br />
            - But, you can only play each player one time per season. 
            <br />
            <br />
            Join a group or create one to begin filling out your roster.
            <br />
            If you run into any problems or bugs please email or text me.`,
        });
    };

    const getGroupList = async () => {
        axios.get(`/api/group/list`, { cancelToken: axiosCancel.token })
            .then(res => updateGroupList(res.data))
            .catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
            });
    };

    const joinGroup = (groupId) => {
        axios.put(`/api/group/join/`, {
            userId,
            groupId
        }).then(() => {
            pullUserData(email).then(() => {
                history.push(Routes.home)
            });
        });
    };


    return (
        <div>
            <div className='groupPageHeader'>
                Active Groups
            </div>
            <div className='createGroupPrompt'>
                Not seeing a group that interests you?
                <div className='createGroupButton'>
                    <Link to={`/group/create`}>
                        <button className='btn btn-outline-primary btn-sm'>Create Group</button>
                    </Link>
                </div>
            </div>
            {groupList.map(group =>
                <GroupRow
                    season={season}
                    key={group.id}
                    group={group}
                    joinGroup={joinGroup}
                    userId={userId}
                />)}

        </div>
    )
};

const GroupRow = ({ group, joinGroup, season, userId }) => {

    const [groupAvatar, updateGroupAvatar] = useState([]);
    const [topScore, updateTopScore] = useState(0);
    const [ulTooltip, updateULTooltip] = useState(``);
    const [isInGroup, updateIsInGroup] = useState(false);

    const axiosCancel = axios.CancelToken.source();

    useEffect(() => {
        getAvatar(group.id);
        getTopScore(group.id, season);
        BuildULTooltip(group.UL);
        if (group.UL.length >= 1 && userId) {
            checkInGroup(userId);
        }

        return function cancelAPICalls() {
            if (axiosCancel) {
                axiosCancel.cancel(`Unmounted`);
            }
        }
    }, [group.id, group.UL, season, userId]);

    const getAvatar = (groupId) => {
        axios.get(`/api/avatar/${groupId}`, { cancelToken: axiosCancel.token })
            .then(res => {
                updateGroupAvatar(res.data);
            })
            .catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
            });
    };

    const getTopScore = (groupId, season) => {
        axios.get(`/api/group/topScore/${groupId}/${season}`, { cancelToken: axiosCancel.token })
            .then(res => {
                updateTopScore(res.data.TS)
            })
            .catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
            });
    };

    const BuildULTooltip = (userList) => {
        let ulTooltip = ``;
        for (const user of userList) {
            ulTooltip += `${user.UN}<br/>`;
        }
        updateULTooltip(ulTooltip);
    };

    const checkInGroup = (uId) => {
        const userInGroup = group.UL.find(user => user._id === uId);
        updateIsInGroup(!userInGroup)
    };

    const firstAdmin = group.UL.find(user => user.A === true);

    return (
        <div className='largeScreenFlex groupDisplayRow'>
            <ReactTooltip html={true} />
            <img alt={`${group.N} Avatar`} className='groupDisplayAvatar' src={groupAvatar} />
            <div>
                <div className='groupHeader'>
                    <Link to={`/profile/group/${group.N}`}>
                        {group.N}
                    </Link>
                </div>
                <div className='largeScreenFlex'>
                    <div className='groupDescription groupFirstCol'>
                        <div className='groupInfo'>
                            {group.D}
                        </div>
                    </div>
                    <div className=''>
                        <div className='groupFlex groupInfoSmallScreen'>
                            <div className='groupFieldDescription'>
                                Admin:
                            </div>
                            <div>
                                {firstAdmin && firstAdmin.UN}
                            </div>
                        </div>
                        <div className='groupFlex pointer groupInfoSmallScreen' data-tip={ulTooltip}>
                            <div className='groupFieldDescription'>
                                Users:
                            </div>
                            <div>
                                {group.UL.length}
                            </div>
                        </div>
                        <div className='groupFlex groupInfoSmallScreen'>
                            <div className='groupFieldDescription'>
                                Top Score:
                            </div>
                            <div>
                                {topScore && topScore.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div className='groupRowThirdCol'>
                        {isInGroup &&
                            <div className='joinButtonContainer'>
                                <button className='btn btn-outline-primary joinGroupButton' onClick={() => joinGroup(group.id)} >
                                    Join
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div >
    )
};

GroupPage.propTypes = {
    history: PropTypes.any,
    email: PropTypes.string,
    pullUserData: PropTypes.func,
    season: PropTypes.string,
    noGroup: PropTypes.bool,
    userId: PropTypes.string,
};

GroupRow.propTypes = {
    group: PropTypes.object,
    joinGroup: PropTypes.func,
    season: PropTypes.string,
    userId: PropTypes.string
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(GroupPage);