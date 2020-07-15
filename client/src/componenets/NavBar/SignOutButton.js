import React from 'react';
import { withFirebase } from '../Firebase';

import SignOutIcon from './SignOut.png';

const SignOutButton = ({ firebase }) => (
  <div onClick={firebase.doSignOut}>
    <img className='navIcons' src={SignOutIcon} alt='Sign Out' />
  </div>
);

export default withFirebase(SignOutButton);