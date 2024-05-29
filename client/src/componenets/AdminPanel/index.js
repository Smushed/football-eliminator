import React, { useState, useEffect } from 'react';
import * as Routes from '../../constants/routes';
import axios from 'axios';
import Session from '../Session';

import PlayerEditor from './PlayerEditor';
import GroupEditor from './GroupEditor';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Alert = withReactContent(Swal);

const AdminPanel = ({ currentUser, season, week, groupId }) => {
  const [playerEditor, setPlayerEditor] = useState(false);
  const [groupEditor, setGroupEditor] = useState(false);
  const [weekSelect, setWeekSelect] = useState(`1`);
  const [seasonSelect, setSeasonSelect] = useState(``);
  const [adminPass, setAdminPass] = useState(``);

  useEffect(() => {
    setSeasonSelect(season);
  }, [season]);

  useEffect(() => {
    setWeekSelect(week);
  }, [week]);

  useEffect(() => {
    checkAdminStatus(currentUser);
  }, [currentUser.isAdmin]);

  const checkAdminStatus = (currentUser) => {
    if (currentUser.isAdmin === false) {
      this.props.history.push(Routes.home);
    }
  };

  const showPlayerEditor = () => {
    setPlayerEditor(true);
    setGroupEditor(false);
  };

  const showGroupEditor = () => {
    setPlayerEditor(false);
    setGroupEditor(true);
  };

  const getMatchups = async () => {
    const dbResponse = await axios.post(
      `/api/nfldata/pullMatchUpsForDB/${seasonSelect}/${weekSelect}`
    );
    console.log(dbResponse);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    name === `seasonSelect` && setSeasonSelect(value);
    name === `weekSelect` && setWeekSelect(value);
    name === `adminPass` && setAdminPass(value);
  };

  const tryKillDB = () => {
    axios
      .post(`/api/user/purgeUserAndGroupDB/${adminPass}`)
      .then((res) => console.log(res))
      .catch(
        async (err) =>
          await Alert.fire({
            title: `Really? Get outta here!`,
            type: `error`,
            showConfirmButton: false,
          })
      );
  };

  return currentUser.isAdmin ? (
    <div className='container-fluid'>
      <div className='row'>
        <div className='col-12 col-md-3 form-group'>
          <div className='row'>
            <div className='col-12 mt-3 mb-3 text-center'>
              <input
                className='form-control'
                value={adminPass}
                onChange={handleChange}
                name='adminPass'
              />
              <button
                className='btn btn-primary mt-1'
                onClick={() => tryKillDB()}
              >
                Nuke the DB
              </button>
            </div>
          </div>
          <label htmlFor='seasonSelect'>Select Season</label>
          <select
            className='form-select'
            value={seasonSelect}
            type='select'
            name='seasonSelect'
            onChange={handleChange}
          >
            <option>2019-2020-regular</option>
            <option>2020-2021-regular</option>
            <option>2021-2022-regular</option>
          </select>

          <label htmlFor='weekSelect'>Select Week</label>
          <select
            className='form-select'
            value={weekSelect}
            type='select'
            name='weekSelect'
            onChange={handleChange}
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option>11</option>
            <option>12</option>
            <option>13</option>
            <option>14</option>
            <option>15</option>
            <option>16</option>
            <option>17</option>
          </select>
          <br />
          <br />
          <button
            className='btn btn-primary'
            onClick={() => showPlayerEditor()}
          >
            Player Editor
          </button>
          <br />
          <br />
          <button className='btn btn-primary' onClick={() => showGroupEditor()}>
            Group Editor
          </button>
          <br />
          <br />
          <button className='btn btn-primary' onClick={() => getMatchups()}>
            Get Matchups
          </button>
        </div>
        <div className='col-sm-12 col-md-9'>
          {playerEditor && (
            <PlayerEditor
              week={weekSelect}
              season={seasonSelect}
              groupId={groupId}
            />
          )}
          {groupEditor && (
            <GroupEditor week={weekSelect} season={seasonSelect} />
          )}
        </div>
      </div>
    </div>
  ) : (
    <div>
      {/* IF the user is not an admin, return a blank div so they can't see anything */}
    </div>
  );
};

export default Session(AdminPanel);
