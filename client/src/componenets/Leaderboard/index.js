import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ChartLeaderboard from './ChartLeaderboard';

import { NFLScheduleContext } from '../../App.js';
import { axiosHandler, httpErrorHandler } from '../../utils/axiosHandler.js';

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

  const getLeaderBoard = async (season, week, groupId) => {
    try {
      const { data } = await axiosHandler.get(
        `/api/group/leaderboard/${season}/${week}/${groupId}`,
        axiosCancel.token
      );
      updateLeaderboard(data.leaderboard);
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  return (
    <div className='row border pb-2 mb-2 mt-2 justify-content-center leaderboardContainter'>
      <div className='col-md-12 col-lg-10'>
        <ChartLeaderboard leaderboard={leaderboard} />
      </div>
    </div>
  );
};

export default Leaderboard;
