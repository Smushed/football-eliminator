import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { withAuthorization } from '../Session';

import * as Logos from '../../constants/logos';
import './userProfileStyle.css';

const UserProfile = ({ currentUser, groupList }) => {

    const [teamList, setTeamList] = useState([]);
    const [changedFields, addChangedField] = useState([]);
    const [showPassword, toggleShowPassword] = useState('password');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [favoriteTeam, setFavoriteTeam] = useState('');

    useEffect(() => {
        axios.get(`/api/getTeamList`)
            .then(res => setTeamList(res.data));
        setFavoriteTeam(currentUser.FT)
    }, [currentUser]);

    const sendAuthEmail = (authUser) => {
        authUser.sendEmailVerification();
        this.setState({ emailSent: true });
    };

    const handleChange = (e) => {
        e.target.name === `favoriteTeam` && setFavoriteTeam(e.target.value);
        e.target.name === `password` && setPassword(e.target.value);
        e.target.name === `email` && setEmail(e.target.value);
        e.target.name === `username` && setUsername(e.target.value);
        if (e.target.name === `togglePassword`) {
            console.log(e.target.name)
            e.target.value === `password` ? toggleShowPassword(`text`) : toggleShowPassword(`password`);
            return;
        };

        if (!changedFields.includes(e.target.name)) {
            const fieldsUpdated = [...changedFields]
            fieldsUpdated.push(e.target.name);
            addChangedField(fieldsUpdated);
        };
    };

    return (
        <div className='userProfileWrapper'>
            <div className='userProfileLeft'>
                <div className='profileName'>
                    {currentUser.username}'s Profile
                </div>
                <div className='favoriteTeamPicture'>
                    <img src={Logos[favoriteTeam]} />
                </div>
            </div>
            <div className='userProfileRight'>
                <div className='editField'>
                    Edit Username:
                    <input name='username' value={username} onChange={handleChange} />
                </div>
                <div className='editField'>
                    Edit Password:
                    <input name='password' value={password} type={showPassword} onChange={handleChange} />
                    <input type='checkbox' value={showPassword} name='togglePassword' onChange={handleChange} />
                </div>
                <div className='editField'>
                    Edit Email:
                    <input name='email' value={email} onChange={handleChange} />
                </div>
                <div className='editField'>
                    Select Favorite Team:
                <select name='favoriteTeam' value={favoriteTeam} onChange={handleChange}>
                        {teamList.map(team => <option key={team} value={team}>{team}</option>)}
                    </select>
                </div>
                <div className='editField'>
                    <div>
                        Group List:
                    </div>
                    {groupList.map((group) => <div key={group.N}>{group.N} {group.D} {group._id}</div>)}
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


// const VerifyEmailButton = ({ authUser }) =>
//     <div className='verifyEmailDiv floatRight notifications'>
//         Please Verify your Email
//     <br />
//         <button className='btn btn-info' onClick={() => this.sendAuthEmail(authUser)}>Send Verification Email</button>
//     </div>;

// const SentVerifyEmail = () => <div className='sentEmail floatRight notifications'>Email has been sent</div>;

// const SmallVerifyEmailButton = ({ authUser }) =>
//     <div className='verifyEmailDiv floatRight notifications smallVerifyEmailBtn'>
//         <button className='btn btn-info btn-sm' onClick={() => this.sendAuthEmail(authUser)}>Verifiy Email</button>
//     </div>;

// const SmallSentVerifyEmail = () => <div className='sentEmail smallSentEmail floatRight notifications'>Sent!</div>;

export default UserProfile;