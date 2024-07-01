import 'dotenv/config.js';
import db from '../models/index.js';
import mySportsHandler from './mySportsHandler.js';
import positions from '../constants/positions.js';

const checkDuplicate = async (checkedField, groupToSearch, userId) => {
  let result = false;
  let searched;
  switch (checkedField) {
    case 'group':
      try {
        searched = await db.Group.findOne({ name: groupToSearch })
          .lean()
          .exec();
        //If there is a group with that name return true
        if (searched !== null) {
          result = true;
        }
      } catch (err) {
        console.log(err);
      }
      break;
    case 'userlist':
      //Grabs the group that the user is looking to add the user to
      try {
        searched = await db.Group.findById(groupToSearch).lean().exec();
      } catch (err) {
        console.log(err);
      }
      try {
        const isInGroup = searched.userlist.filter(
          (user) => user._id === userId
        );
        if (isInGroup.length > 0) {
          result = true;
        }
      } catch (err) {
        console.log(err);
      }
      break;
    case 'userScore':
      try {
        searched = await db.UserScores.findOne({
          userId: userId,
          groupId: groupToSearch,
        })
          .lean()
          .exec();
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

const updateUserScore = async (groupId, season, prevWeek, week) =>
  new Promise(async (res) => {
    const group = await db.Group.findById(groupId).lean().exec();
    for (const user of group.userlist) {
      createUserScore(user.userId, season, groupId);
    }
    res(
      await db.UserScores.find(
        { groupId: groupId, season: season },
        `userId ${prevWeek} ${week} totalScore`
      )
        .lean()
        .exec()
    );
  });

const getUserScoreList = async (groupId, season, prevWeek, week) => {
  const userScores = await db.UserScores.find(
    { groupId, season },
    `userId ${prevWeek} ${week} totalScore`
  )
    .lean()
    .exec();
  for (const score of userScores) {
    if (score[week] === undefined) {
      score[week] = 0;
    }
  }
  if (userScores.length === 0) {
    return await updateUserScore(groupId, season, prevWeek, week);
  } else {
    return userScores;
  }
};

const createGroupRoster = async (groupId, rosterSpots) => {
  const dbResponse = db.GroupRoster.create({
    groupId: groupId,
    position: rosterSpots,
  })
    .lean()
    .exec();
  return dbResponse;
};

const createGroupScore = (groupId, groupScore) => {
  db.GroupScore.create({
    groupId: groupId,
    passing: groupScore.passing,
    rushing: groupScore.rushing,
    receiving: groupScore.receiving,
    fumble: groupScore.fumble,
    fieldGoal: groupScore.fumble,
  });
};

const createUserScore = async (userId, season, groupId) => {
  const checkDupeUser = await checkDuplicate('userScore', userId, groupId);
  if (!checkDupeUser) {
    await db.UserScores.create({ userId, groupId, season }).exec();
  }
};

const getTopScorerForWeek = (userScores, week) => {
  userScores.sort((a, b) => b[week] - a[week]);
  const topWeekScore = userScores.shift();
  return topWeekScore;
};

const getTopScoreForWeek = (userScores) => {
  userScores.sort((a, b) => b.totalScore - a.totalScore);
  const topWeekScore = userScores.shift();
  return topWeekScore;
};

const findOneRoster = (userId, week, season, groupId) => {
  return db.UserRoster.findOne({ userId, week, season, groupId }, { roster: 1 })
    .lean()
    .exec();
};

const findOneUserById = (userId) => {
  return db.User.findById(userId, { username: 1 }).exec();
};

const groupUpdater = {
  groupScore: async (group, field) => {
    const fields = Object.keys(field);
    for (let i = 0; i < fields.length; i++) {
      const innerFields = Object.keys(field[fields[i]]);
      for (let ii = 0; ii < innerFields.length; ii++) {
        //If the user left just a negative sign in there take it out and add a zero
        if (field[fields[i]][innerFields[ii]] === '-') {
          field[fields[i]][innerFields[ii]] = 0;
        }
      }
    }
    try {
      await db.GroupScore.findOneAndUpdate(
        { groupScore: group._id },
        {
          position: field.position,
          rushing: field.rushing,
          receiving: field.receiving,
          fieldGoal: field.fieldGoal,
          fumble: field.fumble,
        }
      );
    } catch {
      return 'Group Score Error';
    }
    return false;
  },
  groupDescription: async (group, field) => {
    group.description = field;
    try {
      await group.save();
    } catch {
      return 'Group Desc Error';
    }
    return false;
  },
  groupName: async (group, field) => {
    group.name = field;
    try {
      await group.save();
    } catch {
      return 'Group Name Error';
    }
    return false;
  },
  groupPosition: async (group, field) => {
    try {
      await db.GroupRoster.findOneAndUpdate(
        { G: group._id },
        { position: field }
      );
    } catch {
      return 'Group Position Error';
    }
    return false;
  },
};

export default {
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
    const newGroupFromDB = await db.Group.create({
      name: groupName,
      description: groupDesc,
    }).exec();
    createGroupRoster(newGroupFromDB._id, groupPositions);
    createGroupScore(newGroupFromDB._id, newGroupScore);

    await db.User.findByIdAndUpdate(userId, {
      $push: { groupList: newGroupFromDB._id },
    });

    return newGroupFromDB;
  },
  addUser: async (addedUserID, groupId, isAdmin = false) => {
    const isDuplicate = await checkDuplicate('userlist', groupId, addedUserID);

    if (isDuplicate) {
      return 500;
    }

    const groupDetail = await db.Group.findByIdAndUpdate(
      groupId,
      {
        $push: {
          userlist: {
            admin: isAdmin,
            blocked: false,
            userId: addedUserID,
          },
        },
      },
      { new: true }
    )
      .lean()
      .exec();
    const dbResponse = await db.SeasonAndWeek.find({}).lean().exec();
    await createUserScore(addedUserID, dbResponse[0].season, groupId);

    return groupDetail;
  },
  getGroupData: async (groupName) => {
    const groupData = await db.Group.findOne({ name: groupName })
      .collation({ locale: 'en_US', strength: 2 })
      .lean()
      .exec();
    return groupData;
  },
  getGroupDataById: async (groupId) =>
    await db.Group.findById(groupId).lean().exec(),
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
      const { username } = await db.User.findById(user.userId).lean().exec();
      const filledOutUser = {
        userId: user.userId,
        totalScore: user.totalScore,
        username: username,
        currentWeek: user[week],
        lastWeek: user[weekAccessor],
      };
      arrayForLeaderBoard.push(filledOutUser);
    }
    arrayForLeaderBoard.sort((a, b) => b.totalScore - a.totalScore);
    return arrayForLeaderBoard;
  },
  createGenericGroup: async function () {
    if (!checkDuplicate('group', 'Eliminator')) {
      return false;
    }
    const clapperFromDB = await db.Group.create({
      name: 'Eliminator',
      description: 'General group for everyone to join',
    })
      .lean()
      .exec();
    this.createGroupRoster(clapperFromDB._id);
    this.createGroupScore(clapperFromDB._id);
    return 'working';
  },
  createGeneralGroupRoster: async (groupId) =>
    new Promise(async (res, rej) => {
      const dbResponse = await db.GroupRoster.create({ groupId }).exec();
      res(dbResponse);
    }),
  getGroupPositions: async (groupId) =>
    new Promise(async (res, rej) => {
      try {
        const { position } = await db.GroupRoster.findOne(
          { groupId },
          { position: 1 }
        )
          .lean()
          .exec();
        res(position);
      } catch (err) {
        console.log(`Error: ${err}`);
        rej(Error('Cannot Find Group Positions'));
      }
    }),
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
  getGroupScore: async (groupId) =>
    new Promise(async (res, rej) => {
      try {
        res(await db.GroupScore.findOne({ groupId }).lean().exec());
      } catch (err) {
        rej('Error getting group score in group handler');
      }
    }),
  mapGroupPositions: async (groupPositions, positionMap) => {
    const groupMap = [];
    for (const position of groupPositions) {
      groupMap.push(positionMap[position.id]);
    }
    return groupMap;
  },
  getGroupList: async () => {
    const filledData = [];
    const groupResponse = await db.Group.find().lean().exec();

    for (let i = 0; i < groupResponse.length; i++) {
      filledData[i] = {
        name: groupResponse[i].name,
        description: groupResponse[i].description,
        groupId: groupResponse[i]._id,
        userlist: [],
      };
      for (let ii = 0; ii < groupResponse[i].userlist.length; ii++) {
        const user = await db.User.findById(
          groupResponse[i].userlist[ii].userId,
          { username: 1 }
        )
          .lean()
          .exec();
        if (user) {
          filledData[i].userlist.push({
            username: user.username,
            admin: groupResponse[i].userlist[ii].admin,
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
        groupId,
        season,
        week,
      }).exec();
      if (idealRosterResponse === null) {
        let newIdealRoster = new db.IdealRoster({
          groupId,
          season,
          week,
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
        groupId: group._id,
        season: season,
        week: week,
      }).exec();
      if (!idealRoster) {
        idealRoster = new db.IdealRoster({
          group: group._id,
          season: season,
          week: week,
        });
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
          mySportsHandler.rankPlayers(season, week, groupScore),
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
                mySportsId: highScorers[0].mySportsId,
                score: highScorers[0].score,
              });
            } else {
              highScorers.sort((a, b) => {
                return b.score - a.score;
              });
              idealArray.push({
                mySportsId: highScorers[0].mySportsId,
                score: highScorers[0].score,
              });
            }
          }
          idealRoster.roster = idealArray;
          idealRoster.save();

          res(idealRoster);
        });
      })
    );
  },
  getBlankRoster: async function (groupId) {
    const groupPositions = await this.getGroupPositions(groupId);
    if (!groupPositions) {
      return [{ mySportsId: 0, position: 'QB', score: 0 }];
    }
    const blankRoster = groupPositions.map((position) => ({
      mySportsId: 0,
      position: position.name,
      score: 0,
    }));
    return blankRoster;
  },
  getBestRoster: async function (groupId, season, week, userScores) {
    const lastWeek = (week - 1).toString();
    const scoresCopy = [...userScores];
    const topWeekScore = await getTopScorerForWeek(scoresCopy, lastWeek);
    const topUserRoster = await findOneRoster(
      topWeekScore.userId,
      lastWeek,
      season,
      groupId
    );
    if (!topUserRoster) {
      return null;
    }
    const foundUser = await findOneUserById(topWeekScore.userId);
    const roster = await mySportsHandler.fillUserRoster(topUserRoster.roster);
    return { roster, username: foundUser.username };
  },
  getCurrAndLastWeekScores: async (groupId, season, week) => {
    const weekAccessor = (week === 1 ? 1 : week - 1).toString();
    return await getUserScoreList(groupId, season, weekAccessor, week);
  },
  getLeaderRoster: async function (userScores, groupId, week, season) {
    const scoresCopy = [...userScores];
    const topWeekScore = await getTopScoreForWeek(scoresCopy);
    let topUserRoster = await findOneRoster(
      topWeekScore.userId,
      week,
      season,
      groupId
    );
    if (topUserRoster === null) {
      return this.getBlankRoster(groupId);
    }
    const roster = await mySportsHandler.fillUserRoster(topUserRoster.roster);
    return roster;
  },
  getBestUserForBox: async function (userScores) {
    return new Promise(async (res) => {
      const scoresCopy = [...userScores];
      const topWeekScore = await getTopScoreForWeek(scoresCopy);
      res(topWeekScore);
    });
  },
  updateGroup: async (updatedGroup) => {
    try {
      if (updatedGroup.name.length < 6 || updatedGroup.description.length < 6) {
        return {
          status: 400,
          message: 'Name & description must be at least 6 characters',
        };
      }

      await db.Group.findByIdAndUpdate(updatedGroup.groupId, {
        name: updatedGroup.name,
        description: updatedGroup.description,
      });
      return { status: 200, message: 'Group successfully updated' };
    } catch (err) {
      console.log(
        `Error updating group: ${updatedGroup.name}. ID: ${updatedGroup.groupId} err: `,
        { err }
      );
      return { status: 400, message: 'Error updating group!' };
    }
  },
  updateMainGroup: async function (groupId, userId) {
    try {
      await db.User.updateOne(
        { _id: userId },
        { $set: { mainGroup: groupId } }
      );
    } catch (err) {
      console.log(err);
    }
    return 200;
  },
  topScoreForGroup: async function (groupId, season) {
    return new Promise(async (res) => {
      const scores = await db.UserScores.find(
        { groupId, season },
        `userId totalScore`
      ).exec();
      const topScore = await getTopScoreForWeek(scores);
      res(topScore);
    });
  },
  checkAdmin: async (group, adminId) => {
    const selfInGroup = group.userlist.find(
      (user) => user.userId.toString() === adminId
    );
    if (!selfInGroup) {
      return false;
    }
    return selfInGroup.admin;
  },
  removeUser: (group, delUserId, season) => {
    return new Promise(async (res) => {
      const userInGroup = group.userlist.find(
        (user) => user.userId.toString() === delUserId.toString()
      );
      if (!userInGroup) {
        res({ status: false, message: 'User not found in group.' });
      }

      const userPos = group.userlist
        .map((user) => user.userId.toString())
        .indexOf(delUserId);
      group.userlist.splice(userPos, 1);

      const user = await db.User.findById(delUserId).exec();
      const groupPos = user.grouplist
        .map((groupId) => groupId.toString())
        .indexOf(group._id.toString());
      user.grouplist.splice(groupPos, 1);
      if (user.mainGroup.toString() === group._id.toString()) {
        user.mainGroup = null;
      }
      try {
        await db.UserScores.deleteOne({
          groupId: group._id,
          season: season,
          userId: delUserId,
        });
        await db.UsedPlayers.deleteOne({
          groupId: group._id,
          season: season,
          userId: delUserId,
        });
        await db.UserRoster.deleteMany({
          groupId: group._id,
          season: season,
          userId: delUserId,
        });
        await user.save();
        if (group.userlist.length <= 1) {
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
    if (group.userlist.length === 1) {
      return false;
    }
    const selfInGroup = group.userlist.find(
      (user) => user.userId.toString() === userId
    );
    if (selfInGroup.admin === false) {
      return false;
    }

    const adminList = group.userList.filter((user) => user.admin === true);
    if (adminList.length <= 1) {
      const nonAdmins = group.userList.filter((user) => user.admin === false);
      const filledNonAdmins = [];
      for (let user of nonAdmins) {
        const { username, email, _id } = await db.User.findById(
          user.userId,
          'username email'
        );
        filledNonAdmins.push({ username, email, _id });
      }

      return { status: true, nonAdmins: filledNonAdmins };
    } else {
      return { stauts: false };
    }
  },
  upgradeToAdmin: async (group, userId) => {
    group.userlist = group.userlist.map((user) => {
      if (user.userId.toString() === userId) {
        return { userId: user.userId, admin: true, blocked: false };
      } else {
        return user;
      }
    });
    await group.save();
    return;
  },
  getAllGroups: async () => {
    try {
      return await db.Group.find().lean().exec();
    } catch (err) {
      console.log(err);
    }
  },
  getYearlyWinner: async (groupId, season) => {
    const topScore = await db.UserScores.findOne(
      { groupId: groupId, season: season },
      { userId: 1, totalScore: 1 }
    )
      .sort('-totalScore')
      .lean()
      .exec();
    const user = await db.User.findById(topScore.userId, { username: 1 })
      .lean()
      .exec();
    return { username: user.username, totalScore: topScore.totalScore };
  },
  getGroupDataByUserId: async (userId) => {
    const userGroupList = await db.User.findById(userId, { grouplist: 1 })
      .lean()
      .exec();
    const groupList = await db.Group.find(
      { _id: { $in: userGroupList.grouplist } },
      'name'
    ).exec();
    return groupList;
  },
};
