import 'dotenv/config.js';
import db from '../models/index.js';
import mySportsHandler from './mySportsHandler.js';
import positions from '../constants/positions.js';

const checkDuplicate = async (checkedField, groupToSearch, userId) => {
  let searched;
  try {
    switch (checkedField) {
      case 'group':
        searched = await db.Group.findOne({ name: groupToSearch })
          .lean()
          .exec();
        if (searched !== null) {
          return true;
        }

        break;
      case 'userlist':
        searched = await db.Group.findById(groupToSearch).lean().exec();
        const isInGroup = searched.userlist.filter(
          (user) => user._id === userId
        );
        if (isInGroup.length > 0) {
          return true;
        }
        break;
      case 'userScore':
        searched = await db.UserScores.findOne({
          userId: userId,
          groupId: groupToSearch,
        })
          .lean()
          .exec();
        if (searched !== null) {
          return true;
        }
        break;
    }
    return false;
  } catch (err) {
    console.log('Error checking dulplicate for group: ', {
      checkedField,
      groupToSearch,
      userId,
      err,
    });
    throw { status: 500, message: 'Error checking for duplicate' };
  }
};

const updateUserScore = async (groupId, season, prevWeek, week) => {
  try {
    const group = await db.Group.findById(groupId).lean().exec();
    for (const user of group.userlist) {
      await createUserScore(user.userId, season, groupId);
    }
    return await db.UserScores.find(
      { groupId: groupId, season: season },
      `userId ${prevWeek} ${week} totalScore`
    )
      .lean()
      .exec();
  } catch (err) {
    if (err.status) {
      throw err;
    }
    console.log('Error creating user scores for group: ', {
      groupId,
      season,
      prevWeek,
      week,
      err,
    });
    throw { status: 500, message: 'Error creating user scores' };
  }
};

