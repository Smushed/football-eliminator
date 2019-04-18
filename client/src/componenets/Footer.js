import React from 'react';
import '../App.css';

const footer = {
    position: 'fixed',
    left: '0',
    bottom: '0',
    maxWidth: '100%',
    maxHeight: '250px',
    backgroundSize: 'contain',
    backgroundColor: 'red',
    color: 'white',
    textAlign: 'center',
    marginTop: '250px'
};

const Footer = (props) => {
    return (
        <div style={footer}>
            <img src='../img/bookshelf.jpg' alt='Row of Books' />
        </div>
    )
}

export default Footer;