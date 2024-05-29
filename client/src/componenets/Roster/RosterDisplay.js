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
        {player && player.M !== 0 && !pastLockWeek && player.I && (
          <InjuryCol injury={player.I} />
        )}
      </td>
      <td>
        {player && (
          <img
            className='playerAvatar'
            src={playerAvatars[player.M] || BlankAvatar}
          />
        )}
      </td>
      <td>{player && player.N && player.N}</td>
      <td>{player && player.T}</td>
      {pastLockWeek === true ? (
        <td>{player && player.SC.toFixed(2)}</td>
      ) : (
        <td className='pb-0'>
          {player && player.M && addDropPlayer ? (
            <button
              className='custom-button'
              onClick={() => addDropPlayer(player.M, player.T, 'drop')}
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
                position={player.P}
                player={player}
                addDropPlayer={addDropPlayer}
                pastLockWeek={pastLockWeek}
              />
            ))
          : groupPositions.map((position, i) => (
              <CurrentRosterRow
                key={i}
                pastLockWeek={pastLockWeek}
                position={position.N}
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
      data-tooltip-html={injury.D}
    >
      <Tooltip id='injuryTooltip' data-tooltip />
      {injury.PP[0]}
    </span>
  );
};

const PlayerDisplayRow = ({ player, addDropPlayer, sortedMatchups }) => {
  const { playerAvatars } = useContext(AvatarContext);
  return (
    <tr className='align-middle playerDisplayRowHeight'>
      <td>{player.I && <InjuryCol injury={player.I} />}</td>
      <td>
        <img src={player && playerAvatars[player.M]} />
      </td>
      <td>{player.N && player.N}</td>
      <td>{player.T && player.T}</td>
      {sortedMatchups && (
        <td className='oppWidth'>
          {sortedMatchups[player.T]
            ? `${sortedMatchups[player.T].h ? 'v' : '@'} ${
                sortedMatchups[player.T].v
              }`
            : `BYE`}
        </td>
      )}
      {addDropPlayer && (
        <td className='pb-0'>
          <button
            className='custom-button'
            onClick={() => addDropPlayer(player.M, player.T, 'add')}
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
