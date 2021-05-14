import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import GroupSelect from './JoinGroup';
import CreateGroup from './CreateGroup';
import PropTypes from 'prop-types';

class NoGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentWindow: 'Join Group'
        };
    }

    changeWindow = (newWindow) => {
        this.setState({ currentWindow: newWindow })
    };

    render() {
        return (
            <div className='groupContainer'>
                <div className='leftToggle'>
                    <div className='welcomeHeader'>
                        Welcome to the eliminator!
                        </div>
                    <br />
                    <div className='welcomeMessage'>
                        Here we play fantasy football but with a spin on the rules:
                        <br />
                        <br />
                        Every user sets a lineup each week by having access to every offensive player in the NFL. But you can only play each player one time.
                        <br />
                        <br />
                        You compete against everyone else in your group and play for total points at the end of the year. Join a group or create one on the left to begin filling out your roster!
                        <br />
                        <br />
                        Please feel free to email or text me if you find any bugs, have any questions or have any issues.
                        <br />
                        <br />
                    </div>
                    <ChangeWindowButtons changeWindow={this.changeWindow} currentWindow={this.state.currentWindow} />
                </div>
                <div className='rightWindow'>
                    {this.state.currentWindow === 'Join Group' ?
                        <GroupSelect
                            userId={this.props.userId}
                        /> :
                        <CreateGroup
                            userId={this.props.userId}
                        />}
                </div>
            </div>
        )
    }
}

const ChangeWindowButtons = ({ currentWindow, changeWindow }) => (
    <Fragment>
        {currentWindow !== 'Join Group' && <button className='btn btn-info' onClick={() => changeWindow('Join Group')}>Join a Group</button>}
        {currentWindow !== 'Create Group' && <button className='btn btn-info' onClick={() => changeWindow('Create Group')}>Create a Group</button>}
    </Fragment>
)

NoGroup.propTypes = {
    userId: PropTypes.string,
};

ChangeWindowButtons.propTypes = {
    currentWindow: PropTypes.string,
    changeWindow: PropTypes.func
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(NoGroup);