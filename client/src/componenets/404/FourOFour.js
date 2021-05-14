import React from 'react';
import './404style.css';
import PoorBaby from './Champs.jpg'

const FourOFour = () => {
    return (
        <div className='fourOFour' >
            <div className='fourOFourText'>404 - Not Found</div>
            <div className='gloat'>
                Hope you didn&apos;t get here like Rogers did
                <br />
                <br />
                <img className='ripGod' src={PoorBaby} alt='Sore Losers' />
            </div>
        </div>
    )
}

export default FourOFour;