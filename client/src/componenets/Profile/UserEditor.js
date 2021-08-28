import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { UsernameInput, EmailInput, PasswordInput } from './ProfileInputs';

const UserEditor = ({
    changeUpdatedFields,
    updatedFields,
    currentUser,
    authUser,
    updateModalState,
    openCloseModal
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

        if (updatedFields.email !== `` ||
            updatedFields.password !== `` ||
            updatedFields.username !== ``) {
            console.log(`reauth!!!`);
            updateModalState('reAuth');
        }
        // if (match.params.type === `user`) {
        //     if (updatedFields.email !== ``) {
        //         let checkEmail = updatedFields.email.match(/^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        //         if (!checkEmail) {
        //             Alert.fire({
        //                 type: `warning`,
        //                 title: `Email is invalid`,
        //                 text: `Please check the email field and enter again`,
        //             });
        //             return;
        //         }
        //     }
        // }

        // if (checkIfReAuthNeeded) {
        //     updateModalState(`reAuth`);
        //     openCloseModal();
        // } else {
        //     if (updatedFields.mainGroup !== currentUser.MG) {
        //         axios.put(`/api/group/main/${updatedFields.mainGroup}/${currentUser.userId}`);
        //     }
        //     window.location.reload(false);
        // }
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
    authUser: PropTypes.object,
    updateModalState: PropTypes.func,
    openCloseModal: PropTypes.func
}

export default UserEditor;