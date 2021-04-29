import React from 'react';

import './leaderBoardStyle.css'

const Leaderboard = (props) => (
    <div className='leaderboardContainter'>
        <div className='leaderboard'>
            <div className='leaderboardHeader'>
                <span className='headerText leftHeader'>
                    {props.groupName}
                </span>
                <span className='leaderboardTitle'>
                    Leaderboard
                </span>
                <span className='headerText rightHeader'>
                    Week {props.week}
                </span>
            </div>
            <div className='leaderboardRow'>
                <div className='firstCol'>
                    Username
                </div>
                <div className='secondCol'>
                    Last Week Score
                </div>
                <div className='thirdCol'>
                    Curr Week Score
                </div>
                <div className='fourthCol'>
                    Total Score
                </div>
            </div>
            {props.leaderboard &&
                props.leaderboard.map((user, i) => (
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


export default Leaderboard;
