import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { withRouter } from 'react-router-dom';

import './usedPlayerStyle.css';

class UsedPlayerButton extends Component {

    redirect = () => {
        const redirectValue = '/usedPlayers/' + this.props.userId;

        this.props.history.push(redirectValue);
    };


    render() {
        return (
            <div className='userPlayerButton'>
                <Button color='info' onClick={this.redirect}>
                    View {this.props.username}'s Used Players
                </Button>
            </div>
        );
    };
};

export default withRouter(UsedPlayerButton);