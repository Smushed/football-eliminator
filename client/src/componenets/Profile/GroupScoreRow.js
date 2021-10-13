import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';

const GroupScoreRow = ({ groupId, editable, changeGroupScoreField }) => {

    const [groupScore, updateGroupScore] = useState({});
    const [posDescMap, updatePosDescMap] = useState({});

    const axiosCancel = axios.CancelToken.source();

    useEffect(() => {
        if (groupId) {
            pullGroupScoring(groupId);
        }
        return function cancelAPICalls() {
            if (axiosCancel) {
                axiosCancel.cancel(`Unmounted`);
            }
        }
    }, [groupId]);

    const pullGroupScoring = (groupId) => {
        axios.get(`/api/group/scoring/${groupId}?withDesc=true`, { cancelToken: axiosCancel.token })
            .then(res => {
                updateGroupScore(res.data.groupScore);
                updatePosDescMap({ bucketMap: res.data.bucketMap, posMap: res.data.map });
            })
            .catch(err => {
                if (err.message !== `Unmounted`) { console.log(err) }
            });
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
                                <div key={scoreField} className='groupScoreInputWrapper groupScoreNoInput'>
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