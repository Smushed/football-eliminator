import React from 'react';
import 'react-table/react-table.css';

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
                    Last Week's Score
                </div>
                <div className='thirdCol'>
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
                            {user.W}
                        </div>
                        <div className='thirdCol'>
                            {user.TS}
                        </div>
                    </div>
                ))}
        </div>
    </div>
)


export default Leaderboard;
