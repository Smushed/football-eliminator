import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';

import * as Logos from '../../constants/logos';
import './userProfileStyle.css';

const UserProfile = ({ currentUser, groupList }) => {

    const [teamList, setTeamList] = useState([]);

    useEffect(() => {
        console.log(`hit`)
        axios.get(`/api/getTeamList`)
            .then(res => setTeamList(res.data));
    }, []);

    return (
        <div className='userProfileWrapper'>
            <div className='userProfileLeft'>
                <div>{currentUser.username}'s Profile</div>
                <img src={Logos.UNK} />
            </div>
            <div className='userProfileRight'>
                <div>Select Favorite Team:</div>
                <div>Edit Username:</div>
                <div>Edit Password:</div>
                <div>Edit Email:</div>
                <select>
                    {teamList.map(team => <option key={team} selected={team === 'BAL'}>{team}</option>)}
                </select>
                <div>
                    <div>
                        Group List:
                    </div>
                    {groupList.map((group) => <div key={group.N}>{group.N}</div>)}
                </div>
            </div>
        </div>
    );
};

//REAUTH a user in order for them to update any of these
//Username - Password - Email

//Update Favorite Team

//Manage (aka leave) groups from here
//Groups

export default UserProfile;