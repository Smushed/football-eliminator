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
  let result = false;
  let searched;
  switch (checkedField) {
    case 'userRoster':
      try {
        searched = await db.UserRoster.findOne({
          userId,
          week,
          groupId,
          season,
        }).exec();
        if (searched !== null) {
          return true;
        }
      } catch (err) {
        console.log(err);
      }
      break;
    case 'usedPlayers':
      try {
        searched = await db.UsedPlayers.findOne({
          userId,
          season,
          groupId,
          position,
        }).exec();
        if (searched !== null) {
          return true;
        }
      } catch (err) {
        console.log(err);
      }
      break;
  }
  return result;
};

const checkForAvailablePlayers = (usedPlayers, searchedPlayers) => {
  const usedPlayerSet = new Set(usedPlayers);

  const availablePlayerArray = searchedPlayers.filter(
    (player) => !usedPlayerSet.has(player.mySportsId)
  );

  const sortedPlayerArray = sortPlayersByRank(availablePlayerArray);

  return sortedPlayerArray;
};

const sortPlayersByRank = (playerArray) => {
  playerArray.sort((a, b) => {
    return a.rank - b.rank;
  });
  return playerArray;
};

const getUsedPlayers = async (userId, season, groupId, position) => {
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
};

const getUsedPlayersNoPosition = async (userId, season, groupId) => {
  const usedPlayers = await db.UsedPlayers.find({
    userId,
    season,
    groupId,
  }).exec();
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
        createUsedPlayers(userId, season, groupId, key);
      }
    }
  }
  return usedPlayers;
};

const createUsedPlayers = (userId, season, groupId, position) =>
  new Promise(async (res, rej) => {
    const isDupe = await checkDuplicateRoster(
      'usedPlayers',
      userId,
      groupId,
      season,
      null,
      position
    );
    if (!isDupe) {
      res(
        await db.UsedPlayers.create({
          userId,
          season,
          groupId,
          position,
        }).exec()
      );
    }
  });

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
    });
    throw { status: 500, message: 'Error saving weekly roster' };
  }
};

const getWeeklyGroupRostersCreateIfNotExist = async (season, week, group) =>
  new Promise(async (res) => {
    try {
      const userRosters = await db.UserRoster.find({
        season: season,
        week: week,
        groupId: group._id,
      })
        .lean()
        .exec();
      const completeRosters = userRosters.slice(0);
      const userIdArray = userRosters.map((roster) => roster.userId);
      if (group.userlist.length !== userRosters.length) {
        for (const user of group.userlist) {
          if (!userIdArray.includes(user.userId)) {
            completeRosters.push(
              await createWeeklyRoster(user.userId, week, season, group._id)
            );
          }
        }
      }
      res(completeRosters);
    } catch (err) {
      console.log('Error get / creating weekly user roster:', {
        season,
        week,
        group,
      });
      if (err.status === 500) {
        throw err;
      } else {
        throw { status: 500, message: 'Error pulling weekly rosters' };
      }
    }
  });

const sortUsersByScore = async (userRosterArray, groupId, season) =>
  new Promise(async (res) => {
    const sortedScores = [];
    for (let user of userRosterArray) {
      //TODO One pull from DB
      const userScore = await db.UserScores.findOne(
        { userId: user.userId, groupId: groupId, season: season },
        { totalScore: 1 }
      ).exec();
      if (!userScore) {
        continue;
      }
      sortedScores.push({
        userId: user.userId,
        username: user.username,
        roster: user.roster,
        totalScore: userScore.totalScore,
      });
    }
    sortedScores.sort((a, b) => b.totalScore - a.totalScore);
    res(sortedScores);
  });

