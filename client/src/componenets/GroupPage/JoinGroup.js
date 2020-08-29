import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import './groupStyle.css';

const Alert = withReactContent(Swal);

class JoinGroup extends Component {
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
        axios.put(`/api/requestJoinGroup`, {
            userId: this.props.userId,
            groupId
        }).then(res => {
            window.location.reload(false);
        });
    };

    showUserlist = async (userlist, groupName) => {
        const listWithBreaks = userlist.map(user => `<br />${user}`)
        const userlistForDisplay = listWithBreaks.join();
        await Alert.fire({
            title: `${groupName} userlist`,
            html: userlistForDisplay,
        })
    };

    render() {
        return (
            <div className='joinGroupFlexContainer'>
                <div className='joinGroupContainer'>
                    <div className='joinGroupHeader'>
                        <div className='groupListCol'>
                            <div>
                                Group Name
                            </div>
                            <small>
                                (Click for Userlist)
                            </small>
                        </div>
                        <div className='groupListCol'>
                            Group Description
                    </div>
                        <div className='groupListCol'></div>
                    </div>
                    {this.state.groupList.map(group =>
                        <div key={group.N}>
                            <GroupRow
                                name={group.N}
                                desc={group.D}
                                UL={group.UL}
                                groupId={group.id}
                                joinGroup={this.joinGroup}
                                showUserlist={this.showUserlist}
                            />
                        </div>)}
                </div>
            </div>
        )
    };
};

const GroupRow = (props) => (
    <div className='joinGroupRow'>
        <div className='groupListCol groupName' onClick={() => props.showUserlist(props.UL, props.name)}>
            {props.name}
        </div>
        <div className='groupListCol'>
            {props.desc}
        </div>
        <div className='groupListCol rightCol'>
            <button className='btn btn-outline-primary' onClick={() => props.joinGroup(props.groupId)} >
                Join
            </button>
        </div>
    </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(JoinGroup);