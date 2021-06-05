import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import './displayBoxStyle.css'

//boxContent is the Id of either the user or the group

const DisplayBox = ({ boxContent, type, buttonActive, inGroup = false }) => {

    const [displayData, updateDisplayData] = useState({});

    useEffect(() => {
        type === 'user' && getUserData();
        type === 'group' && getGroupData();
    }, [type]);

    const getUserData = () => {
        axios.get(`/api/user/box/${boxContent}`)
            .then(res => {
                console.log(res)
                const { name, avatar, score } = res.data;
                updateDisplayData({ name, avatar, score: score.toFixed(2) });
            });
    };

    const getGroupData = () => {
        axios.get(`/api/group/box/${boxContent}`)
            .then(res => {
                const { name, avatar, score } = res.data;
                updateDisplayData({ name, avatar, score: score.toFixed(2) });
            });
    };

    return (
        <div className={`displayBox ` + (buttonActive && `adminHeight`)}>
            <Link to={`/profile/${type}/${displayData.name}`}>
                <div className='displayBoxName'>
                    {displayData.name}
                </div>
            </Link>
            <div className='displayBoxAvatarWrapper'>
                <img className='displayBoxAvatar' src={displayData.avatar} />
            </div>
            <div className='displayBoxScoreWrapper'>
                <div>
                    {type === 'user' ? 'Total Score: ' : 'Top Score: '}
                </div>
                <div>
                    {displayData.score}
                </div>
            </div>
            <div>
                {type === 'group' &&
                    (inGroup ? <div>Leave Group</div> : <div>Join Group</div>)
                }
            </div>
            {/* Username / Groupname | Total Score / Best Score */}
        </div>
    )
};

DisplayBox.propTypes = {
    boxContent: PropTypes.string,
    type: PropTypes.string,
    buttonActive: PropTypes.bool, //Button Active for removing users from a group (if group page) or leaving group (if user profile page)
    inGroup: PropTypes.bool
}

export default DisplayBox;
