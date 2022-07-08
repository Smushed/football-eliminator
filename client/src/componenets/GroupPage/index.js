import React, { useState, useEffect } from "react";
import { withAuthorization } from "../Session";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import ReactTooltip from "react-tooltip";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import "./groupStyle.css";
import * as Routes from "../../constants/routes";

const Alert = withReactContent(Swal);

const GroupPage = ({
  history,
  email,
  pullUserData,
  userId,
  noGroup,
  season,
}) => {
  const [groupList, updateGroupList] = useState([]);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    if (noGroup) {
      welcomeModal();
    }
    getGroupList();

    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, [noGroup]);

  const welcomeModal = () => {
    Alert.fire({
      type: `success`,
      title: `Welcome to the Eliminator!`,
      html: `Here we play fantasy football with a twist:
            <br />
            <br />
            - Each week set a lineup while having access to every offensive player in the NFL. 
            <br />
            - But, you can only play each player one time per season. 
            <br />
            <br />
            Join a group or create one to begin filling out your roster.`,
    });
  };

  const getGroupList = async () => {
    axios
      .get(`/api/group/list`, { cancelToken: axiosCancel.token })
      .then((res) => updateGroupList(res.data))
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const joinGroup = (groupId) => {
    axios
      .put(`/api/group/join/`, {
        userId,
        groupId,
      })
      .then(() => {
        pullUserData(email).then(() => {
          history.push(Routes.home);
        });
      });
  };

  return (
    <div className="container">
      <div className="row">
        <h2 className="col-12 text-center header mt-3">Active Groups</h2>
      </div>
      <div className="row">
        <div className="text-muted col-12 text-center">
          Not seeing a group that interests you?
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12 text-center">
          <Link to={`/group/create`}>
            <button className="btn btn-outline-success btn-sm">
              Create Group
            </button>
          </Link>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          {groupList.map((group) => (
            <GroupRow
              season={season}
              key={group.id}
              group={group}
              joinGroup={joinGroup}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const GroupRow = ({ group, joinGroup, season, userId }) => {
  const [groupAvatar, updateGroupAvatar] = useState([]);
  const [topScore, updateTopScore] = useState(0);
  const [ulTooltip, updateULTooltip] = useState(``);
  const [isInGroup, updateIsInGroup] = useState(false);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    getAvatar(group.id);
    getTopScore(group.id, season);
    BuildULTooltip(group.UL);
    if (group.UL.length >= 1 && userId) {
      checkInGroup(userId);
    }

    return function cancelAPICalls() {
      if (axiosCancel) {
        axiosCancel.cancel(`Unmounted`);
      }
    };
  }, [group.id, group.UL, season, userId]);

  const getAvatar = (groupId) => {
    axios
      .get(`/api/avatar/${groupId}`, { cancelToken: axiosCancel.token })
      .then((res) => {
        updateGroupAvatar(res.data);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const getTopScore = (groupId, season) => {
    axios
      .get(`/api/group/topScore/${groupId}/${season}`, {
        cancelToken: axiosCancel.token,
      })
      .then((res) => {
        updateTopScore(res.data.TS);
      })
      .catch((err) => {
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const BuildULTooltip = (userList) => {
    let ulTooltip = ``;
    for (const user of userList) {
      ulTooltip += `${user.UN}<br/>`;
    }
    updateULTooltip(ulTooltip);
  };

  const checkInGroup = (uId) => {
    const userInGroup = group.UL.find((user) => user._id === uId);
    updateIsInGroup(!userInGroup);
  };

  const firstAdmin = group.UL.find((user) => user.A === true);

  return (
    <div className="row border rounded mt-3">
      <ReactTooltip html={true} />
      <div className="col-sm-12 col-md-2 m-2">
        <div className="row d-flex justify-content-center">
          <div className="col-5 col-md-12">
            <img
              alt={`${group.N} Avatar`}
              className="smallImg"
              src={groupAvatar}
            />
          </div>
          <div className="col-6 d-md-none">
            <Link to={`/profile/group/${group.N}`} className="link-dark">
              <h4>{group.N}</h4>
            </Link>
          </div>
        </div>
      </div>
      <div className="col-sm-12 col-md-9">
        <div className="row">
          <div className="d-none d-md-block col-12 text-center">
            <Link to={`/profile/group/${group.N}`} className="link-dark">
              <h4>{group.N}</h4>
            </Link>
          </div>
        </div>
        <div className="row">
          <h6 className="col-12 col-md-6 text-center text-md-start">
            {group.D}
          </h6>
          <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-6 col-md-12">
                <div className="row">
                  <div className="col-6">
                    <strong>Admin:</strong>
                  </div>
                  <div className="col-6">{firstAdmin && firstAdmin.UN}</div>
                  <div className="col-6" data-tip={ulTooltip}>
                    <strong>Users:</strong>
                  </div>
                  <div className="col-6" data-tip={ulTooltip}>
                    {group.UL.length}
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-12">
                <div className="row">
                  <div className="col-6">
                    <strong>Top Score:</strong>
                  </div>
                  <div className="col-6">{topScore && topScore.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4 text-center">
            {isInGroup && (
              <button
                className="btn btn-outline-primary mb-2 btn-sm"
                onClick={() => joinGroup(group.id)}
              >
                Join
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

GroupPage.propTypes = {
  history: PropTypes.any,
  email: PropTypes.string,
  pullUserData: PropTypes.func,
  season: PropTypes.string,
  noGroup: PropTypes.bool,
  userId: PropTypes.string,
};

GroupRow.propTypes = {
  group: PropTypes.object,
  joinGroup: PropTypes.func,
  season: PropTypes.string,
  userId: PropTypes.string,
};

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(GroupPage);
