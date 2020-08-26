import React, { Component, Fragment } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';

import './groupStyle.css';


class GroupSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupList: [],
        };
    };
    componentDidMount() {
        this.getGroupList()
    };

    getGroupList = async () => {
        const groupList = await axios.get(`/api/getGroupList`);
        this.setState({ groupList: groupList.data })
    };

    joinGroup = async (groupId) => {
        console.log(groupId)
    };

    render() {
        return (
            <Fragment>
                <div className='joinGroupHeader'>
                    <div className='col1'>
                        <div>
                            Group Name
                        </div>
                        <small>
                            Hover for Userlist
                        </small>
                    </div>
                    <div className='col2'>
                        Group Description
                    </div>
                    <div className='col3'>som</div>
                </div>
                {this.state.groupList.map(group =>
                    <div key={group.N}>
                        <GroupRow
                            name={group.N}
                            desc={group.D}
                            UL={group.UL}
                            groupId={group.id}
                            joinGroup={this.joinGroup}
                        />
                    </div>)}
            </Fragment>
        )
    };
};

const GroupRow = (props) => (
    <div className='joinGroupRow'>
        <div className='col1'>
            {props.name}
        </div>
        <div className='col2'>
            {props.desc}
        </div>
        <div className='col3'>
            <button className='btn btn-outline-primary' onClick={() => props.joinGroup(props.groupId)} >
                Join
            </button>
        </div>
    </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(GroupSelect);