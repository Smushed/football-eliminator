import React, { Fragment, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Jimp from 'jimp';
import { useToasts } from 'react-toast-notifications';
import { Collapse } from 'react-collapse';

import { AvatarInput } from './ProfileInputs';
import { ImageEditor } from './ModalWindows';

const GroupEditor = ({ groupInfo, groupPositions }) => {
    const [rosterPositions, updateRosterPositions] = useState([]);
    const [positionMap, updatePositionMap] = useState([]);
    const [maxOfPosition, updateMaxOfPosition] = useState([]);
    const [updatedFields, changeUpdatedFields] = useState({ groupName: ``, groupDesc: `` });

    const [groupScore, updateGroupScore] = useState({});
    const [posDescMap, updatePosDescMap] = useState({});

    const [tempAvatar, updateTempAvatar] = useState(``);
    const [editAvatar, updateEditAvatar] = useState(``);
    const [imageCropOpen, updateImageCropOpen] = useState(false);

    const fileInputRef = useRef(null);

    const { addToast } = useToasts();

    useEffect(() => {
        if (groupInfo._id) {
            pullGroupScoring(groupInfo._id);
            getRosterPositions();
        }
    }, [groupInfo._id]);

    const pullGroupScoring = async (groupId) => {
        const groupScoring = await axios.get(`/api/group/scoring/${groupId}?withDesc=true`);
        updateGroupScore(groupScoring.data.groupScore);
        updatePosDescMap({ bucketMap: groupScoring.data.bucketMap, posMap: groupScoring.data.map });
    };

    const getRosterPositions = async () => {
        const dbResponse = await axios.get(`/api/roster/positions`);
        const { rosterPositions, positionMap, maxOfPosition } = dbResponse.data;
        updateRosterPositions(rosterPositions);
        updatePositionMap(positionMap);
        updateMaxOfPosition(maxOfPosition);
    };

    const handleChange = (e) => {
        if (e.target.name === `avatar`) {

            //Checks if the file uploaded is an image
            if (!!e.target.files[0].type.match(`image.*`)) {
                Jimp.read((URL.createObjectURL(e.target.files[0])), async (err, img) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    const mime = await img.getBase64Async(Jimp.MIME_JPEG);
                    updateImageCropOpen(!imageCropOpen);
                    updateTempAvatar(mime);
                });
            } else {
                addToast('File is not an image. Please only upload images', { appearance: 'warning', autoDismiss: true });
                e.target.value = '';
            }
            return;
        }

        changeUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
    };

    const resetImage = () => {
        updateImageCropOpen(false);
        updateTempAvatar(``);
    };

    const saveCroppedAvatar = (mime) => {
        updateEditAvatar(mime);
        updateTempAvatar(``);
        updateImageCropOpen(!imageCropOpen);
        changeUpdatedFields({ ...updatedFields, avatar: `active` });
    };

    const scoreBuckets = Object.keys(groupScore);

    return (
        <Fragment>
            <div>Name</div>
            <input className='form-control' name='groupName' type='text' value={updatedFields.groupName} placeholder={groupInfo.N} onChange={handleChange} />
            <div>Description</div>
            <input className='form-control' name='groupDesc' type='textbox' value={updatedFields.groupDesc} placeholder={groupInfo.D} onChange={handleChange} />
            <div>
                <Collapse isOpened={!imageCropOpen}>
                    {editAvatar !== `` &&
                        <div>
                            <img className='userAvatar' src={editAvatar} />
                        </div>
                    }
                    <AvatarInput
                        handleChange={handleChange}
                        fileInputRef={fileInputRef}
                    />
                </Collapse>
                <Collapse isOpened={imageCropOpen}>
                    <ImageEditor
                        tempAvatar={tempAvatar}
                        fileInputRef={fileInputRef}
                        saveCroppedAvatar={saveCroppedAvatar}
                        openCloseModal={resetImage}
                    />
                </Collapse>
            </div>
            <div className='groupPosHeader'>
                Group Positions
            </div>
            {groupPositions.length > 0 &&
                groupPositions.map((pos, i) =>
                    <div key={i} className='groupPos'>
                        {pos.N}
                    </div>
                )}
            {posDescMap.bucketMap && scoreBuckets.map(bucket =>
                <div key={bucket} className='groupScoreBucket'>
                    <div className='groupScoreBucketName'>
                        {posDescMap.bucketMap[bucket]}
                    </div>
                    <div className='groupScoreFields'>
                        {Object.keys(groupScore[bucket]).map(scoreField =>
                            <div key={scoreField}>
                                <div >{posDescMap.posMap[bucket][scoreField]} </div>
                                <input placeholder={groupScore[bucket][scoreField]} />
                            </div>
                        )}
                    </div>
                </div>
            )}

        </Fragment >
    )
}

GroupEditor.propTypes = {
    groupInfo: PropTypes.object,
    groupPositions: PropTypes.array
}

export default GroupEditor;