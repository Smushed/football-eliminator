import 'dotenv/config.js';
import db from '../models/index.js';
import userHandler from './userHandler.js';
import groupHandler from './groupHandler.js';
import mySportsHandler from './mySportsHandler.js';
import positions from '../constants/positions.js';

const checkDuplicateRoster = async (
  checkedField,
  userId,
  groupId,
  season,
  week,
  position
) => {
  switch (checkedField) {
    case 'userRoster':
      try {
        const search = await db.UserRoster.findOne({
          userId,
          week,
          groupId,
          season,
        }).exec();
        if (search !== null) {
          return true;
        }
      } catch (err) {
        console.log('Error in checking duplicate userRoster: ', {
          checkedField,
          userId,
          groupId,
          season,
          week,
          position,
          err,
        });
        throw {
          status: 500,
          message: 'Internal Server Error, please refresh',
        };
      }
      break;
    case 'usedPlayers':
      try {
        const search = await db.UsedPlayers.findOne({
          userId,
          season,
          groupId,
          position,
        }).exec();
        if (search !== null) {
          return true;
        }
      } catch (err) {
        console.log('Error in checking duplicate usedPlayers: ', {
          checkedField,
          userId,
          groupId,
          season,
          week,
          position,
          err,
        });
        throw {
          status: 500,
          message: 'Internal Server Error, please refresh',
        };
      }
      break;
  }
  return false;
};

const getUsedPlayers = async (userId, season, groupId, position) => {
  try {
    const currentUser = await db.UsedPlayers.findOne({
      userId,
      season,
      groupId,
      position,
    }).exec();
    if (currentUser === null) {
      const createdUsedPlayers = await createUsedPlayers(
        userId,
        season,
        groupId,
        position
      );
      return createdUsedPlayers.usedPlayers;
    } else {
      return currentUser.usedPlayers;
    }
  } catch (err) {
    if (err.status) {
      throw err;
    } else {
      throw { status: 500, message: 'Error getting used players for season' };
    }
  }
};

const getUsedPlayersNoPosition = async (userId, season, groupId) => {
  let usedPlayers = null;
  try {
    usedPlayers = await db.UsedPlayers.find({
      userId,
      season,
      groupId,
    }).exec();
  } catch (err) {
    console.log('Error finding usedPlayers in getUsedPlayersNoPosition: ', {
      userId,
      season,
      groupId,
      err,
    });
    throw { status: 500, message: 'Database error' };
  }
  //If less than the max amount of used players, we need to make them here
  if (usedPlayers.length < 4) {
    const hasUsedPlayers = {
      QB: false,
      RB: false,
      WR: false,
      TE: false,
    };
    usedPlayers.forEach((dbUsedPlayer, i) => {
      hasUsedPlayers[dbUsedPlayer.position] = true;
    });
    for (const key in hasUsedPlayers) {
      if (!hasUsedPlayers[key]) {
        try {
          createUsedPlayers(userId, season, groupId, key);
        } catch (err) {
          throw err;
        }
      }
    }
  }
  return usedPlayers;
};

const createUsedPlayers = async (userId, season, groupId, position) => {
  let isDupe = false;
  try {
    isDupe = await checkDuplicateRoster(
      'usedPlayers',
      userId,
      groupId,
      season,
      null,
      position
    );
  } catch (err) {
    throw err;
  }
  if (!isDupe) {
    try {
      return await db.UsedPlayers.create({
        userId,
        season,
        groupId,
        position,
      });
    } catch (err) {
      console.log('Error in createUsedPlayers: ', {
        userId,
        season,
        groupId,
        position,
        err,
      });
      throw { status: 500, message: 'Error creating Used Players for season' };
    }
  } else {
    console.log('Error, dupe used players is trying to be created: ', {
      userId,
      season,
      groupId,
      position,
      err,
    });
    throw { status: 400, message: 'Used Players already exists for season' };
  }
};

const createWeeklyRoster = async function (userId, week, season, groupId) {
  try {
    const groupRoster = await db.GroupRoster.findOne({ groupId });

    const roster = groupRoster.position.map(() => ({
      mySportsId: 0,
      score: 0,
    }));

    return await db.UserRoster.create({
      userId,
      week,
      season,
      groupId,
      roster,
    });
  } catch (err) {
    console.log('Error Creating weekly roster:', {
      userId,
      week,
      season,
      groupId,
      err,
    });
    throw { status: 500, message: 'Error creating weekly roster' };
  }
};

