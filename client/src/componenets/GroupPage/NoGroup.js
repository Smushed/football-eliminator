import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import GroupSelect from './GroupSelect';
import CreateGroup from './CreateGroup';

class NoGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentWindow: 'No Group'
        };
    };

    changeWindow = (newWindow) => {
        this.setState({ currentWindow: newWindow })
    };

    render() {
        return (
            <Fragment>
                <ChangeWindowButtons changeWindow={this.changeWindow} currentWindow={this.state.currentWindow} />
                {this.state.currentWindow === 'No Group' ?
                    <div>Welcome to the eliminator! Let's start with selecting a group <br />
                    </div> :
                    this.state.currentWindow === 'Join Group' ?
                        <GroupSelect /> :
                        <CreateGroup
                            userId={this.props.userId}
                        />}
            </Fragment>
        )
    };
};

const ChangeWindowButtons = (props) => (
    <Fragment>
        {props.currentWindow !== 'Join Group' && <button className='btn btn-primary' onClick={() => props.changeWindow('Join Group')}>Join a Group</button>}
        {props.currentWindow !== 'Create Group' && <button className='btn btn-info' onClick={() => props.changeWindow('Create Group')}>Create a Group</button>}
    </Fragment>
)

const condition = authUser => !!authUser;

export default withAuthorization(condition)(NoGroup);