const checkRoster = async (groupId, newRoster) =>
  new Promise(async (res, rej) => {
    const groupPositions = await groupHandler.getGroupPositions(groupId);
    const mappedPositions = await groupHandler.mapGroupPositions(
      groupPositions,
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
      res({ valid: false, message: 'Too many players on roster' });
      return;
    }
    for (const player of newRoster) {
      if (player.mySportsId === 0) {
        continue;
      }
      //TODO One DB pull
      const { position } = await db.PlayerData.findOne(
        {
          mySportsId: player.mySportsId,
        },
        { position: 1 }
      )
        .lean()
        .exec();
      currentPositionsOnRoster[position]++;
    }

    for (const position of positions.positionArray) {
      if (maxPositionCount[position] < currentPositionsOnRoster[position]) {
        res({ valid: false, message: `Too many ${position} for your roster` });
        return;
      }
    }
    res({ valid: true, message: 'Valid Roster' });
  });

export default {
  dummyRoster: async (userId, groupId, week, season, dummyRoster) => {
    return new Promise((res, rej) => {
      db.UserRoster.findOne(
        { userId, groupId, week, season },
        async (err, userRoster) => {
          if (userRoster === null) {
            userRoster = await db.UserRoster.create({
              userId,
              groupId,
              week,
              season,
            }).exec();
          }
          const usedPlayers = await db.UsedPlayers.findOne({
            userId,
            season,
            groupId,
          }).exec();
          if (usedPlayers === null) {
            usedPlayers = createUsedPlayers(userId, season, groupId);
          }
          //Create a set of players currently in the week. We want to pull them out of the UsedPlayer Array when we update them
          const rosterArray = Object.values(userRoster.roster);
          const currentRoster = new Set(
            rosterArray.filter((playerId) => playerId !== 0)
          );
          const currentUsedPlayerArray = usedPlayers.usedPlayers;
          //filter out all the players who are being pulled from the current week
          const updatedUsedPlayers = currentUsedPlayerArray.filter(
            (playerId) => !currentRoster.has(+playerId)
          );

          //Add in all the players from the new players to the used player array
          const dummyRosterArray = Object.values(dummyRoster);

          for (const player of dummyRosterArray) {
            if (parseInt(player) !== 0) {
              updatedUsedPlayers.push(player);
            }
          }

          usedPlayers.usedPlayers = updatedUsedPlayers;
          usedPlayers.save((err, result) => {
            if (err) {
              console.log(err);
            }
          });
        }
      );
      userRoster.roster = dummyRoster;
      userRoster.save((err, result) => {
        if (err) {
          console.log(err);
        } else {
          res(result);
        }
      });
    });
  },
  availablePlayers: async (userId, searchedPosition, season, groupId) => {
    const usedPlayers = await getUsedPlayers(
      userId,
      season,
      groupId,
      searchedPosition
    );

    //TODO This should be a non inclusive search, finding players that are available rather than getting ALL players and filtering them down
    const searchedPlayers = await db.PlayerData.find(
      { active: true, position: searchedPosition },
      { mySportsId: 1, name: 1, position: 1, rank: 1, team: 1, injury: 1 }
    )
      .lean()
      .exec();

    //TODO Rather than iterate through the list here. Should speed up the original
    const availablePlayers = checkForAvailablePlayers(
      usedPlayers,
      searchedPlayers
    );

    return availablePlayers;
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
  ) =>
    new Promise(async (res, rej) => {
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
          rej("You've already used this player");
          return;
        } else if (playerId !== +droppedPlayer) {
          newUsedPlayers.push(playerId);
        }
      }
      newUsedPlayers.push(addedPlayer);
      const validCheck = await checkRoster(groupId, roster);
      if (validCheck.valid === false) {
        rej(validCheck.message);
        return;
      }
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
      res(currentRoster.roster);
    }),
  getAllRostersForGroup: async (season, week, groupId) =>
    new Promise(async (res, rej) => {
      try {
        const userRosters = [];
        const group = await db.Group.findById(groupId);
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
        const sortedUsers = await sortUsersByScore(
          userRosters,
          groupId,
          season
        );
        res(sortedUsers);
      } catch (err) {
        if (err.status === 500) {
          console.log('Error pulling all rosters for group:', {
            season,
            week,
            groupId,
          });
          throw err;
        } else {
          throw {
            status: 500,
            message: 'Error getting all rosters for the group',
          };
        }
      }
    }),
  usedPlayersByPosition: async (userId, season, groupId, position) => {
    const usedPlayers = await getUsedPlayers(userId, season, groupId, position);

    try {
      const dbSearch = await db.PlayerData.find(
        { mySportsId: { $in: usedPlayers } },
        { name: 1, position: 1, team: 1, mySportsId: 1 }
      );
      return dbSearch;
    } catch (err) {
      console.log(err);
      return { status: 500, res: 'DB Searching Error' };
    }
  },
  searchAvailablePlayerByTeam: async (groupId, username, team, season) => {
    const user = await db.User.findOne({ username }, { _id: 1 });
    const usedPlayers = await getUsedPlayersNoPosition(
      user._id,
      season,
      groupId
    );

    const playersByTeam = await db.PlayerData.find(
      { active: true, team: team, P: { $ne: 'K' } },
      { mySportsId: 1, name: 1, position: 1, rank: 1, team: 1, injury: 1 }
    );

    const availablePlayers = checkForAvailablePlayers(
      usedPlayers,
      playersByTeam
    );

    return availablePlayers;
  },
  userAllRostersForSeason: async function (userId, groupId, season) {
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
  },
  getUserRoster: async (userId, week, season, groupId) => {
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
  },
  lockPeroid: async () => {
    try {
      const { lockWeek } = await db.SeasonAndWeek.findOne({}, { lockWeek: 1 })
        .lean()
        .exec();
      return { lockWeek };
    } catch (err) {
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
      console.log(err);
      return false;
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
    const allGroups = await db.Group.find().lean().exec();
    for (const group of allGroups) {
      console.log(`Scoring ${group.name}`);
      const groupScore = await db.GroupScore.findOne({ groupId: group._id })
        .lean()
        .exec();
      for (let i = 1; i <= week; i++) {
        const groupRosters = await getWeeklyGroupRostersCreateIfNotExist(
          season,
          i,
          group
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
        console.log(`Done scoring week ${i}`);
      }
    }
  },
  rankPlayersBasedOnGroup: async (season, week, groupName) => {
    const { _id } = await db.Group.findOne({ name: groupName }, { _id: 1 })
      .lean()
      .exec();
    const groupScore = await db.GroupScore.findOne({ groupId: _id });
    console.log('Starting to Rank players');
    const rankedPlayersByPosition = await mySportsHandler.rankPlayers(
      season,
      week,
      groupScore,
      true
    );
    console.log('Saving player Ranks');
    await mySportsHandler.savePlayerRank(rankedPlayersByPosition);
  },
  getBestUserWeek: async function (groupId, season, maxWeek) {
    const fullSeasonGroupScore = await db.UserScores.find({
      groupId,
      season,
    })
      .lean()
      .exec();
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
  },
  getBestIdealRoster: async function (groupId, season, maxWeek) {
    const bestIdealRoster = { roster: [], week: 0, season: '' };
    for (let i = 1; i <= maxWeek; i++) {
      const idealRoster = await groupHandler.getIdealRoster(groupId, season, i);
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
  },
  getBestScorePlayerByUser: async function (groupId, season) {
    const fullSeasonGroupScore = await db.UserRoster.find({
      groupId,
      season,
    }).exec();
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
    const player = await db.PlayerData.findOne(
      { mySportsId: bestScore.mySportsId },
      { name: 1, team: 1, position: 1 }
    )
      .lean()
      .exec();
    const userDetails = await userHandler.getUserByID(bestScore.userId);
    return {
      player: player,
      username: userDetails.response.username,
      week: bestScore.week,
      score: bestScore.score,
    };
  },
};
