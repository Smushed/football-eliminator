import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import './groupUserBoxStyle.css'

const GroupUserBox = ({ boxContent, type, buttonActive, inGroup = false }) => {

    const [displayData, updateDisplayData] = useState({});

    useEffect(() => {
        type === 'user' && getUserData();
        type === 'group' && getGroupData();
    }, [type]);

    const getUserData = () => {
        axios.get(`/api/getUserForBox/${boxContent}`)
            .then(res => {
                const { name, avatar, score } = res.data;
                updateDisplayData({ name, avatar, score: score.toFixed(2) });
            });
    };

    const getGroupData = () => {
        axios.get(`/api/getGroupForBox/${boxContent}`)
            .then(res => {
                const { name, avatar, score } = res.data;
                updateDisplayData({ name, avatar, score: score.toFixed(2) });
            });
    };

    return (
        <div className={`groupUserBox ` + (buttonActive && `adminHeight`)}>
            {/* <Link to={``}> GOOD CHANCE TO TRY AND FIGURE OUT HOW TO LINK TO THE USER OR GROUP PAGE */}
            <div className='groupUserBoxName'>
                {displayData.name}
            </div>
            {/* </Link> */}
            <div className='groupUserBoxAvatarWrapper'>
                <img className='groupUserBoxAvatar' src={displayData.avatar} />
            </div>
            <div className='groupUserBoxScoreWrapper'>
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

GroupUserBox.propTypes = {
    boxContent: PropTypes.string,
    type: PropTypes.string,
    buttonActive: PropTypes.bool, //Button Active for removing users from a group (if group page) or leaving group (if user profile page)
    inGroup: PropTypes.bool
}

export default GroupUserBox;
