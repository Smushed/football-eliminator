const db = require(`../models`);
const s3Handler = require(`./s3Handler`);
const positions = require(`../constants/positions`);
const mySportsHandler = require(`./mySportsHandler`);

const checkDuplicate = async (checkedField, groupToSearch, userID) => {
  let result = false;
  let searched;
  switch (checkedField) {
    case `group`:
      try {
        searched = await db.Group.findOne({ N: groupToSearch }).exec();
        //If there is a group with that name return true
        if (searched !== null) {
          result = true;
        }
      } catch (err) {
        console.log(err);
      }
      break;
    case `userlist`:
      //Grabs the group that the user is looking to add the user to
      try {
        searched = await db.Group.findById(groupToSearch);
      } catch (err) {
        console.log(err);
      }
      try {
        const isInGroup = await searched.UL.filter(
          (user) => user._id === userID
        );
        if (isInGroup.length > 0) {
          result = true;
        }
      } catch (err) {
        console.log(err);
      }
      break;
    case `userScore`:
      try {
        searched = await db.UserScores.findOne({
          U: userID,
          G: groupToSearch,
        }).exec();
        if (searched !== null) {
          result = true;
        }
      } catch (err) {
        console.log(err);
      }
      break;
  }
  return result;
};

const updateUserScore = async (groupId, season, prevWeek, week) => {
  return new Promise(async (res) => {
    const group = await db.Group.findById([groupId]).exec();
    for (const user of group.UL) {
      createUserScore(user.ID, season, groupId);
    }
    res(
      await db.UserScores.find(
        { G: groupId, S: season },
        `U ${prevWeek} ${week} TS`
      ).exec()
    );
  });
};

const getUserScoreList = async (groupId, season, prevWeek, week) => {
  const userScores = await db.UserScores.find(
    { G: groupId, S: season },
    `U ${prevWeek} ${week} TS`
  ).exec();
  if (userScores.length === 0) {
    return await updateUserScore(groupId, season, prevWeek, week);
  } else {
    return userScores;
  }
};

const createGroupRoster = async (groupId, rosterSpots) => {
  const dbResponse = db.GroupRoster.create({ G: groupId, P: rosterSpots });
  return dbResponse;
};

const createGroupScore = (groupId, groupScore) => {
  const { P, RU, RE, F, FG } = groupScore;
  db.GroupScore.create({ G: groupId, P, RU, RE, F, FG });
};

const createUserScore = async (userId, season, groupId) => {
  const checkDupeUser = await checkDuplicate(`userScore`, userId, groupId);
  if (!checkDupeUser) {
    await db.UserScores.create({ U: userId, G: groupId, S: season });
  }
  return;
};

const getTopScorerForWeek = (userScores, week) => {
  userScores.sort((a, b) => b[week] - a[week]);
  const topWeekScore = userScores.shift();
  return topWeekScore;
};

const getTopScoreForWeek = (userScores) => {
  userScores.sort((a, b) => b.TS - a.TS);
  const topWeekScore = userScores.shift();
  return topWeekScore;
};

const findOneRoster = (userId, week, season, groupId) => {
  return db.UserRoster.findOne(
    { U: userId, W: week, S: season, G: groupId },
    { R: 1 }
  )
    .exec()
    .clone();
};

const findOneUserById = (userId) => {
  return db.User.findById(userId, { UN: 1 }).exec();
};

const groupUpdater = {
  groupScore: async (group, field) => {
    //If the user left just a negative sign in there take it out and add a zero
    const fields = Object.keys(field);
    for (let i = 0; i < fields.length; i++) {
      const innerFields = Object.keys(field[fields[i]]);
      for (let ii = 0; ii < innerFields.length; ii++) {
        if (field[fields[i]][innerFields[ii]] === `-`) {
          field[fields[i]][innerFields[ii]] = 0;
        }
      }
    }
    try {
      await db.GroupScore.findOneAndUpdate(
        { G: group._id },
        { P: field.P, RU: field.RU, RE: field.RE, FG: field.FG, F: field.F }
      );
    } catch {
      return `Group Score Error`;
    }
    return false;
  },
  groupDesc: async (group, field) => {
    group.D = field;
    try {
      await group.save();
    } catch {
      return `Group Desc Error`;
    }
    return false;
  },
  groupName: async (group, field) => {
    group.N = field;
    try {
      await group.save();
    } catch {
      return `Group Name Error`;
    }
    return false;
  },
  groupPos: async (group, field) => {
    try {
      await db.GroupRoster.findOneAndUpdate({ G: group._id }, { P: field });
    } catch {
      return `Group Position Error`;
    }
    return false;
  },
  groupAvatar: async (group, field) => {
    s3Handler.uploadAvatar(group.id.toString(), field);
    return false;
  },
};

