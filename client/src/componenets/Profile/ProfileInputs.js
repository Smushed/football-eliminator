import React from 'react';
import PropTypes from 'prop-types';

const AvatarInput = ({ handleChange, fileInputRef }) =>
    <div className='editField'>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Avatar:
            </span>
            <div>
                <label htmlFor='avatarInput' className='customFileUploadButton' >
                    Upload Avatar
                </label>
            </div>
            <input type='file' name='avatar' id='avatarInput' className='avatarInputButton' onChange={handleChange} ref={fileInputRef} />
        </div>
    </div>

const UsernameInput = ({ handleChange, username, currentUserName, modalOpen }) =>
    <div className={'editField' + (modalOpen ? ' lowerOpacity' : '')}>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Username:
            </span>
            <input className='form-control' name='username' value={username} type='text' onChange={handleChange} placeholder={currentUserName} />
        </div>
    </div>;

const PasswordInput = ({ handleChange, password, showPassword, modalOpen, toggleShowPassword }) =>
    <div className={'editField' + (modalOpen ? ' lowerOpacity' : '')}>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Password:
            </span>
            <input className='form-control' name='password' value={password} type={showPassword} onChange={handleChange} placeholder='Password' />
            <span className='input-group-text fieldDescription inputCheckbox'>
                <input className='largeCheckbox input-group-text fieldDescription' type='checkbox' value={showPassword} name='togglePassword' onChange={toggleShowPassword} />
                <div className='largeTogglePass'>
                    &nbsp;Show
                </div>
            </span>
        </div>
    </div>;

const ConfirmPasswordInput = ({ handleChange, password, showPassword, modalOpen, toggleShowPassword }) =>
    <div className={'editField' + (modalOpen ? ' lowerOpacity' : '')}>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Confirm:
            </span>
            <input className='form-control' name='confirmPassword' value={password} type={showPassword} onChange={handleChange} placeholder='Confirm Password' />
            <span className='input-group-text fieldDescription inputCheckbox'>
                <input className='largeCheckbox input-group-text' type='checkbox' value={showPassword} name='togglePassword' onChange={toggleShowPassword} />
                <div className='largeTogglePass'>
                    &nbsp;Show
                </div>
            </span>

        </div>
    </div>;

const EmailInput = ({ email, handleChange, authUser, modalOpen }) =>
    <div className={'editField' + (modalOpen ? ' lowerOpacity' : '')}>
        <div className='input-group input-group-lg'>
            <span className='input-group-text fieldDescription'>
                Email:
            </span>
            <input className='form-control' name='email' value={email} type='email' onChange={handleChange} placeholder={authUser ? authUser.email : 'Email'} />
        </div>
    </div>;


AvatarInput.propTypes = {
    fileInputRef: PropTypes.any,
    handleChange: PropTypes.func
};

UsernameInput.propTypes = {
    handleChange: PropTypes.func,
    username: PropTypes.string,
    currentUserName: PropTypes.string,
    modalOpen: PropTypes.bool
};

EmailInput.propTypes = {
    email: PropTypes.string,
    handleChange: PropTypes.func,
    authUser: PropTypes.any,
    modalOpen: PropTypes.bool
};

PasswordInput.propTypes = {
    handleChange: PropTypes.func,
    password: PropTypes.string,
    showPassword: PropTypes.string,
    modalOpen: PropTypes.bool,
    toggleShowPassword: PropTypes.func
};

ConfirmPasswordInput.propTypes = {
    handleChange: PropTypes.func,
    password: PropTypes.string,
    showPassword: PropTypes.string,
    modalOpen: PropTypes.bool,
    toggleShowPassword: PropTypes.func
}

export { AvatarInput, UsernameInput, EmailInput, PasswordInput, ConfirmPasswordInput };