import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';

const GroupScoreRow = ({ groupId, editable, changeGroupScoreField }) => {

    const [groupScore, updateGroupScore] = useState({});
    const [posDescMap, updatePosDescMap] = useState({});

    useEffect(() => {
        if (groupId) {
            pullGroupScoring(groupId);
        }
    }, [groupId]);

    const pullGroupScoring = async (groupId) => {
        const groupScoring = await axios.get(`/api/group/scoring/${groupId}?withDesc=true`);
        updateGroupScore(groupScoring.data.groupScore);
        updatePosDescMap({ bucketMap: groupScoring.data.bucketMap, posMap: groupScoring.data.map });
    };

    const handleChange = (e) => {
        changeGroupScoreField(e.target.name, e.target.value);
    };

    const scoreBuckets = Object.keys(groupScore);

    return (
        <div>
            {posDescMap.bucketMap &&
                scoreBuckets.map(bucket =>
                    <div key={bucket} className='groupScoreBucket'>
                        <div className='groupScoreBucketName'>
                            {posDescMap.bucketMap[bucket]}
                        </div>
                        <div className='groupScoreFields'>
                            {Object.keys(groupScore[bucket]).map(scoreField =>
                                <div key={scoreField} className='groupScoreInputWrapper'>
                                    <div className='groupScoreBucketDesc'>
                                        {posDescMap.posMap[bucket][scoreField]}
                                    </div>
                                    {editable ?
                                        <input className='form-control groupScoreInput' name={`${bucket}-${scoreField}`} value={groupScore[bucket][scoreField]} onChange={handleChange} />
                                        :
                                        <div>{groupScore[bucket][scoreField]}</div>
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
};

GroupScoreRow.propTypes = {
    groupId: PropTypes.string,
    editable: PropTypes.bool,
    changeGroupScoreField: PropTypes.func
};

export default GroupScoreRow;