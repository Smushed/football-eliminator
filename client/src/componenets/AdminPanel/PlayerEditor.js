import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Alert = withReactContent(Swal);

const PlayerEditor = ({ season, week, groupId }) => {
  const updateNFLRoster = () => {
    axios.put(`/api/nfldata/updateTeams/${season}`);
  };

  const getMassData = () => {
    Alert.fire({
      type: `warning`,
      title: `Are you sure?`,
      text: `It will take a LONG time`,
      showCancelButton: true,
    }).then(async (result) => {
      if (result.value) {
        Alert.fire(
          `Success`,
          `This will be a while. Go play some games?`,
          `success`
        );
        const response = await axios.get(
          `/nfldata/api/massPlayerUpdate/${season}/`
        );
        console.log(response);
      }
    });
  };

  const getWeeklyData = async () => {
    try {
      await axios.get(`/api/nfldata/updatePlayers/${season}/${week}`);
    } catch (err) {
      console.log(err);
    }
  };

  const rankPlayers = async () => {
    try {
      await axios.get(`/api/nfldata/rankPlayers/${season}/${week}/${groupId}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className='row'>
      <div className='col-12'>
        <button className='btn btn-warning' onClick={() => getMassData()}>
          Mass Update All Players
        </button>
        <br />
        <br />
        <button className='btn btn-secondary' onClick={() => updateNFLRoster()}>
          Update NFL Roster
        </button>
        <br />
        <br />
        <button className='btn btn-secondary' onClick={() => getWeeklyData()}>
          Update Get Weekly Data
        </button>
        <br />
        <br />
        <button className='btn btn-primary' onClick={() => rankPlayers()}>
          Rank Players
        </button>
      </div>
    </div>
  );
};

export default PlayerEditor;
