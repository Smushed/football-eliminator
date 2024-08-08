import { memo, useContext } from 'react';
import loading from '../../constants/SVG/loading.svg';
import { AvatarContext } from '../Avatars';

const Podium = memo(function Podium({ leaderboard }) {
  const { userAvatars } = useContext(AvatarContext);

  return (
    leaderboard.length > 0 && (
      <div className='row justify-content-center d-flex h-100'>
        <div className='row align-items-end pb-4 justify-content-evenly'>
          <Stand
            avatar={userAvatars[leaderboard[1].userId]}
            username={leaderboard[1].username}
            totalScore={leaderboard[1].totalScore}
            place={2}
          />
          <Stand
            avatar={userAvatars[leaderboard[0].userId]}
            username={leaderboard[0].username}
            totalScore={leaderboard[0].totalScore}
            place={1}
          />
          <Stand
            avatar={userAvatars[leaderboard[2].UuserIdID]}
            username={leaderboard[2].username}
            totalScore={leaderboard[2].totalScore}
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
        className={`row border border-black rounded-top-1 podium${place} position-relative`}
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

export default Podium;
