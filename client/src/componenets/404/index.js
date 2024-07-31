import React from 'react';
import { Link } from 'react-router-dom';
import { home } from '../../constants/routes';

const FourOFour = () => {
  return (
    <>
      <div className='row'>
        <h1 className='col-12 text-center mt-5'>404 - Page Not Found</h1>
      </div>
      <div className='row'>
        <div className='col-12 text-center mt-4'>
          <Link to={home}>
            <h2>Return Home</h2>
          </Link>
        </div>
      </div>
    </>
  );
};

export default FourOFour;
