import { memo, useContext } from 'react';
import PropTypes from 'prop-types';
import loading from '../../constants/SVG/loading.svg';
import { AvatarContext } from '../Avatars';

import './leaderBoardStyle.css';

const Podium = memo(function Podium({ leaderboard }) {
  const { userAvatars } = useContext(AvatarContext);

  return (
    leaderboard.length > 0 && (
      <div className='row justify-content-center d-flex h-100'>
        <div className='row'>
          <div className='col-12 text-center pt-5'>
            <h2>Leaders</h2>
          </div>
        </div>
        <div className='row d-flex align-items-end pb-4'>
          <Stand
            avatar={userAvatars[leaderboard[1].UID]}
            username={leaderboard[1].UN}
            totalScore={leaderboard[1].TS}
            place={2}
          />
          <Stand
            avatar={userAvatars[leaderboard[0].UID]}
            username={leaderboard[0].UN}
            totalScore={leaderboard[0].TS}
            place={1}
          />
          <Stand
            avatar={userAvatars[leaderboard[2].UID]}
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
            <div className='col-12 podiumUsername'>
              {place === 1 ? <h5>{username}</h5> : <>{username}</>}
            </div>
          </div>
          <div className='row'>
            <div className='position-absolute bottom-0'>
              <div className='row'>
                <div className='col-12 fw-bold'>{totalScore}</div>
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
};

export default Podium;
