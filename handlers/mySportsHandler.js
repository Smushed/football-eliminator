const db = require(`../models`);
const axios = require(`axios`);
const positions = require(`../constants/positions`);
const scoringSystem = require(`../constants/scoringSystem`);
const s3Handler = require(`./s3Handler`);
const nflTeams = require('../constants/nflTeams');
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API;

const playerScoreHandler = async (playerId, season, week, groupScore) => {
  return new Promise(async (res, rej) => {
    const playerStats = await db.PlayerStats.findOne({
      M: playerId,
      W: week,
      S: season,
    }).exec();
    let weeklyScore = 0;

    if (playerStats) {
      for (let bucket of scoringSystem.buckets) {
        for (let field of scoringSystem[bucket])
          weeklyScore += calculateScore(
            playerStats[bucket][field],
            groupScore[bucket][field]
          );
      }
    }

    res(weeklyScore);
  });
};

const calculateScore = (playerStat, groupScore) => {
  if (typeof playerStat === `undefined`) {
    return 0;
  }
  return playerStat * groupScore;
};

const capitalizeFirstLetter = (str) => {
  const strArr = str.split(` `);
  for (let i = 0; i < strArr.length; i++) {
    strArr[i] = strArr[i].charAt(0).toUpperCase() + strArr[i].slice(1);
  }
  return strArr.join(` `);
};

const addPlayerData = (player, team, stats, season, week) => {
  return new Promise(async (res, rej) => {
    let injury = null;
    if (player.currentInjury) {
      injury = {
        PP: player.currentInjury.playingProbability,
        D: capitalizeFirstLetter(player.currentInjury.description),
      };
    }
    const espnMapping = await parsePlayerExternalMappings(
      player.externalMappings
    );
    db.PlayerData.create(
      {
        N: `${player.firstName} ${player.lastName}`,
        M: parseInt(player.id),
        T: team,
        P: player.primaryPosition || player.position,
        A: true,
        R: 7,
        I: injury,
        E: espnMapping,
      },
      function (err, newPlayer) {
        if (err) {
          console.log(err);
        }
        //If we are adding a new player from the weekly update we cascade it down to add their stats
        if (stats) {
          addWeeksStats(newPlayer.M, stats, season, week);
        }
        res(newPlayer.M);
      }
    );
  });
};

const findPlayerInDB = async (playerID) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (res, rej) => {
    try {
      const playerInDB = await db.PlayerData.findOne({ M: playerID }).exec();
      //First check if the player is currently in the database
      if (playerInDB === null) {
        res(false);
      } else {
        res(playerInDB);
      }
    } catch (err) {
      //TODO Do something more with the error
      console.log(`what`, err);
    }
  });
};

const checkForWeeklyStats = async (mySportsId, stats, season, week) => {
  //If the player already has a record in the database, return it so we can update it.
  //If not return false so we can write a new record
  const player = await db.PlayerStats.findOne({
    M: mySportsId,
    W: week,
    S: season,
  });
  if (!player) {
    return false;
  }
  updateWeekStats(player, stats);

  return true;
};

