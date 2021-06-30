import React from 'react';
import PropTypes from 'prop-types';

import './leaderBoardStyle.css'

const Leaderboard = ({ groupName, week, leaderboard }) => (
    <div className='leaderboardContainter'>
        <div className='leaderboard'>
            <div className='leaderboardHeader'>
                <span className='headerText leftHeader'>
                    {groupName}
                </span>
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
                        <div className='firstCol'>
                            {user.UN}
                        </div>
                        <div className='secondCol'>
                            {user.LW.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </div>
                        <div className='thirdCol'>
                            {user.CW.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </div>
                        <div className='fourthCol'>
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
