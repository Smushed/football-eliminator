import React, { useState, Fragment } from 'react';
import { withAuthorization } from '../Session';
import GroupSelect from './JoinGroup';
import CreateGroup from './CreateGroup';
import PropTypes from 'prop-types';

const NoGroup = ({ userId }) => {

    const [currentWindow, updateCurrentWindow] = useState(`Join Group`)

    const changeWindow = (newWindow) => {
        updateCurrentWindow(newWindow);
    };

    return (
        <div className='groupContainer'>
            <div className='leftToggle'>
                <div className='welcomeHeader'>
                    Welcome to the Eliminator!
                </div>
                <br />
                <div className='welcomeMessage'>
                    Here we play fantasy football but with a spin on the rules:
                    <br />
                    <br />
                    Every user sets a lineup each week by having access to every offensive player in the NFL. But you can only play each player one time.
                    <br />
                    <br />
                    You compete against everyone else in your group and play for total points at the end of the year. Join a group or create one to begin filling out your roster!
                    <br />
                    <br />
                    Please feel free to email or text me if you find any bugs, have any questions or have any issues.
                    <br />
                    <br />
                </div>
                <ChangeWindowButtons changeWindow={changeWindow} currentWindow={currentWindow} />
            </div>
            <div className='rightWindow'>
                {currentWindow === 'Join Group' ?
                    <GroupSelect
                        userId={userId}
                    /> :
                    <CreateGroup
                        userId={userId}
                    />}
            </div>
        </div>
    )
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