const getOrCreateUserScoreList = async (groupId, season, prevWeek, week) => {
  let userScores = [];
  try {
    userScores = await db.UserScores.find(
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
  } catch (err) {
    console.log('Error trying to access user score list: ', {
      groupId,
      season,
      prevWeek,
      week,
      err,
    });
    throw { status: 500, message: 'Error accessing user score list' };
  }

  try {
    if (userScores.length === 0) {
      return await updateUserScore(groupId, season, prevWeek, week);
    } else {
      return userScores;
    }
  } catch (err) {
    throw err;
  }
};

const createUserScore = async (userId, season, groupId) => {
  if (await checkDuplicate('userScore', userId, groupId)) {
    console.log('User score already exists for user, trying to be re-added: ', {
      userId,
      season,
      groupId,
    });
    throw { status: 409, message: 'User score already created for group' };
  }
  try {
    await db.UserScores.create({ userId, groupId, season });
  } catch (err) {
    console.log('DB Error creating UserScores: ', {
      userId,
      groupId,
      season,
      err,
    });
    throw { status: 500, message: 'Error creating user score' };
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
    if (await checkDuplicate('group', groupName)) {
      throw { status: 409, message: 'Duplicate group name' };
    }
    try {
      const newGroupFromDB = await db.Group.create({
        name: groupName,
        description: groupDesc,
      }).exec();

      db.GroupRoster.create({
        groupId: newGroupFromDB._id,
        position: groupPositions,
      });
      db.GroupScore.create({
        groupId: newGroupFromDB._id,
        passing: newGroupScore.passing,
        rushing: newGroupScore.rushing,
        receiving: newGroupScore.receiving,
        fumble: newGroupScore.fumble,
        fieldGoal: newGroupScore.fumble,
      });

      await db.User.findByIdAndUpdate(userId, {
        $push: { groupList: newGroupFromDB._id },
      });

      return newGroupFromDB;
    } catch (err) {
      console.log('Error Creating new group: ', {
        userId,
        newGroupScore,
        groupName,
        groupDesc,
        groupPositions,
        err,
      });
      throw { status: 500, message: 'Error creating the group' };
    }
  },
  addUser: async (addedUserID, groupId, isAdmin = false) => {
    if (await checkDuplicate('userlist', groupId, addedUserID)) {
      throw { status: 409, message: 'User already in group' };
    }

    try {
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
      const [currentTime] = await db.SeasonAndWeek.find({}).lean().exec();
      if (!(await checkDuplicate('userScore', groupId, addedUserID))) {
        await createUserScore(addedUserID, currentTime.season, groupId);
      }

      return groupDetail;
    } catch (err) {
      console.log('Error in add user to group: ', {
        addedUserID,
        groupId,
        isAdmin,
        err,
      });
      if (err.status) {
        throw err;
      }
      throw { status: 500, message: 'Error adding user to group' };
    }
  },
  getGroupDataByName: (groupName) =>
    db.Group.findOne({ name: groupName })
      .collation({ locale: 'en_US', strength: 2 })
      .lean()
      .exec(),
  getGroupDataById: (groupId) => db.Group.findById(groupId).lean().exec(),
  getGroupDataByIdNoLean: (groupId) => db.Group.findById(groupId).exec(),
  getLeaderBoard: async (groupId, season, week) => {
    const arrayForLeaderBoard = [];
    const weekAccessor = (week === 1 ? 1 : week - 1).toString();
    try {
      const userScoreList = await getOrCreateUserScoreList(
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
    } catch (err) {
      if (err.status) {
        throw err;
      }
      console.log('Error getting leaderboard: ', {
        groupId,
        season,
        week,
        err,
      });
      throw { status: 500, message: 'Error getting leaderboard' };
    }
  },
  getGroupPositions: async (groupId) => {
    try {
      const { position } = await db.GroupRoster.findOne(
        { groupId },
        { position: 1 }
      )
        .lean()
        .exec();
      return position;
    } catch (err) {
      console.log('Error getting group postiions: ', { err });
      throw { status: 404, message: 'Cannot Find Group Positions' };
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
  getGroupScore: (groupId) => db.GroupScore.findOne({ groupId }).lean().exec(),
  mapGroupPositions: async (groupPositions, positionMap) => {
    const groupMap = [];
    for (const position of groupPositions) {
      groupMap.push(positionMap[position.id]);
    }
    return groupMap;
  },
  getGroupList: async () => {
    const filledData = [];
    let groupResponse = [];
    try {
      groupResponse = await db.Group.find().lean().exec();
    } catch (err) {
      console.log('Error getting all group data: ', { err });
      throw { status: 500, message: 'Error getting group data' };
    }

    for (let i = 0; i < groupResponse.length; i++) {
      filledData[i] = {
        name: groupResponse[i].name,
        description: groupResponse[i].description,
        groupId: groupResponse[i]._id,
        userlist: [],
      };
      for (let ii = 0; ii < groupResponse[i].userlist.length; ii++) {
        let user = {};
        try {
          user = await db.User.findById(groupResponse[i].userlist[ii].userId, {
            username: 1,
          })
            .lean()
            .exec();
        } catch (err) {
          console.log('Error pulling user for all group list: ', {
            groupId: groupResponse[i]._id,
            userId: groupResponse[i].userlist[ii].userId,
          });
        }
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
    let idealRosterResponse;
    try {
      idealRosterResponse = await db.IdealRoster.findOne({
        groupId,
        season,
        week,
      }).exec();
    } catch (err) {
      console.log('Database connection error with getIdealRoster: ', {
        groupId,
        season,
        week,
      });
      throw { status: 500, message: 'Database connection error' };
    }
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
        return updatedIdealRoster;
      } catch (err) {
        if (err.status) {
          throw err;
        }
        console.log('Error created ideal roster: ', {
          groupId,
          season,
          week,
          err,
        });
        throw { status: 500, message: 'Ideal Roster could not be created' };
      }
    } else {
      return idealRosterResponse;
    }
  },
  updateAllIdealRosters: async function (season, week) {
    try {
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
    } catch (err) {
      if (err.status) {
        throw err;
      } else {
        throw { status: 500, message: 'Error updating Ideal Roster' };
      }
    }
  },
  updateIdealRoster: function (groupId, season, week, idealRoster) {
    return new Promise((res) =>
      Promise.all([
        db.GroupScore.findOne({ groupId }).lean().exec(),
        db.GroupRoster.findOne({ groupId }, { position: 1 }).lean().exec(),
      ])
        .then(async ([groupScore, { position }]) => {
          if (groupPositions.length === 0 || !position) {
            throw { status: 404, message: 'Group Positions not found!' };
          }

          Promise.all([
            mySportsHandler.rankPlayers(season, week, groupScore),
            this.mapGroupPositions(position, positions.positionMap),
          ])
            .then(async ([rankedPlayers, groupPositionMap]) => {
              const idealArray = [];
              for (const possiblePositions of groupPositionMap) {
                const highScorers = [];
                for (const positionVal of possiblePositions) {
                  const topScorer =
                    rankedPlayers[position.positionArray[positionVal]].shift();
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
            })
            .catch((err) => {
              console.log(
                'Error updating / creating ideal roster in second level: ',
                {
                  groupId,
                  season,
                  week,
                  idealRoster,
                  err,
                }
              );
              throw { status: 500, message: 'Cannot create ideal roster' };
            });
        })
        .catch((err) => {
          console.log(
            'Error updating / creating ideal roster in first level: ',
            {
              groupId,
              season,
              week,
              idealRoster,
              err,
            }
          );
          throw { status: 500, message: 'Cannot create ideal roster' };
        })
    );
  },
  getBlankRoster: async function (groupId) {
    try {
      const { position } = await db.GroupRoster.findOne(
        { groupId },
        { position: 1 }
      )
        .lean()
        .exec();
      if (!position) {
        return [{ mySportsId: 0, position: 'QB', score: 0 }];
      }
      const blankRoster = positions.map((position) => ({
        mySportsId: 0,
        position: position.name,
        score: 0,
      }));
      return blankRoster;
    } catch (err) {
      console.log('Error finding group roster to fill out blank: ', {
        groupId,
        err,
      });
      throw { status: 500, message: 'Error getting group roster' };
    }
  },
  getBestRoster: async function (groupId, season, week, userScores) {
    const lastWeek = (week - 1).toString();
    const scoresCopy = [...userScores];
    const topWeekScore = await getTopScorerForWeek(scoresCopy, lastWeek);
    try {
      const topUserRoster = await db.UserRoster.findOne(
        {
          userId: topWeekScore.userId,
          week: lastWeek,
          season: season,
          groupId: groupId,
        },
        { roster: 1 }
      )
        .lean()
        .exec();
      if (!topUserRoster) {
        return null;
      }
      const foundUser = await db.User.findById(topWeekScore.userId, {
        username: 1,
      }).exec();
      const roster = await mySportsHandler.fillUserRoster(topUserRoster.roster);
      return { roster, username: foundUser.username };
    } catch (err) {
      console.log('Error in getBestRoster: ', {
        groupId,
        season,
        week,
        userScores,
        err,
      });
      throw { status: 500, message: 'Error getting best roster for week' };
    }
  },
  getCurrAndLastWeekScores: async (groupId, season, week) => {
    const weekAccessor = (week === 1 ? 1 : week - 1).toString();
    try {
      return await getOrCreateUserScoreList(
        groupId,
        season,
        weekAccessor,
        week
      );
    } catch (err) {
      console.log('Error inside getCurrAndLastWeekScores: ', {
        groupId,
        season,
        week,
        err,
      });
      throw { status: 500, message: 'Error getting weekly scores' };
    }
  },
  getLeaderRoster: async function (userScores, groupId, week, season) {
    const scoresCopy = [...userScores];
    const topWeekScore = await getTopScoreForWeek(scoresCopy);
    try {
      let topUserRoster = await db.UserRoster.findOne(
        {
          userId: topWeekScore.userId,
          week: week,
          season: season,
          groupId: groupId,
        },
        { roster: 1 }
      )
        .lean()
        .exec();
      if (topUserRoster === null) {
        return this.getBlankRoster(groupId);
      }
      const roster = await mySportsHandler.fillUserRoster(topUserRoster.roster);
      return roster;
    } catch (err) {
      console.log('Error populating user roster in getLeaderRoster: ', {
        userScores,
        groupId,
        week,
        season,
        err,
      });
      throw { status: 500, message: "Error getting leader's roster" };
    }
  },
  getBestUserForBox: async function (userScores) {
    const scoresCopy = [...userScores];
    try {
      const topWeekScore = await getTopScoreForWeek(scoresCopy);
      const userDetails = await db.User.findById(topWeekScore.userId, {
        username: 1,
      })
        .lean()
        .exec();
      return {
        username: userDetails.username,
        totalScore: topWeekScore.totalScore,
      };
    } catch (err) {
      console.log('Error in getBestUserForBox, likely DB connection error: ', {
        userScores,
        err,
      });
      throw { status: 500, message: 'Database connection error' };
    }
  },
  updateGroup: async (updatedGroup) => {
    try {
      if (updatedGroup.name.length < 6 || updatedGroup.description.length < 6) {
        throw {
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
    try {
      const scores = await db.UserScores.find(
        { groupId, season },
        `userId totalScore`
      )
        .lean()
        .exec();
      const topScore = await getTopScoreForWeek(scores);
      const { username } = await db.User.findById(topScore.userId);
      return { ...topScore, username };
    } catch (err) {
      console.log('Error getting topScoreForGroup: ', { groupId, season, err });
      throw { status: 500, mmessage: 'Error pulling top score' };
    }
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
  removeUser: async (group, delUserId, season) => {
    const userInGroup = group.userlist.find(
      (user) => user.userId.toString() === delUserId.toString()
    );
    if (!userInGroup) {
      throw { status: 400, message: 'User not found in group.' };
    }

    const userPos = group.userlist
      .map((user) => user.userId.toString())
      .indexOf(delUserId);
    group.userlist.splice(userPos, 1);
    let user;
    try {
      user = await db.User.findById(delUserId).exec();
    } catch (err) {
      console.log('Error finding userById in removeUser: ', { delUserId, err });
      throw { status: 500, message: 'Error getting user' };
    }
    const groupPos = user.grouplist
      .map((groupId) => groupId.toString())
      .indexOf(group._id.toString());
    user.grouplist.splice(groupPos, 1);
    if (user.mainGroup && user.mainGroup.toString() === group._id.toString()) {
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
      if (group.userlist.length === 0) {
        await db.Group.deleteOne({ _id: group._id });
      } else {
        await group.save();
      }
    } catch (err) {
      console.log('Error removeUser: ', { group, delUserId, season, err });
      throw { status: 500, message: 'Error deleting user from group' };
    }
    return { status: true, message: 'User removed from group' };
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
        try {
          const { username, email, _id } = await db.User.findById(user.userId, {
            username: 1,
            email: 1,
          });
          filledNonAdmins.push({ username, email, _id });
        } catch (err) {
          console.log('Error finding userById in singleAdminCheck: ', {
            group,
            userId,
            err,
          });
          throw { status: 500, message: 'Error finding user' };
        }
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
    try {
      await group.save();
      return;
    } catch (err) {
      throw { status: 500, message: 'Error saving group' };
    }
  },
  getAllGroups: async () => {
    try {
      return await db.Group.find().lean().exec();
    } catch (err) {
      console.log('Error getAllGroups: ', { err });
      throw { status: 500, message: 'Error pulling groups' };
    }
  },
  getYearlyWinner: async (groupId, season) => {
    try {
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
    } catch (err) {
      console.log('Error getting highest score for year in getYearlyWinner: ', {
        groupId,
        season,
        err,
      });
      throw { status: 500, message: 'Error pulling yearly winner' };
    }
  },
  getGroupDataByUserId: async (userId) => {
    try {
      const userGroupList = await db.User.findById(userId, { grouplist: 1 })
        .lean()
        .exec();
      const groupList = await db.Group.find(
        { _id: { $in: userGroupList.grouplist } },
        'name'
      ).exec();
      return groupList;
    } catch (err) {
      console.log('Error getGroupDataByUserId: ', { userId, err });
      throw { status: 500, message: 'Error pulling group data for user' };
    }
  },
  shouldRostersBeHidden: async (season, week, groupId) => {
    try {
      const [[dbTime], group] = await Promise.all([
        db.SeasonAndWeek.find({}).lean().exec(),
        db.Group.findById(groupId, { hidePlayersUntilLocked: true })
          .lean()
          .exec(),
      ]);
      if (!group.hidePlayersUntilLocked) {
        return false;
      } else if (dbTime.season !== season) {
        return false;
      } else if (dbTime.seasonOver) {
        return false;
      } else if (dbTime.lockWeek >= week) {
        return false;
      }
      return true;
    } catch (err) {
      console.log('Error in shouldRostersBeHidden: ', {
        season,
        week,
        groupId,
      });
      throw { status: 500, message: 'Error getting rosters' };
    }
  },
};
