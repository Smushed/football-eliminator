import React from 'react';
import PropTypes from 'prop-types';

import './navBarStyle.css';

const NavBar = ({ showHideSideBar }) =>
    <div className='navHeader' >
        <div className='menuButton' onClick={() => showHideSideBar()} >
            <svg viewBox='0 0 100 80' width='40' height='40'  >
                <rect width='100' height='20' rx='6'></rect>
                <rect y='30' width='100' height='20' rx='6'></rect>
                <rect y='60' width='100' height='20' rx='6'></rect>
            </svg>
        </div>
    </div>

NavBar.propTypes = {
    showHideSideBar: PropTypes.func
}

export default NavBar;