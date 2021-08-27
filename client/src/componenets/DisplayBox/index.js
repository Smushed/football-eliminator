import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import CloseSVG from '../../constants/SVG/close.svg';
import './displayBoxStyle.css';

import { useToasts } from 'react-toast-notifications';

const Alert = withReactContent(Swal);

//boxContent is the Id of either the user or the group
//type is either user or group.. which type it is is what the box is DISPLAYING
//      So on the group page where it's showing users, the type will be USER
const DisplayBox = ({
    boxContent,
    type,
    buttonActive,
    inGroup = false,
    currUserId = null,
    currPageId,
    updatePage
}) => {

    const [displayData, updateDisplayData] = useState({});

    useEffect(() => {
        type === 'user' && getUserData();
        type === 'group' && getGroupData();
    }, [type]);

    const { addToast } = useToasts();

    const getUserData = () => {
        axios.get(`/api/user/profile/box/${boxContent}`)
            .then(res => {
                const { name, avatar, score } = res.data;
                updateDisplayData({ name, avatar, score: score.toFixed(2) });
            });
    };

    const getGroupData = () => {
        axios.get(`/api/group/profile/box/${boxContent}`)
            .then(res => {
                const { name, avatar, score } = res.data;
                updateDisplayData({ name, avatar, score: score.toFixed(2) });
            });
    };

    const clickButton = async () => {
        if (currUserId === null) { return }

        if (type === 'user') {
            Alert.fire({
                title: `Are you sure you want to delete ${displayData.name}?`,
                text: 'This is final. Their scores and rosters for this group will be deleted.\nThere is no way to reverse this.',
                type: 'warning',
                confirmButtonColor: '#DC3545',
                showCancelButton: true,
                confirmButtonText: 'Delete'
            }).then(async res => {
                if (res.value) {
                    try {
                        const res = await axios.delete(`/api/group/user/${currPageId}/${boxContent}/${currUserId}`);
                        console.log(res)
                        updatePage();
                    } catch (err) {
                        addToast(err.response.data, { appearance: 'error', autoDismiss: true })
                    }
                }
            })
        }

    }

    return (
        <div className={`displayBox ` + (buttonActive && `withButtonHeight`)}>
            <Link to={`/profile/${type}/${displayData.name}`}>
                <div className='displayBoxName'>
                    {displayData.name}
                </div>
            </Link>
            <div className='displayBoxAvatarWrapper'>
                <img className='displayBoxAvatar' src={displayData.avatar} />
            </div>
            <div className='displayBoxScoreWrapper'>
                <div>
                    {type === 'user' ? 'Score: ' : 'Top Score: '}
                </div>
                <div>
                    {displayData.score}
                </div>
            </div>
            {buttonActive &&
                <div className='textCenter addRemoveButton'>
                    {type === 'group' &&
                        (inGroup ? <div>Leave Group</div> : <div>Join Group</div>)
                    }
                    {type === 'user' &&
                        !(boxContent === currUserId) &&
                        <button className='btn btn-danger btn-sm' onClick={() => clickButton()}>
                            Remove User<img className='closeSVGFit' src={CloseSVG} />
                        </button>
                    }
                </div>
            }
        </div>
    )
};

DisplayBox.propTypes = {
    boxContent: PropTypes.string,
    type: PropTypes.string,
    buttonActive: PropTypes.bool, //Button Active for removing users from a group (if group page) or leaving group (if user profile page)
    inGroup: PropTypes.bool,
    currUserId: PropTypes.string,
    currPageId: PropTypes.string,
    updatePage: PropTypes.func
}

export default DisplayBox;
