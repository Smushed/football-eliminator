import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import * as Routes from '../../constants/routes';
import './navBarStyle.css';
import ElimLogo from '../../constants/elimLogos/ElimLogoText.png';
import SmallElimLogo from '../../constants/elimLogos/SmallElimLogoText.png';

const NavBar = ({ showHideSideBar }) =>
    <>
        <Link to={Routes.home}>
            <div className='navBarLogo'>
                <img className='' src={ElimLogo} />
            </div>
        </Link>
        <Link to={Routes.home}>
            <div className='smallNavBarLogo'>
                <img className='' src={SmallElimLogo} />
            </div>
        </Link>
        <div className='navHeader' >
            <div className='menuButton' onClick={() => showHideSideBar()} >
                <svg viewBox='0 0 100 80' width='40' height='40'  >
                    <rect width='100' height='20' rx='6'></rect>
                    <rect y='30' width='100' height='20' rx='6'></rect>
                    <rect y='60' width='100' height='20' rx='6'></rect>
                </svg>
            </div>

        </div>
    </>

NavBar.propTypes = {
    showHideSideBar: PropTypes.func
}

export default NavBar;