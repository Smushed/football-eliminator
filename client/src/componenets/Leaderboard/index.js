import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
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
      <div className='col-lg-8 col-md-12'>
        <ChartLeaderboard leaderboard={leaderboard} />
      </div>
      <div className='col-lg-4 d-lg-block d-none'>
        <Podium leaderboard={leaderboard} />
      </div>
    </div>
  );
};

Leaderboard.propTypes = {
  season: PropTypes.string,
  week: PropTypes.number,
  groupId: PropTypes.string,
};

export default Leaderboard;
