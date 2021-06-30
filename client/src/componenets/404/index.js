import React from 'react';
import { Link } from 'react-router-dom';
import { home } from '../../constants/routes';
import PoorBaby from './Champs.jpg'
import './404style.css';

const FourOFour = () => {
    return (
        <div className='fourOFour' >
            <div className='fourOFourText'>404 - Not Found</div>
            <div className='gloat'>
                Hope you didn&apos;t get here like Rogers did
                <br />
                <br />
                <Link to={home}>
                    <img className='ripGod' src={PoorBaby} alt='Sore Losers' />
                </Link>
            </div>
        </div>
    )
}

export default FourOFour;