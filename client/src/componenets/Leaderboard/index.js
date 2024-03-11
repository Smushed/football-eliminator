import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import ChartLeaderboard from './ChartLeaderboard';

const Leaderboard = ({ season, week, groupId }) => {
  const [leaderAvatar, updateLeaderAvatar] = useState(``);
  const [leaderboard, updateLeaderboard] = useState([]);

  useEffect(() => {
    if (leaderboard && leaderboard.length > 0) {
      getLeaderAvatar(leaderboard[0].UID);
    }
  }, [leaderboard]);

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
  }, []);

  const axiosCancel = axios.CancelToken.source();

  const getLeaderAvatar = (leaderId) => {
    axios
      .get(`/api/user/avatar/${leaderId}`, { cancelToken: axiosCancel.token })
      .then((res) => {
        updateLeaderAvatar(res.data);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

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
    <div className='row border justify-around pb-2 mb-2 mt-2'>
      <div className='col-lg-4 col-md-12 text-center'>
        <div className='fs-3'>
          <div className='fw-bold'>Current Leader</div>
          {leaderboard.length > 0 && leaderboard[0].UN}
        </div>
        <img className='img-fluid rounded' src={leaderAvatar} />
      </div>
      <div className='col-lg-8 col-md-12'>
        <ChartLeaderboard leaderboard={leaderboard} />
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