const getWeeklyGroupRostersCreateIfNotExist = async (season, week, group) => {
  try {
    const userRosters = await db.UserRoster.find({
      season: season,
      week: week,
      groupId: group._id,
    })
      .lean()
      .exec();

    const completeRosters = userRosters.slice(0);
    const userIdArray = userRosters.map((roster) => roster.userId.toString());
    if (group.userlist.length !== userRosters.length) {
      for (const user of group.userlist) {
        if (!userIdArray.includes(user.userId.toString())) {
          completeRosters.push(
            await createWeeklyRoster(user.userId, week, season, group._id)
          );
        }
      }
    }
    return completeRosters;
  } catch (err) {
    if (err.status === 500) {
      throw err;
    } else {
      console.log('Error get / creating weekly user roster:', {
        season,
        week,
        groupId,
        err,
      });
      throw { status: 500, message: 'Error pulling weekly rosters' };
    }
  }
};

const sortUsersByScore = async (userRosterArray, groupId, season) => {
  const userIdArray = userRosterArray.map((user) => user.userId);
  let userScores;
  try {
    userScores = await db.UserScores.find(
      { userId: { $in: userIdArray }, groupId: groupId, season: season },
      { totalScore: 1, userId: 1 }
    )
      .sort({ totalScore: -1 })
      .lean()
      .exec();
  } catch (err) {
    console.log('Error in sortUsersByScore: ', { groupId, season, err });
    throw { status: 500, message: 'Error sorting users' };
  }

  for (let i = 0; i < userScores.length; i++) {
    const foundUser = userRosterArray.find(
      (userRoster) =>
        userRoster.userId.toString() === userScores[i].userId.toString()
    );
    userScores[i].username = foundUser.username;
    userScores[i].roster = foundUser.roster;
  }

  return userScores;
};

const checkRoster = async (groupId, newRoster) => {
  let groupRoster;
  try {
    groupRoster = await db.GroupRoster.findOne({ groupId }, { position: 1 })
      .lean()
      .exec();
  } catch (err) {
    console.log('Error pulling groupRoster in checkRoster: ', {
      groupId,
      newRoster,
      err,
    });
    throw { status: 500, message: 'Database error, please refresh' };
  }

  const mappedPositions = await groupHandler.mapGroupPositions(
    groupRoster.position,
    positions.positionMap
  );
  const maxPositionCount = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0 };
  const currentPositionsOnRoster = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0 };
  for (const singlePositionMap of mappedPositions) {
    for (const position of singlePositionMap) {
      maxPositionCount[positions.positionArray[position]]++;
    }
  }
  if (newRoster.length > mappedPositions.length) {
    throw { status: 400, message: 'Too many players on roster' };
  }
  const mySportsArray = newRoster.map((player) => player.mySportsId);

  let newPlayers;
  try {
    newPlayers = await db.PlayerData.find(
      { mySportsId: { $in: mySportsArray } },
      { position: 1 }
    )
      .lean()
      .exec();
  } catch (err) {
    console.log('Error pulling PlayerData in checkRoster: ', {
      groupId,
      newRoster,
      err,
    });
    throw { status: 500, message: 'Database error, please refresh' };
  }

  for (const player of newPlayers) {
    currentPositionsOnRoster[player.position]++;
  }

  for (const position of positions.positionArray) {
    if (maxPositionCount[position] < currentPositionsOnRoster[position]) {
      throw { status: 400, message: `Too many ${position} on your roster` };
    }
  }
};

