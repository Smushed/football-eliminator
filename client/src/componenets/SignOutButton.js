import React from 'react';
import { Button } from 'reactstrap';
import { withFirebase } from './Firebase';

const textStyle = {
  fontSize: '25px',
  color: 'white',
  textDecoration: 'none',
}

const SignOutButton = ({ firebase }) => (
  <Button style={textStyle} color='link' onClick={firebase.doSignOut}>
    Sign Out
  </Button>
);

export default withFirebase(SignOutButton);