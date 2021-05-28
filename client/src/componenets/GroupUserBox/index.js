import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import './groupUserBoxStyle.css'

const GroupUserBox = ({ boxContent, type }) => {

    const [displayData, updateDisplayData] = useState({});

    useEffect(() => {
        type === 'user' && getUserData();
    }, [type]);

    const getUserData = () => {
        axios.get(`/api/getUserForBox/${boxContent}`)
            .then(res => updateDisplayData({ name: res.data.UN, avatar: res.data.avatar, score: res.data.TS.toFixed(2) }));
    };

    const getGroupData = () => {
        console.log(`group`)
    };

    return (
        <div className='groupUserBox'>
            <div>
                {displayData.name}
            </div>
            <img className='groupUserBoxAvatar' src={displayData.avatar} />
            <div>
                {displayData.score}
            </div>
            {/* Username / Groupname | Total Score / Best Score */}
        </div>
    )
};

GroupUserBox.propTypes = {
    boxContent: PropTypes.string,
    type: PropTypes.string
}

export default GroupUserBox;
