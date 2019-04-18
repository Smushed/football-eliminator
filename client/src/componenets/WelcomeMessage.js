import React from 'react'

const about = {
    fontSize: '17px',
    textAlign: 'center',
};

const welcomeMessage = {
    color: '#152282',
    fontSize: '42px'
}

const WelcomeMessage = (props) => {
    return (
        <p style={about}>
            <br />
            <strong style={welcomeMessage}>Welcome to Bookworm!</strong>
            <br /><br /><br />
            We’re helping you create a community around the books you love and the ones you want to read. By joining us we help keep you engaged with reading. Join now, create a club, invite your friends, pick your favorite book and get reading!
                <br></br> <br></br>
            Bookworm helps you facilitate your book club ensuring everyone is on the same page and place where your club can talk about the book. Our clubs feature benchmark tracking and dialog between users through a familiar post and comment feature.
                <br></br> <br></br>
            We’re totally free, why not sign in and get reading?
        </p>
    )
};

export default WelcomeMessage;