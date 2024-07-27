import React from 'react';
import { Link } from 'react-router-dom';

import * as Routes from '../../constants/routes';
import ElimLogo from '../../constants/elimLogos/ElimLogoNoThe.png';
import SmallElimLogo from '../../constants/elimLogos/SmallElimLogoText.png';

const NavBar = ({ toggleSideBar }) => (
  <nav className='navbar navbar-light border-bottom border-2'>
    <div className='row w-100 position-relative'>
      <div
        className='ms-5 mt-3 position-absolute w-auto'
        role='button'
        onClick={() => toggleSideBar()}
      >
        <svg viewBox='0 0 100 80' width='40' height='40'>
          <rect width='100' height='20' rx='6'></rect>
          <rect y='30' width='100' height='20' rx='6'></rect>
          <rect y='60' width='100' height='20' rx='6'></rect>
        </svg>
      </div>
      <div className='d-none d-md-block ms-3 flex-grow-1 text-center'>
        <Link to={Routes.home}>
          <img src={ElimLogo} />
        </Link>
      </div>
      <div className='d-block d-md-none ms-5 flex-grow-1 text-center'>
        <Link to={Routes.home}>
          <img src={SmallElimLogo} />
        </Link>
      </div>
    </div>
  </nav>
);

export default NavBar;
