import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PlayerDisplayRow } from '../RosterDisplay';

import { loading, doneLoading } from '../../Tools/LoadingAlert';
import Session from '../../../contexts/Firebase/Session';
import { CurrentUserContext } from '../../../contexts/CurrentUser';
import { NFLScheduleContext } from '../../../contexts/NFLSchedule';
import { useParams } from 'react-router-dom';

const UsedPlayers = () => {
  const [usedPlayers, updateUsedPlayers] = useState({});
  const [usernameOfPage, updateUsernameOfPage] = useState(``);

  const axiosCancel = axios.CancelToken.source();

  const params = useParams();

  const { currentUser } = useContext(CurrentUserContext);
  const { currentNFLTime } = useContext(NFLScheduleContext);

  useEffect(() => {
    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, []);

  useEffect(() => {
    if (currentNFLTime.season !== '') {
      getUsedPlayers();
      updateUsernameOfPage(params.username);
    }
  }, [currentNFLTime.season, params.username, currentUser.grouplist]);

  const getUsedPlayers = () => {
    loading(true);
    axios
      .get(
        `/api/players/used/${params.username}/${currentNFLTime.season}/${params.groupname}`,
        { cancelToken: axiosCancel }
      )
      .then((res) => {
        updateUsedPlayers(res.data);
        doneLoading();
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const positions = [`QB`, `RB`, `WR`, `TE`, `K`, `D`];
  return (
    <div>
      <div>{usernameOfPage}&apos;s Used Players</div>
      {positions.map((position) => (
        <div key={position}>
          {usedPlayers[position] && (
            <div>
              <div>{position}</div>
              {usedPlayers[position].map((player, i) => (
                <PlayerDisplayRow
                  player={player}
                  key={i}
                  evenOrOddRow={i % 2}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Session(UsedPlayers);
