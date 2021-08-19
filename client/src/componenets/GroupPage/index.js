import React, { useState, useEffect } from 'react';
import { withAuthorization } from '../Session';
import CreateGroup from './CreateGroup';
import PropTypes from 'prop-types';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import './groupStyle.css';

const Alert = withReactContent(Swal);

const GroupPage = ({ userId, noGroup, season }) => {

    const [groupList, updateGroupList] = useState([]);

    useEffect(() => {
        if (noGroup) { welcomeModal() }
        getGroupList()
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
        const res = await axios.get(`/api/group/list`);
        updateGroupList(res.data);
    };

    const joinGroup = async (groupId) => {
        axios.put(`/api/group/join/`, {
            userId: userId,
            groupId
        }).then(() => {
            window.location.reload(false);
        });
    };

    const showUserlist = async (userlist, groupName) => {
        const listWithBreaks = userlist.map(user => `<br />${user}`)
        const userlistForDisplay = listWithBreaks.join();
        await Alert.fire({
            title: `${groupName} userlist`,
            html: userlistForDisplay,
        });
    };

    return (
        <div>
            <div className='joinGroupHeader'>
                Join a Group
            </div>
            {groupList.map(group =>
                <GroupRow
                    season={season}
                    key={group.id}
                    group={group}
                    joinGroup={joinGroup}
                />)}
        </div>
    )
};

const GroupRow = ({ group, joinGroup, season }) => {

    const [groupAvatar, updateGroupAvatar] = useState([]);
    const [topScore, updateTopScore] = useState(0);
    const [ulTooltip, updateULTooltip] = useState(``);

    useEffect(() => {
        getAvatar(group.id);
        getTopScore(group.id, season);
        BuildULTooltip(group.UL);
    }, [group.id, group.UL, season]);

    const getAvatar = (groupId) => {
        axios.get(`/api/avatar/${groupId}`)
            .then(res => {
                updateGroupAvatar(res.data);
            });
    };

    const getTopScore = (groupId, season) => {
        axios.get(`/api/group/topScore/${groupId}/${season}`)
            .then(res => {
                updateTopScore(res.data.TS)
            });
    };

    const BuildULTooltip = (userList) => {
        let ulTooltip = ``;
        for (const user of userList) {
            ulTooltip += `${user.UN}<br/>`;
        }
        updateULTooltip(ulTooltip);
    };

    const firstAdmin = group.UL.find(user => user.A === true);

    return (
        <div className='groupFlex'>
            <ReactTooltip html={true} />
            <img className={`${group.N} Avatar`} src={groupAvatar} />
            <div>
                <div className='groupFlex groupName groupFirstCol'>
                    <div className='groupFieldDescription'>
                        Name:
                    </div>
                    <div className='groupInfo'>
                        {group.N}
                    </div>
                </div>
                <div className='groupFlex groupDescription groupFirstCol'>
                    <div className='groupFieldDescription'>
                        Description:
                    </div>
                    <div className='groupInfo'>
                        {group.D}
                    </div>
                </div>
            </div>
            <div>
                <div className='groupFlex'>
                    <div className='groupFieldDescription'>
                        Admin:
                    </div>
                    <div>
                        {firstAdmin.UN}
                    </div>
                </div>
                <div className='groupFlex'>
                    <div className='groupFieldDescription'>
                        Users:
                    </div>
                    <div data-tip={ulTooltip}>
                        {group.UL.length}
                    </div>
                </div>
                <div className='groupFlex'>
                    <div className='groupFieldDescription'>
                        Top Score:
                    </div>
                    <div>
                        {topScore}
                    </div>
                </div>
            </div>
            <div>
                <button className='btn btn-outline-primary' onClick={() => joinGroup(group._id)} >
                    Join
                </button>
            </div>
        </div >
    )
};

GroupPage.propTypes = {
    season: PropTypes.string,
    noGroup: PropTypes.bool,
    userId: PropTypes.string,
};

GroupRow.propTypes = {
    group: PropTypes.object,
    joinGroup: PropTypes.func,
    season: PropTypes.string,
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(GroupPage);