const newWeeklyStats = (mySportsId, stats, season, week) => {
  //We need this because sometimes the object from MySports doesn't include parts (IE no kicking stats)
  const player = new db.PlayerStats();
  player.M = parseInt(mySportsId);
  player.S = season;
  player.W = parseInt(week);
  player.P = {};
  player.RU = {};
  player.RE = {};
  player.F = 0;
  player.FG = {};

  if (stats.passing) {
    player.P = {
      T: stats.passing.passTD || 0,
      Y: stats.passing.passYards || 0,
      I: stats.passing.passInt || 0,
      A: stats.passing.passAttempts || 0,
      C: stats.passing.passCompletions || 0,
      '2P': stats.twoPointAttempts.twoPtPassMade || 0,
    };
  } else {
    player.P = {
      T: 0,
      Y: 0,
      I: 0,
      A: 0,
      C: 0,
      '2P': 0,
    };
  }

  if (stats.rushing) {
    player.RU = {
      A: stats.rushing.rushAttempts || 0,
      Y: stats.rushing.rushYards || 0,
      T: stats.rushing.rushTD || 0,
      20: stats.rushing.rush20Plus || 0,
      40: stats.rushing.rush40Plus || 0,
      F: stats.rushing.rushFumbles || 0,
      '2P': stats.twoPointAttempts.twoPtRushMade || 0,
    };
  } else {
    player.RU = {
      A: 0,
      Y: 0,
      T: 0,
      20: 0,
      40: 0,
      F: 0,
      '2P': 0,
    };
  }

  if (stats.receiving) {
    player.RE = {
      TA: stats.receiving.targets || 0,
      R: stats.receiving.receptions || 0,
      Y: stats.receiving.recYards || 0,
      T: stats.receiving.recTD || 0,
      20: stats.receiving.rec20Plus || 0,
      40: stats.receiving.rec40Plus || 0,
      F: stats.receiving.recFumbles || 0,
      '2P': stats.twoPointAttempts.twoPtPassRec || 0,
    };
  } else {
    player.RE = {
      TA: 0,
      R: 0,
      Y: 0,
      T: 0,
      20: 0,
      40: 0,
      F: 0,
      '2P': 0,
    };
  }

  if (stats.fumbles) {
    player.F = {
      F: stats.fumbles.fumLost || 0,
    };
  } else {
    player.F = {
      F: 0,
    };
  }

  if (stats.fieldGoals) {
    player.FG = {
      1: stats.fieldGoals.fgMade1_19 || 0,
      20: stats.fieldGoals.fgMade20_29 || 0,
      30: stats.fieldGoals.fgMade30_39 || 0,
      40: stats.fieldGoals.fgMade40_49 || 0,
      50: stats.fieldGoals.fgMade50Plus || 0,
      X: stats.extraPointAttempts.xpMade || 0,
    };
  } else {
    player.FG = {
      1: 0,
      20: 0,
      30: 0,
      40: 0,
      50: 0,
      X: 0,
    };
  }

  player.save(function (err) {
    if (err) {
      console.log(err);
    }
  });

  return;
};

const updateWeekStats = (player, stats) => {
  if (stats.passing) {
    player.P = {
      T: stats.passing.passTD || 0,
      Y: stats.passing.passYards || 0,
      I: stats.passing.passInt || 0,
      A: stats.passing.passAttempts || 0,
      C: stats.passing.passCompletions || 0,
      '2P': stats.twoPointAttempts.twoPtPassMade || 0,
    };
  }

  if (stats.rushing) {
    player.RU = {
      A: stats.rushing.rushAttempts || 0,
      Y: stats.rushing.rushYards || 0,
      T: stats.rushing.rushTD || 0,
      20: stats.rushing.rush20Plus || 0,
      40: stats.rushing.rush40Plus || 0,
      F: stats.rushing.rushFumbles || 0,
      '2P': stats.twoPointAttempts.twoPtRushMade || 0,
    };
  }

  if (stats.receiving) {
    player.RE = {
      TA: stats.receiving.targets || 0,
      R: stats.receiving.receptions || 0,
      Y: stats.receiving.recYards || 0,
      T: stats.receiving.recTD || 0,
      20: stats.receiving.rec20Plus || 0,
      40: stats.receiving.rec40Plus || 0,
      F: stats.receiving.recFumbles || 0,
      '2P': stats.twoPointAttempts.twoPtPassRec || 0,
    };
  }

  if (stats.fumbles) {
    player.F = {
      F: stats.fumbles.fumLost || 0,
    };
  }

  if (stats.fieldGoals) {
    player.FG = {
      1: stats.fieldGoals.fgMade1_19 || 0,
      20: stats.fieldGoals.fgMade20_29 || 0,
      30: stats.fieldGoals.fgMade30_39 || 0,
      40: stats.fieldGoals.fgMade40_49 || 0,
      50: stats.fieldGoals.fgMade50Plus || 0,
      X: stats.extraPointAttempts.xpMade || 0,
    };
  }

  player.save(function (err) {
    if (err) {
      console.log(err);
    }
  });

  return;
};

