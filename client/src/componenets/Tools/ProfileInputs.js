import EyeSVG from '../../constants/SVG/eye.svg';
import EyeSlashSVG from '../../constants/SVG/eye-slash.svg';

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
        className='d-none'
        onChange={handleChange}
        ref={fileInputRef}
      />
    </div>
  </div>
);

const UsernameInput = ({
  handleChange,
  username,
  placeholderUsername,
  disabled,
}) => (
  <div className='row mt-2'>
    <div className='col'>
      <small htmlFor='username' className='form-label'>
        Username:
      </small>
      <div className='input-group'>
        <input
          className='form-control'
          name='username'
          value={username}
          type='text'
          disabled={disabled}
          onChange={handleChange}
          placeholder={placeholderUsername}
        />
      </div>
    </div>
  </div>
);

const PasswordInput = ({
  handleChange,
  password,
  showPassword,
  toggleShowPassword,
  disabled,
}) => (
  <div className='mt-2 row'>
    <div className='col-12'>
      <small htmlFor='password' className='form-label'>
        Password:
      </small>
      <div className='input-group'>
        <input
          className='form-control'
          name='password'
          value={password}
          type={showPassword}
          disabled={disabled}
          onChange={handleChange}
          placeholder='Password'
        />
        <span className='input-group-text'>
          {showPassword === 'password' ? (
            <img
              src={EyeSVG}
              alt='Show'
              className='passwordHideShowSVG'
              onClick={() => toggleShowPassword()}
            />
          ) : (
            <img
              src={EyeSlashSVG}
              alt='Show'
              className='passwordHideShowSVG'
              onClick={() => toggleShowPassword()}
            />
          )}
        </span>
      </div>
    </div>
  </div>
);

const ConfirmPasswordInput = ({
  handleChange,
  password,
  showPassword,
  toggleShowPassword,
  disabled,
}) => (
  <div className='mt-2 row'>
    <div className='col-12'>
      <small htmlFor='confirmPassword' className='form-label'>
        Confirm:
      </small>
      <div className='input-group'>
        <input
          className='form-control'
          name='confirmPassword'
          value={password}
          type={showPassword}
          disabled={disabled}
          onChange={handleChange}
          placeholder='Confirm Password'
        />
        <span className='input-group-text'>
          {showPassword === 'password' ? (
            <img
              src={EyeSVG}
              alt='Show'
              className='passwordHideShowSVG'
              onClick={() => toggleShowPassword()}
            />
          ) : (
            <img
              src={EyeSlashSVG}
              alt='Show'
              className='passwordHideShowSVG'
              onClick={() => toggleShowPassword()}
            />
          )}
        </span>
      </div>
    </div>
  </div>
);

const EmailInput = ({ email, handleChange, placeholderEmail, disabled }) => (
  <div className='row mt-2'>
    <div className='col-12'>
      <small htmlFor='email' className='form-label'>
        Email:
      </small>
      <div className='input-group'>
        <input
          className='form-control'
          name='email'
          value={email}
          type='email'
          disabled={disabled}
          onChange={handleChange}
          placeholder={placeholderEmail ? placeholderEmail : 'Email'}
        />
      </div>
    </div>
  </div>
);

const MainGroupInput = ({ grouplist, mainGroup, handleChange, disabled }) => (
  <div className='row mt-2'>
    <div className='col-12'>
      <small className='form-label'>Main Group:</small>
      <div className='input-group'>
        <select
          className='form-select'
          name='mainGroup'
          value={mainGroup}
          disabled={disabled}
          onChange={handleChange}
        >
          {grouplist &&
            grouplist.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  </div>
);

const PhoneNumberInput = ({ phoneNumber, disabled, handleChange }) => (
  <div className='row mt-2'>
    <div className='col-12'>
      <small className='form-label' htmlFor='phoneNumber'>
        Phone Number:
      </small>
      <div className='input-group'>
        <input
          className='form-control'
          name='phoneNumber'
          value={phoneNumber}
          type='tel'
          disabled={disabled}
          onChange={handleChange}
        />
      </div>
    </div>
  </div>
);

const GenericSwitch = ({
  disableAllFields,
  checkedVal,
  handleChange,
  displayName,
  htmlName,
}) => (
  <div className='form-switch row'>
    <div className='col-1 text-end'>
      <input
        className='form-check-input'
        type='checkbox'
        role='switch'
        id={`${htmlName}Switch`}
        disabled={disableAllFields}
        checked={checkedVal}
        onChange={handleChange}
        name={htmlName}
      />
    </div>
    <div className='col-8 text-start'>
      <label className='form-check-label' htmlFor={`${htmlName}Switch`}>
        {displayName}
      </label>
    </div>
  </div>
);

export {
  AvatarInput,
  UsernameInput,
  EmailInput,
  PasswordInput,
  ConfirmPasswordInput,
  MainGroupInput,
  PhoneNumberInput,
  GenericSwitch,
};
