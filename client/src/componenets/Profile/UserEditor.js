import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { UsernameInput, EmailInput, PasswordInput } from './ProfileInputs';

const UserEditor = ({
    changeUpdatedFields,
    updatedFields,
    currentUser,
    authUser
}) => {

    const [showPassword, updateShowPassword] = useState(`password`);

    const toggleShowPassword = () => {
        showPassword === `password` ? updateShowPassword(`text`) : updateShowPassword(`password`);
    };

    const handleChange = (e) => {
        //Putting this after the avatar check in case they upload a non image
        changeUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log(`hit`)
    };

    return (
        <>
            <UsernameInput
                handleChange={handleChange}
                username={updatedFields.username}
                currentUser={currentUser.username}
            />
            <PasswordInput
                handleChange={handleChange}
                toggleShowPassword={toggleShowPassword}
                password={updatedFields.password}
                showPassword={showPassword}
            />
            <EmailInput
                authUser={authUser}
                handleChange={handleChange}
                email={updatedFields.email}
            />
            <select className='form-select groupDropdown' name='mainGroup' value={updatedFields.mainGroup} onChange={handleChange}>
                {currentUser.GL && currentUser.GL.map(group => <option key={group._id} value={group._id}>{group.N}</option>)}
            </select>
            <div className='submitButtonWrapper'>
                <button className='btn btn-primary btn-lg' onClick={() => handleSubmit()}>
                    Submit
                </button>
            </div>
        </>
    )
}

UserEditor.propTypes = {
    changeUpdatedFields: PropTypes.func,
    updatedFields: PropTypes.object,
    currentUser: PropTypes.object,
    authUser: PropTypes.object
}

export default UserEditor;