const addWeeksStats = async (mySportsId, stats, season, week) => {
  //First check if there are already are stats, if so, update it
  const exists = await checkForWeeklyStats(mySportsId, stats, season, week);
  //If not, then create a new
  if (!exists) {
    newWeeklyStats(mySportsId, stats, season, week);
  }

  return;
};

const parsePlayerExternalMappings = (mappingArray) =>
  new Promise((res) => {
    let espnMapping = null;
    for (let mapping of mappingArray) {
      if (mapping.source === `ESPN`) {
        espnMapping = mapping.id;
      }
    }
    res(espnMapping);
  });

//Goes through the roster of the team and pulls out all offensive players
const parseRoster = async (playerArray, team) => {
  const totalPlayerArray = [];
  for (let i = 0; i < playerArray.length; i++) {
    const position =
      playerArray[i].player.primaryPosition || playerArray[i].player.position;
    if (
      position === `QB` ||
      position === `TE` ||
      position === `WR` ||
      position === `RB` ||
      position === `K`
    ) {
      let dbPlayer = await findPlayerInDB(playerArray[i].player.id);
      if (dbPlayer === false || dbPlayer === undefined || dbPlayer === null) {
        dbPlayer = await addPlayerData(playerArray[i].player, team);
      } else {
        let injury = null;
        if (playerArray[i].player.currentInjury !== null) {
          injury = {
            D: playerArray[i].player.currentInjury.description,
            PP: playerArray[i].player.currentInjury.playingProbability,
          };
        }
        const espnMapping = await parsePlayerExternalMappings(
          playerArray[i].player.externalMappings
        );
        const currTeam = playerArray[i].player.currentTeam
          ? playerArray[i].player.currentTeam.abbreviation
          : null;
        await updatePlayer(
          playerArray[i].player.id,
          currTeam,
          injury,
          position,
          espnMapping
        );
      }
      totalPlayerArray.push(dbPlayer.M);
    }
  }
  const dbNFLRoster = await db.PlayerData.find({ T: team }).exec();
  //Iterate through the players we have sitting in the database
  //Take out all the players which we just wrote to the database and update all the rest to be inactive
  const totalPlayerArrayIds = new Set(totalPlayerArray);
  const inactivePlayerArray = dbNFLRoster.filter(
    (player) => !totalPlayerArrayIds.has(player.M)
  );

  //Now that we have all the players who are still registered as on team in the DB but not in the API we inactivate them
  inactivatePlayers(inactivePlayerArray);

  return inactivePlayerArray;
};

const inactivatePlayers = (inactivePlayerArray) => {
  //This takes all the players which we determined as inactive before and updates them in the database
  for (const player of inactivePlayerArray) {
    db.PlayerData.findOne({ M: player.M }, (err, dbPlayer) => {
      dbPlayer.A = false;

      dbPlayer.save((err, result) => {
        if (err) {
          console.log(`error ${dbPlayer.N}`, err);
        } else {
          return result;
        }
      });
    });
  }
};

const setPlayerToActive = (mySportsId) => {
  db.PlayerData.findOne({ M: mySportsId }, (err, dbPlayer) => {
    dbPlayer.A = true;

    dbPlayer.save((err, result) => {
      if (err) {
        console.log(`error ${dbPlayer.N}`, err);
      } else {
        return result;
      }
    });
  });
};

const updatePlayer = async (
  mySportsId,
  team,
  injury,
  position,
  espnMapping
) => {
  let confInjury = null;
  if (injury) {
    confInjury = { PP: injury.PP, D: capitalizeFirstLetter(injury.D) };
  }
  await db.PlayerData.findOneAndUpdate(
    { M: mySportsId },
    {
      T: team,
      A: true,
      I: confInjury,
      P: position,
      E: espnMapping,
    }
  );
};

