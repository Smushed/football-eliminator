import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayerDisplayRow } from '../Roster/RosterDisplay';
import { withAuthorization } from '../Session';
import PropTypes from 'prop-types';

import { loading, doneLoading } from '../LoadingAlert';
import * as Routes from '../../constants/routes';
import './usedPlayerStyle.css';

const UsedPlayers = ({ match, season, history, noGroup }) => {
    const [usedPlayers, updateUsedPlayers] = useState({});
    const [usernameOfPage, updateUsernameOfPage] = useState(``);

    const axiosCancel = axios.CancelToken.source();

    useEffect(() => {
        if (noGroup) { history.push(Routes.groupPage); return; }
        if (season !== '') {
            getUsedPlayers();
            updateUsernameOfPage(match.params.username);
        }

        return function cancelAPICalls() {
            if (axiosCancel) {
                axiosCancel.cancel(`Unmounted`);
            }
        }
    }, [season, match.params.username])

    const getUsedPlayers = () => {
        loading(true);
        axios.get(`/api/players/used/${match.params.username}/${season}/${match.params.groupname}`, { cancelToken: axiosCancel })
            .then(res => {
                updateUsedPlayers(res.data);
                doneLoading();
            }).catch(err => {
                if (err.message !== `Unmounted`) { console.log(err); }
            });
    };

    const positions = [`QB`, `RB`, `WR`, `TE`, `K`, `D`];
    return (
        <div>
            <div className='centerText titleMargin headerFont'>
                {usernameOfPage}&apos;s Used Players
            </div>
            {positions.map(position => (
                <div key={position}>
                    {usedPlayers[position] &&
                        <div className='usedPosition'>
                            <div className='sectionHeader'>
                                {position}
                            </div>
                            {usedPlayers[position].map((player, i) => (
                                <PlayerDisplayRow player={player} key={i} evenOrOddRow={i % 2} />
                            ))}
                        </div>
                    }
                </div>
            ))}
        </div>
    )
}

UsedPlayers.propTypes = {
    match: PropTypes.any,
    season: PropTypes.string,
    history: PropTypes.object,
    noGroup: PropTypes.bool
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(UsedPlayers);