import React, { useContext, memo } from 'react';
import { Tooltip } from 'react-tooltip';

import { AvatarContext } from '../Avatars';
import BlankAvatar from '../../constants/logoImages/avatar/blankAvatar.png';

const CurrentRosterRow = memo(function CurrentRosterRow({
  player,
  position,
  addDropPlayer,
  pastLockWeek,
}) {
  const { playerAvatars } = useContext(AvatarContext);

  return (
    <tr className='align-middle'>
      <th scope='row' className='rosterPosition'>
        {position}
      </th>
      <td>
        {player &&
          player.mySportsId !== 0 &&
          !pastLockWeek &&
          player.injury && <InjuryCol injury={player.injury} />}
      </td>
      <td>
        {player && (
          <img
            className='playerAvatar'
            src={playerAvatars[player.mySportsId] || BlankAvatar}
          />
        )}
      </td>
      <td>{player && player.name && player.name}</td>
      <td>{player && player.team}</td>
      {pastLockWeek === true ? (
        <td>{player && player.score.toFixed(2)}</td>
      ) : (
        <td className='pb-0'>
          {player && player.mySportsId && addDropPlayer ? (
            <button
              className='custom-button'
              onClick={() =>
                addDropPlayer(player.mySportsId, player.team, 'drop')
              }
            >
              Drop
            </button>
          ) : (
            <></>
          )}
        </td>
      )}
    </tr>
  );
});

const RosterDisplay = memo(function RosterDisplay({
  groupPositions,
  roster,
  addDropPlayer,
  mustDrop,
  pastLockWeek,
  headerText,
  userId,
}) {
  const { userAvatars } = useContext(AvatarContext);

  return (
    <table className='table table-striped table-hover'>
      <thead>
        <tr className='fs-3 text-center'>
          <th scope='col' colSpan={12}>
            {userId && userAvatars[userId] && (
              <img
                src={userAvatars[userId]}
                className='userRosterAvatar me-4'
              />
            )}
            <>{headerText}</>
          </th>
        </tr>
      </thead>
      <tbody>
        {mustDrop
          ? roster.map((player, i) => (
              <CurrentRosterRow
                key={i}
                position={player.position}
                player={player}
                addDropPlayer={addDropPlayer}
                pastLockWeek={pastLockWeek}
              />
            ))
          : groupPositions.map((position, i) => (
              <CurrentRosterRow
                key={i}
                pastLockWeek={pastLockWeek}
                position={position.name}
                player={roster[i]}
                addDropPlayer={addDropPlayer}
              />
            ))}
      </tbody>
    </table>
  );
});

const InjuryCol = ({ injury }) => {
  return (
    <span
      className='injuryCol redText'
      data-tooltip-id='injuryTooltip'
      data-tooltip-html={injury.description}
    >
      <Tooltip id='injuryTooltip' data-tooltip />
      {injury.playingProbability[0]}
    </span>
  );
};

const PlayerDisplayRow = ({ player, addDropPlayer, sortedMatchups }) => {
  const { playerAvatars } = useContext(AvatarContext);
  return (
    <tr className='align-middle playerDisplayRowHeight'>
      <td>{player.injury && <InjuryCol injury={player.injury} />}</td>
      <td>
        <img src={player && playerAvatars[player.mySportsId]} />
      </td>
      <td>{player.name && player.name}</td>
      <td>{player.team && player.team}</td>
      {sortedMatchups && (
        <td className='oppWidth'>
          {sortedMatchups[player.team]
            ? `${sortedMatchups[player.team].home ? 'v' : '@'} ${
                sortedMatchups[player.team].opponent
              }`
            : `BYE`}
        </td>
      )}
      {addDropPlayer && (
        <td className='pb-0'>
          <button
            className='custom-button'
            onClick={() => addDropPlayer(player.mySportsId, player.team, 'add')}
          >
            Add
          </button>
        </td>
      )}
    </tr>
  );
};

const PlayerDisplayTable = ({
  headerText,
  playerList,
  sortedMatchups = null,
  addDropPlayer,
  showInput = false,
  inputValue,
  handleChange,
}) => (
  <>
    <table className='table'>
      <thead>
        <tr className='fs-3 text-center'>
          <th scope='col' colSpan={5}>
            {headerText}
          </th>
        </tr>
      </thead>
    </table>
    {showInput && (
      <div className='row'>
        <div className='col-12'>
          <small htmlFor='playerSearch' className='ps-1 form-label'>
            Player Search:
          </small>
          <div className='playerSearchBox input-group input-group-lg mb-2'>
            <input
              className='form-control'
              name='playerSearch'
              value={inputValue}
              type='text'
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    )}
    <table className='table table-striped table-hover'>
      <tbody>
        {playerList.map((player, i) => (
          <PlayerDisplayRow
            player={player}
            key={i}
            sortedMatchups={sortedMatchups}
            addDropPlayer={addDropPlayer}
          />
        ))}
      </tbody>
    </table>
  </>
);

export { RosterDisplay, PlayerDisplayRow, PlayerDisplayTable };