const saveUserScore = async (userId, groupId, season, week, weekScore) => {
  let status = 200;
  db.UserScores.findOne({ U: userId, G: groupId, S: season })
    .then((userScore) => {
      //First check if the userScore is not in the DB
      let totalScore = 0;
      if (userScore === null) {
        let newUserScore = new db.UserScores({
          U: userId,
          G: groupId,
          S: season,
          TS: totalScore,
        });
        newUserScore[week] = weekScore;
        newUserScore.save((err) => {
          if (err) {
            console.log(err);
          }
        });
        return;
      }
      userScore[week] = weekScore;
      for (let i = 1; i <= week; i++) {
        totalScore += userScore[i];
      }
      userScore.TS = totalScore;
      userScore.save((err) => {
        if (err) {
          console.log(err);
        }
      });
    })
    .catch((err) =>
      console.log(
        `ERROR in saveUserScore userID: ${userId}, groupId: ${groupId}, ${error}`
      )
    );

  return status;
};

const saveWeeklyUserScore = (userId, groupId, week, season, scoreArray) =>
  db.UserRoster.findOne(
    { U: userId, G: groupId, W: week, S: season },
    (err, weeklyUser) => {
      for (let i = 0; i < weeklyUser.R.length; i++) {
        weeklyUser.R[i].SC = scoreArray[i];
      }
      weeklyUser.save((err) => {
        err && console.log(err);
      });
    }
  )
    .clone()
    .exec();
const saveOrUpdateMatchups = async (matchUpArray, season, week) => {
  const pulledWeek = await db.MatchUps.findOne({ W: week, S: season });
  if (pulledWeek === null || pulledWeek === undefined) {
    db.MatchUps.create(
      {
        S: season,
        W: week,
        M: matchUpArray,
      },
      function (err, player) {
        if (err) {
          console.log(err);
        }
      }
    );
  } else {
    pulledWeek.M = matchUpArray;
    await pulledWeek.save();
  }
  return true;
};

const getAndSaveUserScore = async (
  userRoster,
  season,
  week,
  userId,
  groupScore,
  groupId
) => {
  let weeklyRosterScore = [];
  let weekScore = 0;
  for (let i = 0; i < userRoster.length; i++) {
    const currentScore = await getPlayerWeeklyScore(
      userRoster[i].M,
      season,
      week,
      groupScore
    );
    const currentScoreNum = +currentScore.toFixed(2);
    weekScore += currentScoreNum;
    weeklyRosterScore[i] = currentScoreNum;
  }
  try {
    await saveWeeklyUserScore(userId, groupId, week, season, weeklyRosterScore);
    await saveUserScore(userId, groupId, season, week, weekScore);
  } catch (err) {
    console.log('ERROR in getAndSaveUserScore', err);
  }
  return;
};

const getPlayerWeeklyScore = async (playerId, season, week, groupScore) => {
  return new Promise(async (res, rej) => {
    if (playerId === 0) {
      res(0);
    }
    let weeklyScore = 0;
    weeklyScore = await playerScoreHandler(playerId, season, week, groupScore);
    res(weeklyScore);
  });
};