module.exports = {
  createGroup: async (
    userId,
    newGroupScore,
    groupName,
    groupDesc,
    groupPositions
  ) => {
    const dupe = await checkDuplicate('group', groupName);
    if (dupe) {
      return false;
    }
    const newGroup = {
      N: groupName,
      D: groupDesc,
    };
    const newGroupFromDB = await db.Group.create(newGroup);
    createGroupRoster(newGroupFromDB._id, groupPositions);
    createGroupScore(newGroupFromDB._id, newGroupScore);
    //Add the new group to the user who created it
    await db.User.findByIdAndUpdate([userId], {
      $push: { GL: newGroupFromDB._id },
    }); //Also saved the group that the user just added to their profile

    return newGroupFromDB;
  },
  // Invite other users to the group
  addUser: async (addedUserID, groupId, isAdmin = false) => {
    //Checks if the user is already added to the group and returns 500 if they are
    const isDuplicate = await checkDuplicate(`userlist`, groupId, addedUserID);

    if (isDuplicate) {
      return 500;
    }

    const newUserForGroup = {
      A: isAdmin,
      B: false,
      ID: addedUserID,
    };

    //get the user ID, add them to the array userlist within the group
    const groupDetail = await db.Group.findByIdAndUpdate(
      groupId,
      { $push: { UL: newUserForGroup } },
      { new: true }
    );
    const dbResponse = await db.SeasonAndWeek.find({}).exec();
    await createUserScore(addedUserID, dbResponse[0].S, groupId);

    return groupDetail;
  },
  getGroupData: async (groupName) => {
    const groupData = await db.Group.findOne({ N: groupName })
      .collation({ locale: `en_US`, strength: 2 })
      .exec();
    return groupData;
  },
  getGroupDataById: async (groupId) => {
    const groupData = await db.Group.findById([groupId]).exec();
    return groupData;
  },
  getLeaderBoard: async (groupId, season, week) => {
    const arrayForLeaderBoard = [];
    const weekAccessor = (week === 1 ? 1 : week - 1).toString();
    const userScoreList = await getUserScoreList(
      groupId,
      season,
      weekAccessor,
      week
    );
    for (const user of userScoreList) {
      const { UN } = await db.User.findById(user.U);
      const filledOutUser = {
        UID: user.U,
        TS: user.TS,
        UN,
        CW: user[week],
        LW: user[weekAccessor],
      };
      arrayForLeaderBoard.push(filledOutUser);
    }
    arrayForLeaderBoard.sort((a, b) => b.TS - a.TS);
    return arrayForLeaderBoard;
  },
  createClapper: async function () {
    //TODO Break this out to use the Create Group function above. Just not sure about the mod part
    //If there is no Dupe general group we are good to go ahead and add it
    if (!checkDuplicate('group', 'Clapper')) {
      return false;
    }
    const clapper = {
      N: `Clapper`,
      D: `Everyone competing for the Clapper`,
    };
    const clapperFromDB = await db.Group.create(clapper);
    this.createGroupRoster(clapperFromDB._id);
    this.createGroupScore(clapperFromDB._id);
    return `working`;
  },
  findGroupIdByName: async (groupname) => {
    const foundGroup = await db.Group.findOne({ N: groupname })
      .collation({ locale: `en_US`, strength: 2 })
      .exec();
    return foundGroup._id;
  },
  createGeneralGroupRoster: async (groupId) => {
    const dbResponse = db.GroupRoster.create({ G: groupId });
    return dbResponse;
  },
  getGroupPositions: async (groupId) => {
    try {
      const dbResponse = await db.GroupRoster.findOne({ G: groupId });
      return dbResponse.P;
    } catch (err) {
      console.log(`Error: ${err}`);
      return Error('Cannot Find Group Positions');
    }
  },
  groupPositionsForDisplay: async (rawPositionData) => {
    const positionsToDisplay = [false, false, false, false, false, false]; //QB, RB, WR, TE, K, D
    for (const position of rawPositionData) {
      if (position.I === 0) {
        positionsToDisplay[0] = true;
      } else if (position.I === 1) {
        positionsToDisplay[1] = true;
      } else if (position.I === 2) {
        positionsToDisplay[2] = true;
      } else if (position.I === 3) {
        positionsToDisplay[3] = true;
      } else if (position.I === 4) {
        positionsToDisplay[4] = true;
      } else if (position.I === 5) {
        positionsToDisplay[5] = true;
      } else if (position.I === 6) {
        positionsToDisplay[1] = true;
        positionsToDisplay[2] = true;
      } else if (position.I === 7) {
        positionsToDisplay[1] = true;
        positionsToDisplay[2] = true;
        positionsToDisplay[3] = true;
      } else if (position.I === 8) {
        positionsToDisplay[0] = true;
        positionsToDisplay[1] = true;
        positionsToDisplay[2] = true;
        positionsToDisplay[3] = true;
      }
    }
    return positionsToDisplay;
  },
  getGroupScore: async (groupId) => {
    const dbResponse = await db.GroupScore.findOne({ G: groupId });
    return dbResponse;
  },
  mapGroupPositions: async (groupPositions, positionMap) => {
    const groupMap = [];
    for (const position of groupPositions) {
      groupMap.push(positionMap[position.I]);
    }
    return groupMap;
  },
  getGroupList: async () => {
    const filledData = [];
    const groupResponse = await db.Group.find();

    for (let i = 0; i < groupResponse.length; i++) {
      filledData[i] = {
        N: groupResponse[i].N,
        D: groupResponse[i].D,
        id: groupResponse[i]._id,
        UL: [],
      };
      for (let ii = 0; ii < groupResponse[i].UL.length; ii++) {
        const user = await db.User.findById(groupResponse[i].UL[ii].ID, 'UN');
        if (user) {
          filledData[i].UL.push({
            UN: user.UN,
            A: groupResponse[i].UL[ii].A,
            _id: user._id.toString(),
          });
        }
      }
    }
    return filledData;
  },
  getIdealRoster: async function (groupId, season, week) {
    return new Promise(async (res) => {
      const idealRosterResponse = await db.IdealRoster.findOne({
        G: groupId,
        S: season,
        W: week,
      }).exec();
      if (idealRosterResponse === null) {
        let newIdealRoster = new db.IdealRoster({
          G: groupId,
          S: season,
          W: week,
        });
        try {
          const updatedIdealRoster = await this.updateIdealRoster(
            groupId,
            season,
            week,
            newIdealRoster
          );
          res(updatedIdealRoster);
        } catch (err) {
          res(Error('Ideal Roster could not be created!'));
        }
      } else {
        res(idealRosterResponse);
      }
    });
  },
  updateAllIdealRosters: async function (season, week) {
    const allGroups = await this.getAllGroups();
    for (const group of allGroups) {
      let idealRoster = await db.IdealRoster.findOne({
        G: group._id,
        S: season,
        W: week,
      }).exec();
      if (!idealRoster) {
        idealRoster = new db.IdealRoster({ G: group._id, S: season, W: week });
      }
      this.updateIdealRoster(group._id, season, week, idealRoster);
    }
  },
  updateIdealRoster: function (groupId, season, week, idealRoster) {
    return new Promise((res) =>
      Promise.all([
        this.getGroupScore(groupId),
        this.getGroupPositions(groupId),
      ]).then(async ([groupScore, groupPositions]) => {
        if (groupPositions.length === 0 || !groupPositions) {
          return Error('Group Positions not found!');
        }

        Promise.all([
          mySportsHandler.rankPlayers(season, week, groupScore, false),
          this.mapGroupPositions(groupPositions, positions.positionMap),
        ]).then(async ([rankedPlayers, groupPositionMap]) => {
          const idealArray = [];
          for (const possiblePositions of groupPositionMap) {
            const highScorers = [];
            for (const positionVal of possiblePositions) {
              const topScorer =
                rankedPlayers[positions.positionArray[positionVal]].shift();
              highScorers.push(topScorer);
            }

            if (highScorers.length === 1) {
              idealArray.push({
                M: highScorers[0].M,
                SC: highScorers[0].score,
              });
            } else {
              highScorers.sort((a, b) => {
                return b.score - a.score;
              });
              idealArray.push({
                M: highScorers[0].M,
                SC: highScorers[0].score,
              });
            }
          }
          idealRoster.R = idealArray;
          idealRoster.save();

          res(idealRoster);
        });
      })
    );
  },
  getBlankRoster: async function (groupId) {
    const groupPositions = await this.getGroupPositions(groupId);
    if (!groupPositions) {
      return [{ M: 0, P: 'QB', SC: 0 }];
    }
    const blankRoster = groupPositions.map((position) => ({
      M: 0,
      P: position.N,
      SC: 0,
    }));
    return blankRoster;
  },
  getBestRoster: async function (groupId, season, week, userScores) {
    const lastWeek = (week - 1).toString();
    const scoresCopy = [...userScores];
    const topWeekScore = await getTopScorerForWeek(scoresCopy, lastWeek);
    //Doing this here because rosterHandler.js doesn't want to be exported to any other file for some reason
    const topUserRoster = await findOneRoster(
      topWeekScore.U,
      lastWeek,
      season,
      groupId
    );
    if (!topUserRoster) {
      return null;
    }
    const foundUser = await findOneUserById(topWeekScore.U);
    const R = await mySportsHandler.fillUserRoster(topUserRoster.R);
    return { R, U: foundUser.UN }; //Short hand for roster and user
  },
  getCurrAndLastWeekScores: async (groupId, season, week) => {
    const weekAccessor = (week === 1 ? 1 : week - 1).toString();
    return await getUserScoreList(groupId, season, weekAccessor, week);
  },
  getLeaderRoster: async function (userScores, groupId, week, season) {
    const scoresCopy = [...userScores];
    const topWeekScore = await getTopScoreForWeek(scoresCopy);
    let topUserRoster = await findOneRoster(
      topWeekScore.U,
      week,
      season,
      groupId
    );
    if (topUserRoster === null) {
      return this.getBlankRoster(groupId);
    }
    const R = await mySportsHandler.fillUserRoster(topUserRoster.R);
    return R; //Don't need to get user here because the front end already has the leader and the username. Avoid the extra DB call
  },
  getBestUserForBox: async function (userScores) {
    return new Promise(async (res) => {
      const scoresCopy = [...userScores];
      const topWeekScore = await getTopScoreForWeek(scoresCopy);
      res(topWeekScore);
    });
  },
  updateGroup: async function (updatedFields, groupId) {
    const group = await this.getGroupDataById(groupId);
    const updatedArray = Object.keys(updatedFields);
    const errors = [];
    for (let i = 0; i < updatedArray.length; i++) {
      //Returns false if no errors
      const updateRes = await groupUpdater[updatedArray[i]](
        group,
        updatedFields[updatedArray[i]]
      );
      if (updateRes) {
        errors.push(updateRes);
      }
    }
    return errors;
  },
  updateMainGroup: async function (groupId, userId) {
    try {
      await db.User.updateOne({ _id: userId }, { $set: { MG: groupId } });
    } catch (err) {
      console.log(err);
    }
    return 200;
  },
  topScoreForGroup: async function (groupId, season) {
    return new Promise(async (res) => {
      const scores = await db.UserScores.find(
        { G: groupId, S: season },
        `U TS`
      ).exec();
      const topScore = await getTopScoreForWeek(scores);
      res(topScore);
    });
  },
  checkAdmin: async (group, adminId) => {
    const selfInGroup = group.UL.find((user) => user.ID.toString() === adminId);
    if (!selfInGroup) {
      return false;
    }
    return selfInGroup.A;
  },
  removeUser: (group, delUserId, season) => {
    return new Promise(async (res) => {
      const userInGroup = group.UL.find(
        (user) => user.ID.toString() === delUserId.toString()
      );
      if (!userInGroup) {
        res({ status: false, message: 'User not found in group.' });
      }

      const userPos = group.UL.map((user) => user.ID.toString()).indexOf(
        delUserId
      );
      group.UL.splice(userPos, 1);

      const user = await db.User.findById(delUserId).exec();
      const groupPos = user.GL.map((groupId) => groupId.toString()).indexOf(
        group._id.toString()
      );
      user.GL.splice(groupPos, 1);
      if (user.MG.toString() === group._id.toString()) {
        user.MG = null;
      }
      try {
        await db.UserScores.deleteOne({
          G: group._id,
          S: season,
          U: delUserId,
        });
        await db.UsedPlayers.deleteOne({
          G: group._id,
          S: season,
          U: delUserId,
        });
        await db.UserRoster.deleteMany({
          G: group._id,
          S: season,
          U: delUserId,
        });
        await user.save();
        if (group.UL.length <= 1) {
          await db.Group.deleteOne({ _id: group._id });
        } else {
          await group.save();
        }
      } catch (err) {
        res({ status: false, message: 'Saving error, contact Kevin' });
      }
      res({ status: true, message: 'User removed from group' });
    });
  },
  singleAdminCheck: async (group, userId) => {
    //A value of true means the user is the only admin and there are still others in the group
    if (group.UL.length === 1) {
      return false;
    }
    const selfInGroup = group.UL.find((user) => user.ID.toString() === userId);
    if (selfInGroup.A === false) {
      return false;
    }

    const adminList = group.UL.filter((user) => user.A === true);
    if (adminList.length <= 1) {
      const nonAdmins = group.UL.filter((user) => user.A === false);
      const filledNonAdmins = [];
      for (let user of nonAdmins) {
        const { UN, E, _id } = await db.User.findById(user.ID, `UN E`);
        filledNonAdmins.push({ UN, E, _id });
      }

      return { status: true, nonAdmins: filledNonAdmins };
    } else {
      return { stauts: false };
    }
  },
  upgradeToAdmin: async (group, userId) => {
    group.UL = group.UL.map((user) => {
      if (user.ID.toString() === userId) {
        return { ID: user.ID, A: true, B: false };
      } else {
        return user;
      }
    });
    await group.save();
    return;
  },
  getAllGroups: async () => {
    try {
      return await db.Group.find().exec();
    } catch (err) {
      console.log(err);
    }
  },
};
