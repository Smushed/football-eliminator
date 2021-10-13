import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';

import { EmailToggleInput } from '../Profile/ProfileInputs';

const EmailPref = ({
    match,
    history }) => {

    const [user, updateUser] = useState({});
    const [emailPref, updateEmailPref] = useState({});

    const axiosCancel = axios.CancelToken.source();

    useEffect(() => {
        getUser(match.params.userId);
        getUserEmailPref(match.params.userId);

        return function cancelAPICalls() {
            if (axiosCancel) {
                axiosCancel.cancel(`Unmounted`);
            }
        }
    }, [match.params.userId]);

    const { addToast } = useToasts();

    const getUser = (userId) => {
        axios.get(`/api/user/id/${userId}`, { cancelToken: axiosCancel.token })
            .then(res => updateUser(res.data))
            .catch(err => {
                if (err.message !== `Unmounted`) { history.push(`/404`); }
            });
    };

    const getUserEmailPref = (userId) => {
        axios.get(`/api/user/emailPref/${userId}`, { cancelToken: axiosCancel.token })
            .then(res => updateEmailPref(res.data))
            .catch(err => {
                if (err.message !== `Unmounted`) { history.push(`/404`); }
            });
    };

    const handleChange = (e) => {
        const updatedVal = (e.target.value === `true`);
        if (e.target.name === `leaderboardEmail`) {
            handleSubmit(updatedVal, emailPref.RE);
        } else {
            handleSubmit(emailPref.LE, updatedVal);

        }
    };

    const handleSubmit = async (LE, RE) => {
        try {
            await axios.put(`/api/user/emailPref/${user._id}/${LE}/${RE}`);
        } catch (err) {
            addToast('Save Error - Contact Kevin', { appearance: 'warning', autoDismiss: true });
        }
        addToast('Email Preference Saved', { appearance: 'success', autoDismiss: true });
        getUserEmailPref(user._id);
    }

    return <EmailToggleInput
        leaderboardEmailPref={emailPref.LE}
        reminderEmailPref={emailPref.RE}
        handleChange={handleChange}
    />
};

EmailPref.propTypes = {
    match: PropTypes.any,
    history: PropTypes.any,
}

export default EmailPref;