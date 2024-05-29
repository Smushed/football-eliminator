import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DisplayBox from '../DisplayBox';
import Leaderboard from '../Leaderboard/TableLeaderboard';

const GroupDisplayWithLeaderboard = ({
  groupId,
  currentUserId,
  isCurrentUser,
  repullUser,
}) => {
  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    if (groupId) {
      getLeaderboard(groupId);
      getGroupName(groupId);
    }
  }, [groupId]);

  useEffect(
    () => () => {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    },
    []
  );

  const [leaderboard, setLeaderboard] = useState([]);
  const [week, setWeek] = useState(1);
  const [groupName, setGroupName] = useState('');

  const getGroupName = (gId) => {
    axios
      .get(`/api/group/details/${gId}`, { cancelToken: axiosCancel.token })
      .then((res) => {
        setGroupName(res.data.N);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getLeaderboard = (gId) => {
    axios
      .get(`/api/nfldata/currentSeasonAndWeek`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        const { season, week } = res.data;
        setWeek(week);

        axios
          .get(`/api/group/leaderboard/${season}/${week}/${gId}`)
          .then((res2) => setLeaderboard(res2.data.leaderboard))
          .catch((err) => {
            if (err.message !== `Unmounted`) {
              console.log(err);
            }
          });
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };
  return (
    <div className='row'>
      <div className='col-4 justify-content-end'>
        <DisplayBox
          key={groupId}
          boxContent={groupId}
          type='group'
          buttonActive={isCurrentUser}
          currUserId={currentUserId}
          updatePage={repullUser}
          currPageId={currentUserId}
        />
      </div>
      <div className='col-6'>
        <Leaderboard
          groupName={groupName}
          week={week}
          leaderboard={leaderboard}
        />
      </div>
    </div>
  );
};

export default GroupDisplayWithLeaderboard;
