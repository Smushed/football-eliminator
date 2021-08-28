import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';

import { UsernameInput, EmailInput, PasswordInput, MainGroupInput } from './ProfileInputs';

const UserEditor = ({
    changeUpdatedFields,
    updatedFields,
    currentUser,
    authUser,
    updateModalState,
    openCloseModal
}) => {
    const [showPassword, updateShowPassword] = useState(`password`);

    const { addToast } = useToasts();

    const toggleShowPassword = () => {
        showPassword === `password` ? updateShowPassword(`text`) : updateShowPassword(`password`);
    };

    const handleChange = (e) => {
        //Putting this after the avatar check in case they upload a non image
        changeUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {

        if (updatedFields.email !== ``) {
            let checkEmail = updatedFields.email.match(/^(([^<>()\]\\.,;:\s@']+(\.[^<>()\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            if (!checkEmail) {
                addToast('Invalid Email - Please check', { appearance: 'warning', autoDismiss: true });
                return;
            }
        }

        if (updatedFields.mainGroup !== currentUser.MG) {
            try {
                await axios.put(`/api/group/main/${updatedFields.mainGroup}/${currentUser.userId}`);
                addToast('Main group updated', { appearance: 'success', autoDismiss: true });
            } catch (err) {
                addToast('Error saving main group', { appearance: 'warning', autoDismiss: true });
            }
        }
        if (updatedFields.email !== `` || updatedFields.password !== `` || updatedFields.username !== ``) {
            updateModalState('reAuth');
            return;
        }
        openCloseModal();
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
            <MainGroupInput
                currentUser={currentUser}
                mainGroup={updatedFields.mainGroup}
                handleChange={handleChange}
            />
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