import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import loading from '../../constants/SVG/loading.svg';

const Podium = memo(function Podium({ leaderboard }) {
  const [podiumAvatars, updatePodiumAvatars] = useState([]);

  useEffect(() => {
    if (leaderboard && leaderboard.length > 0) {
      getAvatars(leaderboard);
    }
  }, [leaderboard]);

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  const axiosCancel = axios.CancelToken.source();

  const getAvatars = async (leaderboard) => {
    const tempAvatarArray = [];
    for (let i = 0; i < 3; i++) {
      try {
        const avatar = await getPlayerAvatar(leaderboard[i].UID);
        tempAvatarArray.push(avatar);
      } catch (err) {
        console.log('Error pulling avatar for ', leaderboard[i].UN, err);
        tempAvatarArray.push(null);
      }
    }
    updatePodiumAvatars(tempAvatarArray);
  };

  const getPlayerAvatar = (userId) =>
    axios
      .get(`/api/user/avatar/${userId}`, { cancelToken: axiosCancel.token })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });

  return (
    leaderboard.length > 0 && (
      <div className='row h-100 ms-1'>
        <div className='row'>
          <h1 className='col-12 text-center mt-4'>Current Leaders</h1>
        </div>
        <div className='row d-flex align-items-end'>
          <Stand
            avatar={podiumAvatars[1]}
            username={leaderboard[1].UN}
            totalScore={leaderboard[1].TS}
            place={2}
          />
          <Stand
            avatar={podiumAvatars[0]}
            username={leaderboard[0].UN}
            totalScore={leaderboard[0].TS}
            place={1}
          />
          <Stand
            avatar={podiumAvatars[2]}
            username={leaderboard[2].UN}
            totalScore={leaderboard[2].TS}
            place={3}
          />
        </div>
      </div>
    )
  );
});

const Stand = ({ avatar, username, totalScore, place }) => {
  return (
    <div className='col-4 text-center'>
      <div className='row'>
        <div className='col-12'>
          {avatar ? (
            <img
              src={avatar}
              alt={`${place} Place Avatar`}
              className='podiumAvatar mb-1'
            />
          ) : (
            <img src={loading} alt='loading' className='podiumAvatar' />
          )}
        </div>
      </div>
      <div
        className={`row border rounded-top-1 podium${place} position-relative`}
      >
        <div className='col-12'>
          <div className='row'>
            <div className='col-12'>
              {place === 1 ? <h5>{username}</h5> : <>{username}</>}
            </div>
          </div>
          <div className='row'>
            <div className='position-absolute bottom-0'>
              <div className='row'>
                <div className='col-12'>{totalScore}</div>
              </div>
              <div className='col-12 text-center no-gutters'>
                {place === 1 && <h1>🥇</h1>}
                {place === 2 && <h1>🥈</h1>}
                {place === 3 && <h1>🥉</h1>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Podium.propTypes = {
  leaderboard: PropTypes.array,
  // leaderboard: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     username: PropTypes.string,
  //     totalScore: PropTypes.number,
  //   })
  // ),
};

export default Podium;
