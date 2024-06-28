import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ChartLeaderboard from './ChartLeaderboard';

import './leaderBoardStyle.css';
import { NFLScheduleContext } from '../../App.js';

const Leaderboard = ({ weekToShow, groupId }) => {
  const [leaderboard, updateLeaderboard] = useState([]);
  const { currentNFLTime } = useContext(NFLScheduleContext);

  useEffect(() => {
    if (
      currentNFLTime.season &&
      currentNFLTime.season !== '' &&
      weekToShow &&
      weekToShow !== 0 &&
      groupId &&
      groupId !== ''
    ) {
      getLeaderBoard(currentNFLTime.season, weekToShow, groupId);
    }
  }, [currentNFLTime.season, weekToShow, groupId]);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

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
          console.log({ err });
        }
      });

  return (
    <div className='row border pb-2 mb-2 mt-2 justify-content-center leaderboardContainter'>
      <div className='col-md-12 col-lg-10'>
        <ChartLeaderboard leaderboard={leaderboard} />
      </div>
    </div>
  );
};

export default Leaderboard;
