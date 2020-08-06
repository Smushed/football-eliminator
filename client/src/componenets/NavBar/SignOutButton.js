import React from 'react';
import { withFirebase } from '../Firebase';

import SignOutIcon from './SignOut.png';

const SignOutButton = ({ firebase, descText }) => (
  <div onClick={firebase.doSignOut} className='signOut'>
    <img className='signoutIcon' src={SignOutIcon} alt='Sign Out' />
    {descText &&
      `Sign Out`
    }
  </div>
);

export default withFirebase(SignOutButton);