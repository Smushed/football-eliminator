import React, { useEffect, useState } from 'react';
import { withFirebase } from '../Firebase';
import PropTypes from 'prop-types';
import axios from 'axios';

import './singleGroupStyle.css';
import GroupUserBox from '../GroupUserBox';

const SingleGroup = ({ match, currUserId }) => {

    const [groupData, updateGroupData] = useState(false);
    const [isAdmin, updateIsAdmin] = useState(false);

    useEffect(() => {
        if (match.params.groupname !== ``) {
            axios.get(`/api/getGroupData/${match.params.groupname}`)
                .then(res => {
                    updateGroupData(res.data);
                });
        }
        (groupData & currUserId) && checkForAdmin();
    }, [match.params.groupname, currUserId]);

    const checkForAdmin = () => {
        if (currUserId === undefined) { return }
        const inGroupUser = groupData.UL.find(user => user.ID === currUserId);
        inGroupUser && updateIsAdmin(inGroupUser.A);
    };

    return (
        <div>
            {match.params.groupname}
            {groupData && groupData.UL.map(user =>
                <GroupUserBox
                    key={user.ID}
                    boxContent={user.ID}
                    type='user'
                />
            )}
        </div>
    )
};

SingleGroup.propTypes = {
    match: PropTypes.object,
    currUserId: PropTypes.string
}

export default withFirebase(SingleGroup);
