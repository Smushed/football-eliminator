import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './leaderBoardStyle.css'

const Leaderboard = ({ groupName, week, leaderboard }) => (
    <div className='leaderboardContainter'>
        <div className='leaderboard'>
            <div className='leaderboardHeader'>
                <Link to={`/profile/group/${groupName}`}>
                    <span className='headerText leftHeader'>
                        {groupName}
                    </span>
                </Link>
                <span className='leaderboardTitle'>
                    Leaderboard
                </span>
                <span className='headerText rightHeader'>
                    Week {week}
                </span>
            </div>
            <div className='leaderboardRow'>
                <div className='firstCol'>
                    Name
                </div>
                <div className='secondCol'>
                    Last Week
                </div>
                <div className='thirdCol'>
                    Curr Week
                </div>
                <div className='fourthCol'>
                    Total
                </div>
            </div>
            {leaderboard &&
                leaderboard.map((user, i) => (
                    <div className={i % 2 ? 'leaderboardRow' : 'leaderboardRow oddRow'} key={user.UN}>
                        <div className='firstCol wordOverflow'>
                            {user.UN}
                        </div>
                        <div className='secondCol wordOverflow'>
                            {user.LW.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </div>
                        <div className='thirdCol wordOverflow'>
                            {user.CW.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </div>
                        <div className='fourthCol wordOverflow'>
                            {user.TS.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
        </div>
    </div>
)

Leaderboard.propTypes = {
    user: PropTypes.object,
    groupName: PropTypes.string,
    leaderboard: PropTypes.array,
    week: PropTypes.number
}


export default Leaderboard;
