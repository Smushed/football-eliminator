import React from 'react';
import { Link } from 'react-router-dom';
import { home } from '../../constants/routes';
import PoorBaby from './Champs.jpg';
import whiteBackground from '../../constants/elimLogos/DarkModeLargeElimLogo.png';
import './404style.css';

const FourOFour = () => {
  return (
    <div className='fourOFour'>
      <img src={whiteBackground} />
      <div className='fourOFourText'>404 - Not Found</div>
      <div className='gloat'>
        <Link to={home}>
          <img className='ripGod' src={PoorBaby} alt='Sore Losers' />
        </Link>
      </div>
    </div>
  );
};

export default FourOFour;
