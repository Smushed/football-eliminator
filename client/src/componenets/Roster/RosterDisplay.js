import React from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

const CurrentRosterRow = ({ player, position, addDropPlayer, pastLockWeek }) => {
    const showInjury = async () => {
        const playingProb = player.I.PP.toLowerCase();
        Alert.fire({
            title: `${player.N} is ${playingProb} with a ${player.I.D} injury`,
        });
    };
    return (
        <tr>
            <th scope='row' className='rosterPosition'>
                {position}
            </th>
            {player &&
                player.M !== 0 &&
                !pastLockWeek &&
                player.I &&
                <InjuryCol
                    injury={player.I}
                    showInjury={showInjury}
                />
            }
            <td>
                {player && player.N && player.N}
            </td>
            <td>
                {player && player.T}
            </td>
            {pastLockWeek === true ?
                <td>
                    {player && player.SC.toFixed(2)}
                </td>
                :
                player && addDropPlayer &&
                <td>
                    <button className='custom-button' onClick={() => addDropPlayer(player.M, player.T, 'drop')}>
                        Drop
                    </button>
                </td>
            }
        </tr>
    );
};

const PlayerDisplayRow = ({ evenOrOddRow, player, addDropPlayer, sortedMatchups = false }) => (
    <div className={evenOrOddRow === 0 ? 'playerRow' : 'playerRow oddRow'}>
        <div className='playerCol flex'>
            <div className='injuryCol'>
                {player.I &&
                    <InjuryCol
                        injury={player.I}
                    />
                }
            </div>
            {player.N && player.N}
        </div>
        <div className='teamCol'>
            {player.T && player.T}
        </div>
        {sortedMatchups &&
            <div className='posCol'>
                {sortedMatchups[player.T] ?
                    `${sortedMatchups[player.T].h ? 'v' : '@'} ${sortedMatchups[player.T].v}`
                    :
                    `BYE`}
            </div>
        }
        {addDropPlayer &&
            <button className='custom-button' onClick={() => addDropPlayer(player.M, player.T, 'add')}>
                Add
            </button>
        }
    </div>
)

const RosterDisplay = ({ groupPositions, roster, addDropPlayer, mustDrop, pastLockWeek, headerText }) => (
    <table className='table table-striped table-hover'>
        <thead>
            <tr className='fs-3 text-center'>
                <th scope='col' colSpan={5}>
                    {headerText}
                </th>
            </tr>
        </thead>
        <tbody>
            {mustDrop ?
                roster.map((player, i) =>
                    <CurrentRosterRow
                        key={i}
                        position={player.P}
                        player={player}
                        addDropPlayer={addDropPlayer}
                        pastLockWeek={pastLockWeek}
                    />)
                :
                groupPositions.map((position, i) => (
                    <CurrentRosterRow
                        key={i}
                        pastLockWeek={pastLockWeek}
                        position={position.N}
                        player={roster[i]}
                        addDropPlayer={addDropPlayer}
                    />
                ))
            }
        </tbody>
    </table >
)

const InjuryCol = ({ injury, showInjury }) => {
    return <>
        <ReactTooltip />
        <td className='injuryCol redText'
            data-tip={injury.D}
            onClick={showInjury}
        >
            {injury.PP[0]}
        </td>
    </>
};

InjuryCol.propTypes = {
    injury: PropTypes.object,
    showInjury: PropTypes.func
};


RosterDisplay.propTypes = {
    groupPositions: PropTypes.array,
    roster: PropTypes.array,
    addDropPlayer: PropTypes.func,
    mustDrop: PropTypes.bool,
    pastLockWeek: PropTypes.bool,
    headerText: PropTypes.string
};

PlayerDisplayRow.propTypes = {
    evenOrOddRow: PropTypes.number,
    player: PropTypes.object,
    addDropPlayer: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func
    ]),
    sortedMatchups: PropTypes.object
};

CurrentRosterRow.propTypes = {
    mustDrop: PropTypes.bool,
    player: PropTypes.object,
    position: PropTypes.string,
    addDropPlayer: PropTypes.func,
    pastLockWeek: PropTypes.bool
};


InjuryCol.propTypes = {
    injury: PropTypes.object,
    showInjury: PropTypes.func
};

export { RosterDisplay, PlayerDisplayRow };