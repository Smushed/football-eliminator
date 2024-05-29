import { useState, useEffect } from 'react';
import axios from 'axios';
import ChartLeaderboard from './ChartLeaderboard';
import Podium from './Podium';

const Leaderboard = ({ season, week, groupId }) => {
  const [leaderboard, updateLeaderboard] = useState([]);

  useEffect(() => {
    if (
      season &&
      season !== '' &&
      week &&
      week !== 0 &&
      groupId &&
      groupId !== ''
    ) {
      getLeaderBoard(season, week, groupId);
    }
  }, [season, week, groupId]);

  const axiosCancel = axios.CancelToken.source();

  const getLeaderBoard = (season, week, groupId) =>
    axios
      .get(`/api/group/leaderboard/${season}/${week}/${groupId}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateLeaderboard(res.data.leaderboard);
        return;
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
        throw err;
      });

  return (
    <div className='row border pb-2 mb-2 mt-2 leaderboardContainter'>
      <div className='col-12'>
        <ChartLeaderboard leaderboard={leaderboard} />
      </div>
    </div>
  );
};

export default Leaderboard;
