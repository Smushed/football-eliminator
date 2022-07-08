import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import * as Routes from "../../constants/routes";
import { compose } from "recompose";
import PropTypes from "prop-types";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

const UpdateWeek = ({ history }) => {
  const [dbPass, setDbPass] = useState(``);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [lockWeek, setLockWeek] = useState(0);
  const [season, setSeason] = useState(`2021-2022-regular`);

  const updateWeekSeason = async () => {
    if (dbPass === ``) {
      handleWrongPass(`No!`);
      return;
    }
    try {
      const response = await axios.put(
        `/api/updateWeekSeason/${dbPass}/${season}/${currentWeek}/${lockWeek}`
      );
      await Alert.fire(response.data);
    } catch (err) {
      this.handleWrongPass(`Get Outta Here!`);
    }
    setDbPass(``);
  };

  const handleWrongPass = async (message) => {
    await Alert.fire({
      type: "error",
      title: message,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "X",
    });
    history.push(Routes.home);
  };

  const handleChange = (e) => {
    e.target.name === "currentWeek" && setCurrentWeek(e.target.value);
    e.target.name === "lockWeek" && setLockWeek(e.target.value);
    e.target.name === "season" && setSeason(e.target.value);
    e.target.name === "dbPass" && setDbPass(e.target.value);
  };

  return (
    <div>
      Don&apos;t enter this if you don&apos;t know!
      <div>
        Current Week
        <select value={currentWeek} onChange={handleChange} name="currentWeek">
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={7}>7</option>
          <option value={8}>8</option>
          <option value={9}>9</option>
          <option value={10}>10</option>
          <option value={11}>11</option>
          <option value={12}>12</option>
          <option value={13}>13</option>
          <option value={14}>14</option>
          <option value={15}>15</option>
          <option value={16}>16</option>
          <option value={17}>17</option>
        </select>
      </div>
      <div>
        Lock Week
        <select value={lockWeek} onChange={handleChange} name="lockWeek">
          <option value={0}>0</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={7}>7</option>
          <option value={8}>8</option>
          <option value={9}>9</option>
          <option value={10}>10</option>
          <option value={11}>11</option>
          <option value={12}>12</option>
          <option value={13}>13</option>
          <option value={14}>14</option>
          <option value={15}>15</option>
          <option value={16}>16</option>
          <option value={17}>17</option>
        </select>
      </div>
      <div>
        <select value={season} onChange={handleChange} name="season">
          <option value="2020-2021-regular">2020-2021-regular</option>
          <option value="2021-2022-regular">2021-2022-regular</option>
        </select>
      </div>
      <div>
        <input
          type="text"
          value={dbPass}
          name="dbPass"
          onChange={handleChange}
        />
      </div>
      <div>
        <button className="btn btn-info" onClick={() => updateWeekSeason()}>
          Submit
        </button>
      </div>
    </div>
  );
};

UpdateWeek.propTypes = {
  history: PropTypes.any,
};

export default compose(withRouter)(UpdateWeek);