const pullTeamData = async (season, team) => {
  console.log(`Requesting ${team}`);
  await axios
    .get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json`, {
      auth: {
        username: mySportsFeedsAPI,
        password: `MYSPORTSFEEDS`,
      },
      params: {
        season: season,
        team: team,
        rosterstatus: `assigned-to-roster`,
      },
    })
    .then((response) => {
      // Then parses through the roster and pulls out of all the offensive players and updates their data
      parseRoster(response.data.players, team);
    })
    .catch((err) => {
      console.log(`ERROR inside of pullTeamData: `, err);
      if (err.request) {
        if (err.request.status === 502 || err.request.status === 429) {
          setTimeout(pullTeamData(season), 60000);
        }
      }
    });
};

module.exports = {
  updateTestRoster: async (season) => {
    console.log(season);
    const team = 'PHI';
    console.log(`Requesting ${team}`);
    await axios
      .get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json`, {
        auth: {
          username: mySportsFeedsAPI,
          password: `MYSPORTSFEEDS`,
        },
        params: {
          season: season,
          team: team,
          rosterstatus: `assigned-to-roster`,
        },
      })
      .then(async (response) => {
        // Then parses through the roster and pulls out of all the offensive players and updates their data
        //This also gets any new players and adds them to the DB but inside this function
        //Await because I want it to iterate through the whole roster that was provided before moving onto the next one
        console.log(`working through ${team}`);

        await parseRoster(response.data.players, team);
      })
      .catch((err) => {
        //TODO Error handling if the AJAX failed
        console.log(`ERROR`, err, `GET ERROR`);
      });
  },
  updateTeamRoster: (season, teams) => {
    // This loops through the array of all the teams above and gets the current rosters
    let i = 0;
    const rosterTimer = setInterval(async () => {
      if (teams[i] !== `UNK`) {
        await pullTeamData(season, teams[i]);
      }
      i++;
      if (i >= teams.length) {
        clearInterval(rosterTimer);
      }
    }, 10000);

    return { text: `Update Roster Process Kicked off` };
  },
  getMassData: async function (currentSeason) {
    //This loops through the the seasons and weeks and pulls through all of the data for the players
    const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

    for (let i = 0; i < weeks.length; i++) {
      //We send what week we're currently on to the weeklydata where that's used to update pull the API and parse the data
      console.log(`hitting season ${currentSeason} - week ${weeks[i]}`);
      await this.getWeeklyData(currentSeason, weeks[i]);
      console.log(`week ${weeks[i]} has been updated`);
    }

    //After this is done we want to run the updateRoster function to pull in players who have retired
    //There is no way in the API to get if they currently play when pulling historical data
    this.updateTeamRoster(currentSeason, nflTeams.teams);

    //TODO Actually return something useful
    const testReturn = {
      status: 200,
      text: `working`,
    };
    return testReturn;
  },
  getWeeklyData: (season, week) =>
    new Promise(async (res, rej) => {
      //This gets a specific week's worth of games and iterates through the list of players to come up with an array
      //The array has player id, names, positions and stats in it. It then should feed an update a database
      console.log(`requesting week ${week} data`);
      let search;
      try {
        search = await axios.get(
          `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${week}/player_gamelogs.json`,
          {
            auth: {
              username: mySportsFeedsAPI,
              password: `MYSPORTSFEEDS`,
            },
          }
        );
      } catch (err) {
        console.log(`ERR getting week ${week}`, err);
      }

      console.log(`weekly data received, parsing`);
      if (!search.data.gamelogs) return;
      for (let i = 0; i < search.data.gamelogs.length; i++) {
        const position =
          search.data.gamelogs[i].player.position ||
          search.data.gamelogs[i].player.primaryPosition;

        if (
          position === `QB` ||
          position === `TE` ||
          position === `WR` ||
          position === `RB` ||
          position === `K`
        ) {
          //This searches the database and then returns their ID if they're there and false if they are not
          let player = await findPlayerInDB(search.data.gamelogs[i].player.id);
          if (!player) {
            //Need to break out player team incase the team part is null
            //This is for players that have retired or are not currently on a team in mySportsDB
            let playerTeam = ``;
            if (search.data.gamelogs[i].team !== null) {
              playerTeam = search.data.gamelogs[i].team.abbreviation;
            } else {
              playerTeam = `UNK`;
            }
            //If they are not in the database then I need to first update the PlayerData collection
            addPlayerData(
              search.data.gamelogs[i].player,
              playerTeam,
              search.data.gamelogs[i].stats,
              season,
              week
            );
          } else {
            //Need to ensure the player is set to active when their stats are entered in
            setPlayerToActive(player.M);
            addWeeksStats(
              player.M,
              search.data.gamelogs[i].stats,
              season,
              week
            );
          }
        }
      }

      //TODO Do more than just send the same thing
      const response = {
        status: 200,
        text: `DB Updated`,
      };
      console.log(`get weekly data done week ${week} season ${season}`);
      res(response);
    }),
  calculateWeeklyScore: async (
    groupList,
    season,
    week,
    groupId,
    groupScore
  ) => {
    for (const user of groupList) {
      await getAndSaveUserScore(
        user.R,
        season,
        week,
        user.U,
        groupScore,
        groupId
      );
    }

    return;
  },
  rankPlayers: async function (season, week, groupScore, totalSeason) {
    console.log(`Ranking Players for `, season, week);
    //Loop through the positions of the players to then rank them
    //We are doing the offense here, since D will be different
    const rankedPlayersByPosition = {};
    for (const position of positions.positionArray) {
      rankedPlayersByPosition[position] = [];
      console.log(`Pulling ${position} for scoring`);
      const playersByPosition = await db.PlayerData.find(
        { P: position, A: true },
        { M: 1, N: 1, P: 1 }
      );
      const rankingArray = [];

      //Iterate through every player, get their total score for the season
      for (let player of playersByPosition) {
        const scoredPlayer = player.toObject();
        scoredPlayer.score = 0;
        if (totalSeason) {
          for (let i = 1; i <= week; i++) {
            scoredPlayer.score += await playerScoreHandler(
              player.M,
              season,
              i,
              groupScore
            );
          }
        } else {
          scoredPlayer.score += await playerScoreHandler(
            player.M,
            season,
            week,
            groupScore
          );
        }
        //Put them in an array to rank them
        rankingArray.push(scoredPlayer);
      }
      //Sort the array by score so we can then divide it into the top performers
      rankingArray.sort((a, b) => {
        return b.score - a.score;
      });
      rankedPlayersByPosition[position] = rankingArray;
    }
    return rankedPlayersByPosition;
  },
  savePlayerRank: async (rankedPlayersByPosition) => {
    //Get them into 7 different categories, each 10 big until the 8th rank, which is just all the rest
    for (const position in rankedPlayersByPosition) {
      const rankingArray = [...rankedPlayersByPosition[position]];
      console.log(`Saving ${position}`);
      for (let i = 1; i <= 8; i++) {
        let currentRank = [];
        if (i !== 8) {
          currentRank = rankingArray.splice(0, 9);
        } else {
          currentRank = rankingArray;
        }
        for (let player of currentRank) {
          await db.PlayerData.findByIdAndUpdate(player._id, { R: i });
        }
      }
    }
    console.log(`Done Ranking`);
    return `Ranked Players Saved`;
  },
  fillUserRoster: async (playerIdRoster) => {
    const mySportsIdArray = playerIdRoster.map((id) => id.M);
    let dbSearch;
    try {
      dbSearch = await db.PlayerData.find(
        { M: { $in: mySportsIdArray } },
        { P: 1, T: 1, M: 1, N: 1, I: 1, AV: 1 }
      );
    } catch (err) {
      console.log(err);
    }
    const filledRoster = [];
    for (let playerId of playerIdRoster) {
      const player = dbSearch.find((player) => player.M === playerId.M);
      if (!player) return { M: 0, SC: 0 };
      const { P, T, M, N, I } = player;
      if (player.AV) {
        const avatar = await s3Handler.getPlayerAvatar(player.M);
        filledRoster.push({ P, T, M, N, I, SC: playerId.SC, AV: avatar });
      } else {
        const avatar = await s3Handler.getPlayerOutlineAvatar();
        filledRoster.push({ P, T, M, N, I, SC: playerId.SC, AV: avatar });
      }
    }
    // const filledRoster = playerIdRoster.map((id) => {
    //   const player = dbSearch.find((player) => player.M === id.M);
    //   if (!player) return { M: 0, SC: 0 };
    //   const { P, T, M, N, I } = player;
    //   if (player.AV) {
    //     const avatar = s3Handler.getPlayerAvatar(player.M);
    //     return { P, T, M, N, I, SC: id.SC, AV: avatar };
    //   } else {
    //     const avatar = s3Handler.getPlayerOutlineAvatar();
    //     return { P, T, M, N, I, SC: id.SC, AV: avatar };
    //   }
    // });
    return filledRoster;
  },
  pullMatchUpsForDB: async (season, week) =>
    new Promise(async (res, rej) => {
      let i = 1;
      const matchUpTimer = setInterval(async () => {
        console.log(`requesting matchups for ${season}, week ${i}`);
        const search = await axios.get(
          `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${i}/games.json`,
          {
            auth: {
              username: mySportsFeedsAPI,
              password: `MYSPORTSFEEDS`,
            },
          }
        );
        const parsedGames = search.data.games.map((game) => {
          const H = game.schedule.homeTeam.abbreviation;
          const A = game.schedule.awayTeam.abbreviation;
          let W = '';
          if (game.schedule.weather) {
            W = game.schedule.weather.description;
          }
          return { H, A, W };
        });

        await saveOrUpdateMatchups(parsedGames, season, i);
        i++;
        if (i > week) {
          clearInterval(matchUpTimer);
        }
      }, 6000);
      res(`Completed`);
    }),
  getMatchups: async function (season, week) {
    return new Promise(async (res, rej) => {
      const pulledWeek = await db.MatchUps.findOne({ W: week, S: season });
      if (pulledWeek === null || pulledWeek === undefined) {
        res(await this.pullMatchUpsForDB(season, week));
      } else {
        res(pulledWeek);
      }
    });
  },
  sortMatchups: async (matchups) => {
    const matchupsDisplay = {};
    for (let team of matchups) {
      matchupsDisplay[team.H] = { v: team.A, h: true };
      matchupsDisplay[team.A] = { v: team.H, h: false };
    }
    return matchupsDisplay;
  },
  singleWeekPlayerScore: async (playerId, season, week, groupScore) => {
    return await playerScoreHandler(playerId, season, week, groupScore);
  },
  checkGameStarted: async (season, week) => {
    let search;
    console.log(`Searching for week ${week} in ${season}`);
    try {
      search = await axios.get(
        `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${week}/games.json`,
        {
          auth: {
            username: mySportsFeedsAPI,
            password: `MYSPORTSFEEDS`,
          },
        }
      );
    } catch (err) {
      console.log(`Error pulling weekly game schedule! ${err}`);
    }
    for (const game of search.data.games) {
      const homeTeamLockSearch = await db.TeamLocked.findOne({
        T: game.schedule.homeTeam.abbreviation,
        W: week,
        S: season,
      });
      if (!homeTeamLockSearch) {
        const newRecord = new db.TeamLocked({
          T: game.schedule.homeTeam.abbreviation,
          ST: game.schedule.startTime,
          W: week,
          S: season,
        });
        newRecord.save();
      } else {
        homeTeamLockSearch.ST = game.schedule.startTime;
        homeTeamLockSearch.save();
      }

      const awayTeamLockSearch = await db.TeamLocked.findOne({
        T: game.schedule.awayTeam.abbreviation,
        W: week,
        S: season,
      });
      if (!awayTeamLockSearch) {
        const newRecord = new db.TeamLocked({
          T: game.schedule.awayTeam.abbreviation,
          ST: game.schedule.startTime,
          W: week,
          S: season,
        });
        newRecord.save();
      } else {
        awayTeamLockSearch.ST = game.schedule.startTime;
        awayTeamLockSearch.save();
      }
    }
    return;
  },
  getAllPlayersByTeam: async (teams) =>
    await db.PlayerData.find({ T: { $in: teams } }).exec(),
};
