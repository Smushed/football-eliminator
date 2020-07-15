import React from 'react';
import { Link } from 'react-router-dom';

import * as Routes from '../../constants/routes';
import SignOutButton from './SignOutButton';


import HomeIcon from './HomeButton.png';
import './navBarStyle.css';

const NavBar = ({ authUser }) => {
    return (
        authUser ? (
            <div className='navHeader'>
                <div >
                    <Link to={Routes.home}>
                        <img className='navIcons' src={HomeIcon} alt={`Home`} />
                    </Link>
                </div>
                {/* TODO START HERE */}
                {/* SEND VERIFICATION EMAIL

                https://firebase.google.com/docs/auth/web/manage-users
                */}
                {!authUser.emailVerified && `Verify!`}
                <div>
                    <SignOutButton />
                </div>
            </div>
        ) : (
                <div className='navHeader'>
                    <div >
                        <Link to={Routes.home}>
                            <img className='navIcons' src={HomeIcon} alt={`Home`} className='' />
                        </Link>
                    </div>
                    <div>
                        <Link to={Routes.home}>
                            <img className='navIcons' src={HomeIcon} alt={`Home`} />
                        </Link>
                    </div>
                    <div>
                        <Link to={Routes.home}>
                            <img className='navIcons' src={HomeIcon} alt={`Home`} />
                        </Link>
                    </div>
                    )
                </div>

            )
    );
}



export default NavBar;