export default {
  availablePlayers: async (userId, searchedPosition, season, groupId) => {
    try {
      const usedPlayers = await getUsedPlayers(
        userId,
        season,
        groupId,
        searchedPosition
      );
      const availablePlayers = await db.PlayerData.find({
        active: true,
        position: searchedPosition,
        mySportsId: { $nin: usedPlayers },
      })
        .sort({ rank: 1 })
        .lean()
        .exec();
      return availablePlayers;
    } catch (err) {
      if (err.status) {
        throw err;
      } else {
        throw { status: 500, message: 'Database error, please refresh' };
      }
    }
  },
  updateUserRoster: async (
    userId,
    groupId,
    roster,
    droppedPlayer,
    addedPlayer,
    week,
    season,
    position
  ) => {
    try {
      let usedPlayers = await db.UsedPlayers.findOne({
        userId,
        season,
        groupId,
        position,
      }).exec();
      if (usedPlayers === null) {
        usedPlayers = await createUsedPlayers(
          userId,
          season,
          groupId,
          position
        );
      }

      let newUsedPlayers = [];
      for (const playerId of usedPlayers.usedPlayers) {
        if (playerId === addedPlayer) {
          throw { status: 400, message: "You've already used this player" };
        } else if (playerId !== +droppedPlayer) {
          newUsedPlayers.push(playerId);
        }
      }
      newUsedPlayers.push(addedPlayer);

      await checkRoster(groupId, roster);

      usedPlayers.usedPlayers = newUsedPlayers;
      await usedPlayers.save();

      const currentRoster = await db.UserRoster.findOne({
        userId,
        groupId,
        week,
        season,
      }).exec();
      const newRoster = [];
      for (const player of roster) {
        newRoster.push({ mySportsId: +player.mySportsId, score: 0 } || 0);
      }
      currentRoster.roster = newRoster;
      await currentRoster.save();
      return currentRoster.roster;
    } catch (err) {
      if (err.status) {
        throw err;
      } else {
        console.log(
          'Error in updateUserRoster. Trying to update user roster: ',
          {
            userId,
            groupId,
            roster,
            droppedPlayer,
            addedPlayer,
            week,
            season,
            position,
            err,
          }
        );
        throw { status: 500, message: 'Error updating roster, please refresh' };
      }
    }
  },
  getAllRostersForGroup: async (season, week, groupId) => {
    try {
      const userRosters = [];
      const group = await db.Group.findById(groupId).lean().exec();
      const allRosters = await getWeeklyGroupRostersCreateIfNotExist(
        season,
        week,
        group
      );
      for (const roster of allRosters) {
        const filledRoster = await mySportsHandler.fillUserRoster(
          roster.roster
        );
        const user = await db.User.findById(roster.userId).exec();
        userRosters.push({
          userId: user._id,
          username: user.username,
          roster: filledRoster,
        });
      }
      const sortedUsers = await sortUsersByScore(userRosters, groupId, season);
      return sortedUsers;
    } catch (err) {
      if (err.status) {
        throw err;
      } else {
        throw {
          status: 500,
          message: 'Error getting all rosters for the group',
        };
      }
    }
  },
  getBlankRostersForGroup: async (rosters) => {
    try {
      const hiddenRoster = rosters[0].roster.map(() => ({
        mySportsId: 0,
        name: '--------- ------------',
        team: '---',
        score: '---',
        lockTooltip: true,
      }));
      const hiddenRosters = rosters.map((userRoster) => ({
        ...userRoster,
        roster: hiddenRoster,
      }));
      return hiddenRosters;
    } catch (err) {
      console.log('Error getting blank rosters: ', { rosters, err });
      throw { status: 500, message: 'Error pulling user rosters' };
    }
  },
  usedPlayersByPosition: async (userId, season, groupId, position) => {
    const usedPlayers = await getUsedPlayers(userId, season, groupId, position);

    try {
      const dbSearch = await db.PlayerData.find(
        { mySportsId: { $in: usedPlayers } },
        { name: 1, position: 1, team: 1, mySportsId: 1 }
      );
      return dbSearch;
    } catch (err) {
      console.log('Error in usedPlayersByPosition: ', {
        userId,
        season,
        groupId,
        position,
        err,
      });
      throw { status: 500, message: 'Database error, please refresh' };
    }
  },
  searchAvailablePlayerByTeam: async (groupId, username, team, season) => {
    try {
      const user = await db.User.findOne({ username }, { _id: 1 });
      const usedPlayersAllPosition = await getUsedPlayersNoPosition(
        user._id,
        season,
        groupId
      );
      const usedPlayers = [];

      for (const position of usedPlayersAllPosition) {
        for (const usedPlayerId of position.usedPlayers) {
          usedPlayers.push(usedPlayerId);
        }
      }

      const availablePlayers = await db.PlayerData.find(
        {
          active: true,
          team: team,
          position: { $ne: 'K' },
          mySportsId: { $nin: usedPlayers },
        },
        { mySportsId: 1, name: 1, position: 1, rank: 1, team: 1, injury: 1 }
      )
        .sort({ rank: 1 })
        .lean()
        .exec();

      return availablePlayers;
    } catch (err) {
      console.log('Error in searchAvailablePlayerByTeam: ', {
        groupId,
        username,
        team,
        season,
        err,
      });
      throw { status: 500, message: 'Error getting available players' };
    }
  },
  userAllRostersForSeason: async function (userId, groupId, season) {
    try {
      const scoredAllSeason = [];

      for (let i = 17; i >= 0; i--) {
        const weeklyUserRoster = await this.getUserRoster(
          userId,
          i + 1,
          season,
          groupId
        );
        scoredAllSeason.push(
          await mySportsHandler.fillUserRoster(weeklyUserRoster)
        );
      }

      return scoredAllSeason;
    } catch (err) {
      if (err.status) {
        throw err;
      } else {
        console.log('Error in userAllRostersForSeason: ', {
          userId,
          groupId,
          season,
          err,
        });
        throw { status: 500, message: 'Error filling out roster' };
      }
    }
  },
  getUserRoster: async (userId, week, season, groupId) => {
    try {
      let roster = await db.UserRoster.findOne(
        { userId, week, season, groupId },
        { roster: 1 }
      )
        .lean()
        .exec();
      if (roster === null) {
        roster = await createWeeklyRoster(userId, week, season, groupId);
      }
      return roster.roster;
    } catch (err) {
      if (err.status) {
        throw err;
      } else {
        console.log('Error in getUserRoster: ', {
          userId,
          week,
          season,
          groupId,
          err,
        });
        throw { status: 500, message: 'Error finding roster' };
      }
    }
  },
  lockPeroid: async () => {
    try {
      const { lockWeek } = await db.SeasonAndWeek.findOne({}, { lockWeek: 1 })
        .lean()
        .exec();
      return { lockWeek };
    } catch (err) {
      console.log('Error in lockPeroid: ', { err });
      throw { status: 404, message: 'Error finding general lock week data' };
    }
  },
  checkTeamLock: async (season, week, team) => {
    try {
      let teamStart = await db.TeamLocked.findOne({
        team: team,
        week: week,
        season: season,
      });
      if (!teamStart) {
        await mySportsHandler.checkGameStarted(season, week);
        teamStart = await db.TeamLocked.findOne({
          team: team,
          week: week,
          season: season,
        });
      }
      const currDate = new Date();
      return currDate < teamStart.startTime;
    } catch (err) {
      console.log('Error in checkTeamLock: ', { season, week, team, err });
      throw { status: 500, message: 'Error checking if team has started' };
    }
  },
  getTotalScore: async (userId) => {
    const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
    try {
      const { totalScore } = await db.UserScores.findOne(
        { userId, season },
        { totalScore: 1 }
      ).exec();
      return totalScore;
    } catch (err) {
      console.log(err);
    }
  },
  scoreAllGroups: async (season, week) => {
    let allGroups;
    try {
      allGroups = await db.Group.find().lean().exec();
    } catch (err) {
      console.log('Error finding all groups: ', {});
      throw { status: 500, message: 'Database connection error' };
    }
    for (const group of allGroups) {
      console.log(`Scoring ${group.name}`);
      let groupScore;
      try {
        groupScore = await db.GroupScore.findOne({ groupId: group._id })
          .lean()
          .exec();
      } catch (err) {
        throw { status: 500, message: 'Database connection error' };
      }
      for (let i = 1; i <= week; i++) {
        try {
          const groupRosters = await getWeeklyGroupRostersCreateIfNotExist(
            season,
            i,
            group._id
          );

          for (const user of groupRosters) {
            await mySportsHandler.updateUserWeeklyAndTotalScore(
              user.roster,
              season,
              i,
              user.userId,
              groupScore,
              group._id
            );
          }
        } catch (err) {
          throw err;
        }
        console.log(`Done scoring week ${i}`);
      }
    }
  },
  rankPlayersBasedOnGroup: async (season, week, groupName) => {
    let groupScore;
    try {
      const { _id } = await db.Group.findOne({ name: groupName }, { _id: 1 })
        .lean()
        .exec();
      groupScore = await db.GroupScore.findOne({ groupId: _id });
    } catch (err) {
      console.log('DB Connection Error in rankPlayersBasedOnGroup: ', {
        season,
        week,
        groupName,
        err,
      });
      throw { status: 500, message: 'Database connection error' };
    }

    console.log('Starting to Rank players');
    try {
      const rankedPlayersByPosition = await mySportsHandler.rankPlayers(
        season,
        week,
        groupScore,
        true
      );
      console.log('Saving player Ranks');
      await mySportsHandler.savePlayerRank(rankedPlayersByPosition);
    } catch (err) {
      throw err;
    }
  },
  getBestUserWeek: async function (groupId, season, maxWeek) {
    let fullSeasonGroupScore;
    try {
      fullSeasonGroupScore = await db.UserScores.find({
        groupId,
        season,
      })
        .lean()
        .exec();
    } catch (err) {
      console.log('Database error in getBestUserWeek: ', {
        groupId,
        season,
        maxWeek,
        err,
      });
      throw { status: 500, message: 'Database connection error' };
    }
    let highestScoringWeek = { score: 0, userId: '', week: 0 };
    for (const userScore of fullSeasonGroupScore) {
      for (let i = 1; i <= maxWeek; i++) {
        if (userScore[i] > highestScoringWeek.score) {
          highestScoringWeek = {
            score: userScore[i].toFixed(2),
            userId: userScore.U.toString(),
            week: i,
          };
        }
      }
    }
    try {
      const highestScoringRoster = await this.getUserRoster(
        highestScoringWeek.userId,
        highestScoringWeek.week,
        season,
        groupId
      );
      const fullRoster = await mySportsHandler.fillUserRoster(
        highestScoringRoster
      );
      const userDetails = await userHandler.getUserByID(highestScoringWeek.U);
      return {
        roster: fullRoster,
        username: userDetails.response.username,
        week: highestScoringWeek.week,
        score: highestScoringWeek.score,
      };
    } catch (err) {
      throw err;
    }
  },
  getBestIdealRoster: async function (groupId, season, maxWeek) {
    try {
      const bestIdealRoster = { roster: [], week: 0, season: '' };
      for (let i = 1; i <= maxWeek; i++) {
        const idealRoster = await groupHandler.getIdealRoster(
          groupId,
          season,
          i
        );
        let idealRosterScore = 0;
        for (let player of idealRoster.roster) {
          idealRosterScore += +player.score;
        }
        if (idealRosterScore > bestIdealRoster.score) {
          bestIdealRoster.roster = idealRoster.roster;
          bestIdealRoster.week = i;
          bestIdealRoster.score = idealRosterScore.toFixed(2);
        }
      }
      const fullRoster = await mySportsHandler.fillUserRoster(
        bestIdealRoster.roster
      );
      return {
        roster: fullRoster,
        week: bestIdealRoster.week,
        score: bestIdealRoster.score,
      };
    } catch (err) {
      throw err;
    }
  },
  getBestScorePlayerByUser: async function (groupId, season) {
    let fullSeasonGroupScore;
    try {
      fullSeasonGroupScore = await db.UserRoster.find({
        groupId,
        season,
      }).exec();
    } catch (err) {
      console.log('Database connection error in getBestScorePlayerByUser: ', {
        groupId,
        season,
        err,
      });
      throw { status: 500, message: 'Database connection error' };
    }
    const bestScore = { userId: '', week: 0, score: 0, mySportsId: 0 };
    for (const userRoster of fullSeasonGroupScore) {
      for (const player of userRoster.roster) {
        if (player.score > bestScore.score) {
          bestScore.mySportsId = player.mySportsId;
          bestScore.score = player.score;
          bestScore.week = userRoster.week;
          bestScore.userId = userRoster.userId.toString();
        }
      }
    }
    let player;
    try {
      player = await db.PlayerData.findOne(
        { mySportsId: bestScore.mySportsId },
        { name: 1, team: 1, position: 1 }
      )
        .lean()
        .exec();
    } catch (err) {
      console.log('Database connection error in getBestScorePlayerByUser: ', {
        groupId,
        season,
        err,
      });
      throw { status: 500, message: 'Database connection error' };
    }
    let userDetails;
    try {
      userDetails = await userHandler.getUserByID(bestScore.userId);
    } catch (err) {
      throw err;
    }
    return {
      player: player,
      username: userDetails.response.username,
      week: bestScore.week,
      score: bestScore.score,
    };
  },
};
