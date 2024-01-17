import React from 'react';
import PropTypes from 'prop-types';

import './rosterStyle.css';

const WeekSearch = ({
  weekSelect,
  handleChange,
  customSeasonWeekSearch,
  disabled,
}) => (
  <div className='row mt-1 justify-content-center'>
    <div className='col-10 col-md-6'>
      <select
        value={weekSelect}
        type='select'
        name='weekSelect'
        id='weekSelect'
        className='form-select'
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
        <option>18</option>
      </select>
    </div>
    <div className='text-center col-2'>
      <button
        className='btn btn-success'
        onClick={customSeasonWeekSearch}
        disabled={disabled}
      >
        Search
      </button>
    </div>
  </div>
);

const TeamSearch = ({ teamSelect, handleChange, searchByTeam }) => (
  <div className='row mt-1 justify-content-center'>
    <div className='col-8'>
      <select
        value={teamSelect}
        type='select'
        name='teamSelect'
        className='form-select searchDropdown'
        onChange={handleChange}
      >
        <option>ARI</option>
        <option>ATL</option>
        <option>BAL</option>
        <option>BUF</option>
        <option>CAR</option>
        <option>CHI</option>
        <option>CIN</option>
        <option>CLE</option>
        <option>DAL</option>
        <option>DEN</option>
        <option>DET</option>
        <option>GB</option>
        <option>HOU</option>
        <option>IND</option>
        <option>JAX</option>
        <option>KC</option>
        <option>LAC</option>
        <option>LA</option>
        <option>MIA</option>
        <option>MIN</option>
        <option>NE</option>
        <option>NO</option>
        <option>NYG</option>
        <option>NYJ</option>
        <option>OAK</option>
        <option>PHI</option>
        <option>PIT</option>
        <option>SEA</option>
        <option>SF</option>
        <option>TB</option>
        <option>TEN</option>
        <option>WAS</option>
      </select>
    </div>
    <div className='text-center col-2'>
      <button className='btn btn-success submitButton' onClick={searchByTeam}>
        Search
      </button>
    </div>
  </div>
);

const PositionSearch = ({
  positionSelect,
  handleChange,
  disabled,
  positionSearch,
}) => (
  <div className='row mt-1 justify-content-center'>
    <div className='col-8'>
      <select
        value={positionSelect}
        type='select'
        name='positionSelect'
        className='form-select'
        onChange={handleChange}
      >
        <option>QB</option>
        <option>RB</option>
        <option>WR</option>
        <option>TE</option>
      </select>
    </div>
    <div className='text-center col-2'>
      <button
        className='btn btn-success'
        onClick={positionSearch}
        disabled={disabled}
      >
        Search
      </button>
    </div>
  </div>
);

WeekSearch.propTypes = {
  weekSelect: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleChange: PropTypes.func,
  customSeasonWeekSearch: PropTypes.func,
  disabled: PropTypes.bool,
};

TeamSearch.propTypes = {
  teamSelect: PropTypes.string,
  handleChange: PropTypes.func,
  searchByTeam: PropTypes.func,
};

PositionSearch.propTypes = {
  positionSelect: PropTypes.string,
  handleChange: PropTypes.func,
  disabled: PropTypes.bool,
  positionSearch: PropTypes.func,
};

export { PositionSearch, TeamSearch, WeekSearch };
