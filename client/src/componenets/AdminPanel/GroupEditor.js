import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const GroupEditor = ({ season, week }) => {
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    pullGroupList();
  }, []);

  const pullGroupList = async () => {
    try {
      const dbResponse = await axios.get(`/api/group/list`);
      setGroupList(dbResponse.data);
    } catch (err) {
      console.log(err);
    }
  };

  const selectGroup = async (groupId) => {
    setSelectedGroup(groupId);
  };

  const getScoresForGroup = async () => {
    if (selectedGroup === "") {
      return;
    }
    const dbResponse = await axios.put(
      `/api/calculateScore/${selectedGroup}/${season}/${week}`
    );
    console.log(dbResponse.data);
  };

  return (
    <div>
      {selectedGroup}
      <br />
      <br />
      <button className="btn btn-success" onClick={() => getScoresForGroup()}>
        Pull Scores
      </button>
      {groupList.map((group) => (
        <div key={group.id}>
          {group.N}{" "}
          <button
            className="btn btn-info"
            onClick={() => selectGroup(group.id)}
          >
            Select
          </button>
        </div>
      ))}
    </div>
  );
};

GroupEditor.propTypes = {
  season: PropTypes.string,
  week: PropTypes.number,
};

export default GroupEditor;
