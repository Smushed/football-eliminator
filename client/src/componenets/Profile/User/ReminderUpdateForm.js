import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GenericSwitch, PhoneNumberInput } from '../ProfileInputs';
import { differencesInObj } from '../../../utils/genericTools';

const reminderBase = {
  leaderboardEmail: false,
  reminderEmail: false,
  reminderText: false,
  phoneNumber: '',
};

const ReminderUpdateForm = ({ disableAllFields, currentUser }) => {
  const [updatedFields, setUpdatedFields] = useState(reminderBase);
  const [baseFields, setBaseFields] = useState(reminderBase);
  const [errors, setErrors] = useState([]);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser.userId) {
      pullReminderFields(currentUser.userId);
    }
  }, [currentUser]);

  const pullReminderFields = async (userId) => {
    try {
      const { data } = await axios.get(`/api/user/reminderPref/${userId}`, {
        cancelToken: axiosCancel.token,
      });
      setUpdatedFields(data);
      setBaseFields(data);
    } catch (err) {
      if (err.message !== `Unmounted`) {
        console.log(err);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'phoneNumber') {
      setUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
    } else {
      setUpdatedFields({ ...updatedFields, [e.target.name]: e.target.checked });
    }
  };
  let phoneNumberValid = false;

  const handleSubmit = () => {
    const diff = differencesInObj(baseFields, updatedFields);
    if (Object.keys(diff).length === 0) {
      return;
    }
    if (diff.phoneNumber) {
      diff.phoneNumber = diff.phoneNumber.replace(/\D/g, '');
      if (diff.phoneNumber[0] === '1') {
        diff.phoneNumber = diff.phoneNumber.substring(1);
      }
      if (diff.phoneNumber.length !== 10) {
        setErrors(['Invalid Phone Number']);
        return;
      }
      phoneNumberValid = true;
    } else if (baseFields.phoneNumber) {
      phoneNumberValid = true;
    }
    if (diff.reminderText && !phoneNumberValid) {
      setErrors(['Must have phone number if reminder texts are on']);
      return;
    }
    axios
      .put(`/api/user/email/settings/${currentUser.userId}`, {
        updatedFields: diff,
      })
      .then(() => {
        setErrors([]);
        pullReminderFields(currentUser.userId);
        toast.success('Notification settings updated', {
          position: 'top-right',
          duration: 4000,
        });
      })
      .catch((err) => {
        setErrors([err.message]);
      });
  };

  return (
    <div className='row justify-content-center mt-2 mb-3'>
      <div className='col-xs-12 col-lg-6 mt-3'>
        {errors.map((error, i) => (
          <div
            key={`reminderError-${i}`}
            className='text-center text-danger mb-2'
          >
            {error}
          </div>
        ))}
        <GenericSwitch
          disableAllFields={disableAllFields}
          checkedVal={updatedFields.reminderEmail}
          handleChange={handleChange}
          displayName='Reminder Emails'
          htmlName='reminderEmail'
        />
        <GenericSwitch
          disableAllFields={disableAllFields}
          checkedVal={updatedFields.leaderboardEmail}
          handleChange={handleChange}
          displayName='Leaderboard Emails'
          htmlName='leaderboardEmail'
        />
        <GenericSwitch
          disableAllFields={disableAllFields}
          checkedVal={updatedFields.reminderText}
          handleChange={handleChange}
          displayName='Reminder Text Messages'
          htmlName='reminderText'
        />
        <PhoneNumberInput
          phoneNumber={updatedFields.phoneNumber}
          disabled={disableAllFields}
          handleChange={handleChange}
        />
        <div className='row justify-content-center text-center mt-3'>
          <div className='col-12'>
            <button className='btn btn-primary' onClick={handleSubmit}>
              Update Notifiation Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderUpdateForm;
