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
    case `userRoster`:
      try {
        searched = await db.UserRoster.findOne({
          U: userId,
          W: week,
          G: groupId,
          S: season,
        }).exec();
        if (searched !== null) {
          return true;
        }
      } catch (err) {
        console.log(err);
      }
      break;
    case `usedPlayers`:
      try {
        searched = await db.UsedPlayers.findOne({
          U: userId,
          S: season,
          G: groupId,
          P: position,
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
    (player) => !usedPlayerSet.has(player.M)
  );

  const sortedPlayerArray = sortPlayersByRank(availablePlayerArray);

  return sortedPlayerArray;
};

const sortPlayersByRank = (playerArray) => {
  playerArray.sort((a, b) => {
    return a.R - b.R;
  });
  return playerArray;
};

const getUsedPlayers = async (userId, season, groupId, position) => {
  const currentUser = await db.UsedPlayers.findOne({
    U: userId,
    S: season,
    G: groupId,
    P: position,
  }).exec();
  if (currentUser === null) {
    const createdUsedPlayers = await createUsedPlayers(
      userId,
      season,
      groupId,
      position
    );
    return createdUsedPlayers.UP;
  } else {
    return currentUser.UP;
  }
};

const getUsedPlayersNoPosition = async (userId, season, groupId) => {
  const usedPlayers = await db.UsedPlayers.find({
    U: userId,
    S: season,
    G: groupId,
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
      hasUsedPlayers[dbUsedPlayer.P] = true;
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
      `usedPlayers`,
      userId,
      groupId,
      season,
      null,
      position
    );
    if (!isDupe) {
      res(
        await db.UsedPlayers.create({
          U: userId,
          S: season,
          G: groupId,
          P: position,
        })
      );
    }
  });

const checkDupeWeeklyRoster = async (userId, week, season, groupId) => {
  const search = await db.UserRoster.findOne({
    U: userId,
    W: week,
    S: season,
    G: groupId,
  }).exec();
  if (search !== null) {
    return true;
  } else {
    return false;
  }
};

const createWeeklyRoster = async function (userId, week, season, groupId) {
  const groupRoster = await db.GroupRoster.findOne({ G: groupId });
  //The roster on the UserRoster Schema is an array of MySportsPlayerIDs
  const dupe = await checkDupeWeeklyRoster(userId, week, season, groupId);
  if (dupe) {
    return false;
  }

  const userRoster = groupRoster.P.map((position) => ({ M: 0, S: 0 }));
  const weeksRoster = {
    U: userId,
    W: week,
    S: season,
    G: groupId,
    R: userRoster,
  };
  return await db.UserRoster.create(weeksRoster);
};

const getAllRostersByGroupAndWeek = async (season, week, groupId) =>
  new Promise(async (res, rej) => {
    const group = await db.Group.findById([groupId]).exec();
    const userRosters = await db.UserRoster.find({
      S: season,
      W: week,
      G: groupId,
    }).exec();
    const completeRosters = userRosters.slice(0);
    if (group.UL.length !== userRosters.length) {
      for (let user of group.UL) {
        let isIncluded = false;
        for (let userRoster of userRosters) {
          if (userRoster.U.toString() === user.ID.toString()) {
            isIncluded = true;
          }
        }
        if (!isIncluded) {
          completeRosters.push(
            await createWeeklyRoster(user.ID, week, season, groupId)
          );
        }
      }
    }
    res(completeRosters);
  });

const sortUsersByScore = async (userRosterArray, groupId, season) =>
  new Promise(async (res) => {
    const sortedScores = [];
    for (let user of userRosterArray) {
      const userScore = await db.UserScores.findOne(
        { U: user.UID, G: groupId, S: season },
        'TS'
      ).exec();
      if (!userScore) {
        continue;
      }
      sortedScores.push({
        UID: user.UID,
        UN: user.UN,
        R: user.R,
        TS: userScore.TS,
      });
    }
    sortedScores.sort((a, b) => b.TS - a.TS);
    res(sortedScores);
  });

const pullGroupRostersForScoring = async (season, week, groupId) =>
  new Promise(async (res, rej) => {
    const allRosters = await getAllRostersByGroupAndWeek(season, week, groupId);
    res(allRosters);
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
      if (player.M === 0) {
        continue;
      }
      const { P } = await db.PlayerData.findOne({ M: player.M }).exec();
      currentPositionsOnRoster[P]++;
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
    //Brute force updating a user's roster
    return new Promise((res, rej) => {
      db.UserRoster.findOne(
        { U: userId, G: groupId, W: week, S: season },
        async (err, userRoster) => {
          if (userRoster === null) {
            userRoster = await db.UserRoster.create({
              U: userId,
              G: groupId,
              W: week,
              S: season,
            });
          }
          await db.UsedPlayers.findOne(
            { U: userId, S: season, G: groupId },
            async (err, usedPlayers) => {
              if (usedPlayers === null) {
                usedPlayers = createUsedPlayers(userId, season, groupId);
              }
              //Create a set of players currently in the week. We want to pull them out of the UsedPlayer Array when we update them
              const rosterArray = Object.values(userRoster.R);
              const currentRoster = new Set(
                rosterArray.filter((playerId) => playerId !== 0)
              );
              const currentUsedPlayerArray = usedPlayers.UP;
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

              usedPlayers.UP = updatedUsedPlayers;
              usedPlayers.save((err, result) => {
                if (err) {
                  console.log(err);
                }
              });
            }
          );
          userRoster.R = dummyRoster;
          userRoster.save((err, result) => {
            if (err) {
              console.log(err);
            } else {
              res(result);
            }
          });
        }
      );
    });
  },
  availablePlayers: async (userId, searchedPosition, season, groupId) => {
    const usedPlayers = await getUsedPlayers(
      userId,
      season,
      groupId,
      searchedPosition
    );

    //usedPlayers is the array from the database of all players that the user has used
    //We need to grab ALL the playerIds that are currently active in the database and pull out any that are in the usedPlayers array
    const searchedPlayers = await db.PlayerData.find(
      { A: true, P: searchedPosition },
      { M: 1, N: 1, P: 1, R: 1, T: 1, I: 1 }
    ).exec();
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
        U: userId,
        S: season,
        G: groupId,
        P: position,
      }).exec();
      if (usedPlayers === null) {
        usedPlayers = await createUsedPlayers(
          userId,
          season,
          groupId,
          position
        );
      }

      //Check User Roster Here

      let newUsedPlayers = [];
      for (const playerId of usedPlayers.UP) {
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
        console.log('inside valid');
        rej(validCheck.message);
        return;
      }
      usedPlayers.UP = newUsedPlayers;
      await usedPlayers.save();

      const currentRoster = await db.UserRoster.findOne({
        U: userId,
        G: groupId,
        W: week,
        S: season,
      }).exec();
      const newRoster = [];
      for (const player of roster) {
        newRoster.push({ M: +player.M, S: 0 } || 0);
      }
      currentRoster.R = newRoster;
      await currentRoster.save();
      res(currentRoster.R);
    }),
  getAllRostersForGroup: async (season, week, groupId) =>
    new Promise(async (res, rej) => {
      const userRosters = [];
      const allRosters = await getAllRostersByGroupAndWeek(
        season,
        week,
        groupId
      );
      for (const roster of allRosters) {
        const filledRoster = await mySportsHandler.fillUserRoster(roster.R);
        const user = await db.User.findById(roster.U);
        userRosters.push({ UID: user._id, UN: user.UN, R: filledRoster });
      }
      const sortedUsers = await sortUsersByScore(userRosters, groupId, season);
      res(sortedUsers);
    }),
  usedPlayersByPosition: async (userId, season, groupId, position) => {
    const usedPlayers = await getUsedPlayers(userId, season, groupId, position);

    try {
      dbSearch = await db.PlayerData.find(
        { M: { $in: usedPlayers } },
        { N: 1, P: 1, T: 1, M: 1 }
      );
    } catch (err) {
      console.log(err);
      return { status: 500, res: 'DB Searching Error' };
    }

    return dbSearch;
  },
  searchAvailablePlayerByTeam: async (groupId, userId, team, season) => {
    const usedPlayers = await getUsedPlayersNoPosition(userId, season, groupId);

    const playersByTeam = await db.PlayerData.find(
      { A: true, T: team, P: { $ne: 'K' } },
      { M: 1, N: 1, P: 1, R: 1, T: 1, I: 1 }
    );

    const availablePlayers = checkForAvailablePlayers(
      usedPlayers,
      playersByTeam
    );

    return availablePlayers;
  },
  allSeasonRoster: async function (userId, season) {
    //This goes through a users data and get each week
    const scoredAllSeason = [];

    //Go to 16 because the javascript needs to start at 0. Just account for it here and on the front end
    for (let i = 16; i >= 0; i--) {
      const weeklyUserRoster = await this.userRoster(userId, i + 1, season);
      const parsedWeeklyRoster = [];

      for (let ii = 0; ii < weeklyUserRoster.length; ii++) {
        const newPlayer = {
          full_name: weeklyUserRoster[ii].full_name,
          team: weeklyUserRoster[ii].team,
          position: weeklyUserRoster[ii].position,
          mySportsId: weeklyUserRoster[ii].mySportsId,
        };

        const playerScore = await mySportsHandler.getPlayerWeeklyScore(
          newPlayer.mySportsId,
          season,
          i + 1
        );

        newPlayer.score = playerScore.toFixed(2);

        parsedWeeklyRoster.push(newPlayer);
      }
      scoredAllSeason[i] = parsedWeeklyRoster;
    }

    return scoredAllSeason;
  },
  getUserRoster: async (userId, week, season, groupId) => {
    //This grabs the user roster, and if not it creates one.
    let roster = await db.UserRoster.findOne(
      { U: userId, W: week, S: season, G: groupId },
      { R: 1 }
    );
    if (roster === null) {
      roster = await createWeeklyRoster(userId, week, season, groupId);
    }
    return roster.R;
  },
  lockPeroid: async () => {
    try {
      const currData = await db.SeasonAndWeek.findOne();
      return { LW: currData.LW };
    } catch (err) {
      return false;
    }
  },
  checkTeamLock: async (season, week, team) => {
    try {
      let teamStart = await db.TeamLocked.findOne({
        T: team,
        W: week,
        S: season,
      });
      if (!teamStart) {
        await mySportsHandler.checkGameStarted(season, week);
        teamStart = await db.TeamLocked.findOne({
          T: team,
          W: week,
          S: season,
        });
      }
      const currDate = new Date();
      return currDate < teamStart.ST;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getTotalScore: async (userId) => {
    const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
    let userScore;
    try {
      userScore = await db.UserScores.findOne(
        { U: userId, S: season },
        { TS: 1 }
      ).exec();
    } catch (err) {
      console.log(err);
    }
    return userScore.TS;
  },
  scoreAllGroups: async (season, week) => {
    const allGroups = await groupHandler.getAllGroups();
    for (let group of allGroups) {
      console.log(`scoring ${group.N}`);
      let groupScore;
      for (let i = 1; i <= week; i++) {
        const groupRosters = await pullGroupRostersForScoring(
          season,
          i,
          group._id
        );
        groupScore = await groupHandler.getGroupScore(group._id);
        await mySportsHandler.calculateWeeklyScore(
          groupRosters,
          season,
          i,
          group._id,
          groupScore
        );
        console.log(`done scoring week ${i}`);
      }
      if (group.N === `Eliminator`) {
        console.log('Starting to Rank players');
        const rankedPlayers = await mySportsHandler.rankPlayers(
          season,
          week,
          groupScore,
          true
        );
        console.log('Saving player Ranks');
        await mySportsHandler.savePlayerRank(rankedPlayers);
      }
    }
  },
  getBestUserWeek: async function (groupId, season, maxWeek) {
    const fullSeasonGroupScore = await db.UserScores.find({
      G: groupId,
      S: season,
    }).exec();
    let highestScoringWeek = { S: 0, U: ``, W: 0 };
    for (const userScore of fullSeasonGroupScore) {
      for (let i = 1; i <= maxWeek; i++) {
        if (userScore[i] > highestScoringWeek.S) {
          highestScoringWeek = {
            S: userScore[i].toFixed(2),
            U: userScore.U.toString(),
            W: i,
          };
        }
      }
    }
    const highestScoringRoster = await this.getUserRoster(
      highestScoringWeek.U,
      highestScoringWeek.W,
      season,
      groupId
    );
    const fullRoster = await mySportsHandler.fillUserRoster(
      highestScoringRoster
    );
    const userDetails = await userHandler.getUserByID(highestScoringWeek.U);
    return {
      R: fullRoster,
      UN: userDetails.response.UN,
      W: highestScoringWeek.W,
      SC: highestScoringWeek.S,
    };
  },
  getBestIdealRoster: async function (groupId, season, maxWeek) {
    // const groupScore = await groupHandler.getGroupScore(groupId);
    const bestIdealRoster = { R: [], U: ``, W: 0, S: 0 };
    for (let i = 1; i <= maxWeek; i++) {
      const idealRoster = await groupHandler.getIdealRoster(groupId, season, i);
      let idealRosterScore = 0;
      for (let player of idealRoster.R) {
        idealRosterScore += +player.SC;
      }
      if (idealRosterScore > bestIdealRoster.S) {
        bestIdealRoster.R = idealRoster.R;
        bestIdealRoster.W = i;
        bestIdealRoster.S = idealRosterScore.toFixed(2);
      }
    }
    const fullRoster = await mySportsHandler.fillUserRoster(bestIdealRoster.R);
    return {
      R: fullRoster,
      W: bestIdealRoster.W,
      SC: bestIdealRoster.S,
    };
  },
  getBestScorePlayerByUser: async function (groupId, season) {
    const fullSeasonGroupScore = await db.UserRoster.find({
      G: groupId,
      S: season,
    }).exec();
    const bestScore = { userId: ``, week: 0, score: 0, mySportsId: 0 };
    for (const userRoster of fullSeasonGroupScore) {
      for (const player of userRoster.R) {
        if (player.SC > bestScore.score) {
          bestScore.mySportsId = player.M;
          bestScore.score = player.SC;
          bestScore.week = userRoster.W;
          bestScore.userId = userRoster.U.toString();
        }
      }
    }
    const player = await db.PlayerData.findOne(
      { M: bestScore.mySportsId },
      { N: 1, T: 1, P: 1 }
    ).exec();
    const userDetails = await userHandler.getUserByID(bestScore.userId);
    return {
      P: player,
      UN: userDetails.response.UN,
      W: bestScore.week,
      SC: bestScore.score,
    };
  },
};
