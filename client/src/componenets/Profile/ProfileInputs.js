import React from 'react';
import PropTypes from 'prop-types';

const AvatarInput = ({ handleChange, fileInputRef }) => (
  <div className='d-flex mt-3 '>
    <div className='input-group input-group-lg'>
      <span className='input-group-text fieldDescription'>Avatar:</span>
      <div>
        <label htmlFor='avatarInput' className='customFileUploadButton'>
          Upload Avatar
        </label>
      </div>
      <input
        type='file'
        name='avatar'
        id='avatarInput'
        className='avatarInputButton'
        onChange={handleChange}
        ref={fileInputRef}
      />
    </div>
  </div>
);

const UsernameInput = ({ handleChange, username, currentUserName }) => (
  <div className='d-flex mt-3'>
    <div className='input-group input-group-lg'>
      <span className='input-group-text fieldDescription'>Username:</span>
      <input
        className='form-control'
        name='username'
        value={username}
        type='text'
        onChange={handleChange}
        placeholder={currentUserName}
      />
    </div>
  </div>
);

const PasswordInput = ({
  handleChange,
  password,
  showPassword,
  toggleShowPassword,
}) => (
  <div className='d-flex mt-3'>
    <div className='input-group input-group-lg'>
      <span className='input-group-text fieldDescription'>Password:</span>
      <input
        className='form-control'
        name='password'
        value={password}
        type={showPassword}
        onChange={handleChange}
        placeholder='Password'
      />
      <span className='input-group-text fieldDescription inputCheckbox'>
        <input
          className='largeCheckbox input-group-text fieldDescription'
          type='checkbox'
          value={showPassword}
          name='togglePassword'
          onChange={toggleShowPassword}
        />
        <div className='largeTogglePass'>&nbsp;Show</div>
      </span>
    </div>
  </div>
);

const ConfirmPasswordInput = ({
  handleChange,
  password,
  showPassword,
  toggleShowPassword,
}) => (
  <div className='d-flex mt-3'>
    <div className='input-group input-group-lg'>
      <span className='input-group-text fieldDescription'>Confirm:</span>
      <input
        className='form-control'
        name='confirmPassword'
        value={password}
        type={showPassword}
        onChange={handleChange}
        placeholder='Confirm Password'
      />
      <span className='input-group-text fieldDescription inputCheckbox'>
        <input
          className='largeCheckbox input-group-text'
          type='checkbox'
          value={showPassword}
          name='togglePassword'
          onChange={toggleShowPassword}
        />
        <div className='largeTogglePass'>&nbsp;Show</div>
      </span>
    </div>
  </div>
);

const EmailInput = ({ email, handleChange, authUser }) => (
  <div className='d-flex mt-3'>
    <div className='input-group input-group-lg'>
      <span className='input-group-text fieldDescription'>Email:</span>
      <input
        className='form-control'
        name='email'
        value={email}
        type='email'
        onChange={handleChange}
        placeholder={authUser ? authUser.email : 'Email'}
      />
    </div>
  </div>
);

const MainGroupInput = ({ currentUser, mainGroup, handleChange }) => (
  <div className='d-flex mt-3'>
    <div className='input-group input-group-lg flex'>
      <span className='input-group-text fieldDescription'>Main Group:</span>
      <select
        className='form-select'
        name='mainGroup'
        value={mainGroup}
        onChange={handleChange}
      >
        {currentUser.GL &&
          currentUser.GL.map((group) => (
            <option key={group._id} value={group._id}>
              {group.N}
            </option>
          ))}
      </select>
    </div>
  </div>
);

AvatarInput.propTypes = {
  fileInputRef: PropTypes.any,
  handleChange: PropTypes.func,
};

UsernameInput.propTypes = {
  handleChange: PropTypes.func,
  username: PropTypes.string,
  currentUserName: PropTypes.string,
};

EmailInput.propTypes = {
  email: PropTypes.string,
  handleChange: PropTypes.func,
  authUser: PropTypes.any,
};

PasswordInput.propTypes = {
  handleChange: PropTypes.func,
  password: PropTypes.string,
  showPassword: PropTypes.string,
  toggleShowPassword: PropTypes.func,
};

ConfirmPasswordInput.propTypes = {
  handleChange: PropTypes.func,
  password: PropTypes.string,
  showPassword: PropTypes.string,
  toggleShowPassword: PropTypes.func,
};

MainGroupInput.propTypes = {
  currentUser: PropTypes.object,
  mainGroup: PropTypes.string,
  handleChange: PropTypes.func,
};

export {
  AvatarInput,
  UsernameInput,
  EmailInput,
  PasswordInput,
  ConfirmPasswordInput,
  MainGroupInput,
};
