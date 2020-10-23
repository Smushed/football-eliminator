const db = require(`../models`);
const axios = require(`axios`);
const nflTeams = require(`../constants/nflTeams`);
const positions = require(`../constants/positions`);
const scoringSystem = require(`../constants/scoringSystem`);
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API;

const playerScoreHandler = async (playerId, season, week, groupScore) => {
    return new Promise(async (res, rej) => {
        const playerStats = await db.PlayerStats.findOne({ 'M': playerId, 'W': week, 'S': season }).exec();
        let weeklyScore = 0;

        if (playerStats) {
            for (bucket of scoringSystem.buckets) {
                for (field of scoringSystem[bucket])
                    weeklyScore += calculateScore(playerStats[bucket][field], groupScore[bucket][field]);
            };
        };
        res(weeklyScore);
    });
};

const calculateScore = (playerStat, groupScore) => {
    //This is only currently in there to help debug
    if (typeof playerStat === `undefined`) {
        return (0);
    };
    return (playerStat * groupScore);
}

const addPlayerData = (player, team, stats, season, week) => {
    return new Promise((res, rej) => {
        db.PlayerData.create({
            N: `${player.firstName} ${player.lastName}`,
            M: parseInt(player.id),
            T: team,
            P: player.primaryPosition || player.position,
            A: true,
            R: 7,
        }, function (err, player) {
            if (err) {
                console.log(err);
            };
            //If we are adding a new player from the weekly update we cascade it down to add their stats
            if (stats) {
                addWeeksStats(player.M, stats, season, week)
            };
        });
        res(player.M);
    });
};

const findPlayerInDB = async (playerID) => {
    return new Promise(async (res, rej) => {
        try {
            const playerInDB = await db.PlayerData.findOne({ 'M': playerID }).exec();
            //First check if the player is currently in the database
            if (playerInDB === null) {
                res(false);
            } else {
                res(playerInDB.M);
            }
        } catch (err) {
            //TODO Do something more with the error
            console.log(`what`, err);
        };
    });
};

const checkForWeeklyStats = async (mySportsId, stats, season, week) => {
    //If the player already has a record in the database, return it so we can update it.
    //If not return false so we can write a new record
    const player = await db.PlayerStats.findOne({ M: mySportsId, W: week, S: season });
    if (!player) {
        return false;
    };
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
            '2P': stats.twoPointAttempts.twoPtPassMade || 0
        };
    } else {
        player.P = {
            T: 0,
            Y: 0,
            I: 0,
            A: 0,
            C: 0,
            '2P': 0
        };
    };

    if (stats.rushing) {
        player.RU = {
            A: stats.rushing.rushAttempts || 0,
            Y: stats.rushing.rushYards || 0,
            T: stats.rushing.rushTD || 0,
            '20': stats.rushing.rush20Plus || 0,
            '40': stats.rushing.rush40Plus || 0,
            F: stats.rushing.rushFumbles || 0,
            '2P': stats.twoPointAttempts.twoPtRushMade || 0
        };
    } else {
        player.RU = {
            A: 0,
            Y: 0,
            T: 0,
            '20': 0,
            '40': 0,
            F: 0,
            '2P': 0
        };
    };

    if (stats.receiving) {
        player.RE = {
            TA: stats.receiving.targets || 0,
            R: stats.receiving.receptions || 0,
            Y: stats.receiving.recYards || 0,
            T: stats.receiving.recTD || 0,
            '20': stats.receiving.rec20Plus || 0,
            '40': stats.receiving.rec40Plus || 0,
            F: stats.receiving.recFumbles || 0,
            '2P': stats.twoPointAttempts.twoPtPassRec || 0
        };
    } else {
        player.RE = {
            TA: 0,
            R: 0,
            Y: 0,
            T: 0,
            '20': 0,
            '40': 0,
            F: 0,
            '2P': 0
        }
    };

    if (stats.fumbles) {
        player.F = {
            F: stats.fumbles.fumLost || 0
        };
    } else {
        player.F = {
            F: 0
        };
    };

    if (stats.fieldGoals) {
        player.FG = {
            '1': stats.fieldGoals.fgMade1_19 || 0,
            '20': stats.fieldGoals.fgMade20_29 || 0,
            '30': stats.fieldGoals.fgMade30_39 || 0,
            '40': stats.fieldGoals.fgMade40_49 || 0,
            '50': stats.fieldGoals.fgMade50Plus || 0,
            X: stats.extraPointAttempts.xpMade || 0
        };
    } else {
        player.FG = {
            '1': 0,
            '20': 0,
            '30': 0,
            '40': 0,
            '50': 0,
            X: 0
        };
    };

    player.save(function (err) {
        if (err) {
            console.log(err)
        };
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
            '2P': stats.twoPointAttempts.twoPtPassMade || 0
        };
    };

    if (stats.rushing) {
        player.RU = {
            A: stats.rushing.rushAttempts || 0,
            Y: stats.rushing.rushYards || 0,
            T: stats.rushing.rushTD || 0,
            '20': stats.rushing.rush20Plus || 0,
            '40': stats.rushing.rush40Plus || 0,
            F: stats.rushing.rushFumbles || 0,
            '2P': stats.twoPointAttempts.twoPtRushMade || 0
        };
    };

    if (stats.receiving) {
        player.RE = {
            TA: stats.receiving.targets || 0,
            R: stats.receiving.receptions || 0,
            Y: stats.receiving.recYards || 0,
            T: stats.receiving.recTD || 0,
            '20': stats.receiving.rec20Plus || 0,
            '40': stats.receiving.rec40Plus || 0,
            F: stats.receiving.recFumbles || 0,
            '2P': stats.twoPointAttempts.twoPtPassRec || 0
        };
    };

    if (stats.fumbles) {
        player.F = {
            F: stats.fumbles.fumLost || 0
        };
    };

    if (stats.fieldGoals) {
        player.FG = {
            '1': stats.fieldGoals.fgMade1_19 || 0,
            '20': stats.fieldGoals.fgMade20_29 || 0,
            '30': stats.fieldGoals.fgMade30_39 || 0,
            '40': stats.fieldGoals.fgMade40_49 || 0,
            '50': stats.fieldGoals.fgMade50Plus || 0,
            X: stats.extraPointAttempts.xpMade || 0
        };
    };

    player.save(function (err) {
        if (err) {
            console.log(err)
        };
    });

    return;
};

const addWeeksStats = async (mySportsId, stats, season, week) => {
    //First check if there are already are stats, if so, update it
    const exists = await checkForWeeklyStats(mySportsId, stats, season, week);
    //If not, then create a new
    if (!exists) {
        newWeeklyStats(mySportsId, stats, season, week);
    };

    return;
};

//Goes through the roster of the team and pulls out all offensive players
const parseRoster = async (playerArray, team) => {
    const totalPlayerArray = [];
    for (let i = 0; i < playerArray.length; i++) {
        const position = playerArray[i].player.primaryPosition || playerArray[i].player.position;
        if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {
            let mySportsId = await findPlayerInDB(playerArray[i].player.id);
            if (mySportsId === null || mySportsId === undefined) {
                mySportsId = await addPlayerData(playerArray[i].player, team);
            } else {

                updatePlayerTeam(playerArray[i].player.id, playerArray[i].player.currentTeam.abbreviation);
            };
            totalPlayerArray.push(mySportsId);
        };
    };

    //Grab all the players in the database for that team so then we can check against the recent players in the API
    const dbNFLRoster = await db.PlayerData.find({ T: team }).exec();
    //Iterate through the players we have sitting in the database
    //Take out all the players which we just wrote to the database and update all the rest to be inactive

    //This makes a new set of mySportsIds that we then iterate over and see if the dbRoster contains these Ids. If they don't then add them to the new Array
    const totalPlayerArrayIds = new Set(totalPlayerArray);
    const inactivePlayerArray = dbNFLRoster.filter((player) => !totalPlayerArrayIds.has(player.M));

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
                    //TODO Better error handling
                    console.log(`error ${dbPlayer.full_name}`, err);
                } else {
                    return result;
                };
            });
        });
    };
};

const setPlayerToActive = (mySportsId) => {
    db.PlayerData.findOne({ M: mySportsId }, (err, dbPlayer) => {
        dbPlayer.A = true;

        dbPlayer.save((err, result) => {
            if (err) {
                //TODO Better error handling
                console.log(`error ${dbPlayer.full_name}`, err);
            } else {
                return result;
            };
        });
    });
};

const updatePlayerTeam = async (mySportsId, team) => {
    await db.PlayerData.findOneAndUpdate({ 'M': mySportsId }, { 'T': team, 'A': true });
};

const saveUserScore = async (userId, groupId, season, week, weekScore) => {
    let status = 200;
    await db.UserScores.findOne({ 'U': userId, 'G': groupId, 'S': season }, (err, userScore) => {
        //First check if the userScore is not in the DB
        if (userScore === null) {
            let newUserScore = new db.UserScores({ U: userId, G: groupId, S: season, TS: totalScore });
            for (let i = 0; scoreArray.length; i++) {
                newUserScore[week] = weekScore
            };
            newUserScore.save(err => {
                if (err) {
                    console.log(err);
                };
                return;
            });
        };
        userScore[week] = weekScore;
        let totalScore = 0;
        for (let i = 1; i <= week; i++) {
            totalScore += userScore[i];
        };
        userScore.TS = totalScore;
        userScore.save(err => {
            if (err) {
                console.log(err);
            };
        });
    });

    return status;
};

const saveWeeklyUserScore = async (userId, groupId, week, season, scoreArray) => {
    await db.WeeklyUserScore.findOne({ 'U': userId, 'G': groupId, 'W': week, 'S': season }, (err, weeklyScore) => {
        if (weeklyScore === null) {
            var newWeeklyScore = new db.WeeklyUserScore({ U: userId, G: groupId, W: week, S: season, SC: scoreArray });
            newWeeklyScore.save(err => {
                if (err) {
                    console.log(err)
                };
            });
            return;
        };
        weeklyScore.SC = scoreArray;
        weeklyScore.save(err => {
            if (err) {
                console.log(err);
            };
        });
    });
};

const saveOrUpdateMatchups = async (matchUpArray, season, week) => {
    const pulledWeek = await db.MatchUps.findOne({ 'W': week, 'S': season });
    if (pulledWeek === null || pulledWeek === undefined) {
        db.MatchUps.create({
            S: season,
            W: week,
            M: matchUpArray
        }, function (err, player) {
            if (err) {
                console.log(err);
            };
        });
    } else {
        pulledWeek.M = matchUpArray;
        await pulledWeek.save();
    };
    return true;
};

module.exports = {

    updateRoster: async (season) => {
        // This loops through the array of all the teams above and gets the current rosters
        for (const team of nflTeams.teams) {
            if (team === `UNK`) { continue };
            console.log(`Requesting ${team}`);
            await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json`, {
                auth: {
                    username: mySportsFeedsAPI,
                    password: `MYSPORTSFEEDS`
                },
                params: {
                    season: season,
                    team: team,
                    rosterstatus: `assigned-to-roster`
                }
            }).then(async (response) => {
                // Then parses through the roster and pulls out of all the offensive players and updates their data
                //This also gets any new players and adds them to the DB but inside this function
                //Await because I want it to iterate through the whole roster that was provided before moving onto the next one
                console.log(`working through ${team}`)
                await parseRoster(response.data.players, team);
            }).catch(err => {
                //TODO Error handling if the AJAX failed
                console.log(`ERROR`, err, `GET ERROR`);
            });
        };

        //TODO Better response
        return { text: `Rosters updated!` };
    },
    getMassData: async function (currentSeason) {
        //This loops through the the seasons and weeks and pulls through all of the data for the players
        const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

        for (let i = 0; i < weeks.length; i++) {
            //We send what week we're currently on to the weeklydata where that's used to update pull the API and parse the data
            console.log(`hitting season ${currentSeason} - week ${weeks[i]}`)
            await this.getWeeklyData(currentSeason, weeks[i]);
            console.log(`week ${weeks[i]} has been updated`);
        };

        //After this is done we want to run the updateRoster function to pull in players who have retired
        //There is no way in the API to get if they currently play when pulling historical data
        this.updateRoster(currentSeason);

        //TODO Actually return something useful
        const testReturn = {
            status: 200,
            text: `working`
        }
        return testReturn;
    },
    getWeeklyData: async (season, week) => {
        //This gets a specific week's worth of games and iterates through the list of players to come up with an array
        //The array has player id, names, positions and stats in it. It then should feed an update a database
        console.log(`requesting week ${week} data`)
        const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${week}/player_gamelogs.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            }
        });

        console.log(`weekly data received, parsing`);

        for (let i = 0; i < search.data.gamelogs.length; i++) {
            const position = search.data.gamelogs[i].player.position || search.data.gamelogs[i].player.primaryPosition;

            if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {

                //This searches the database and then returns their ID if they're there and false if they are not
                let mySportsId = await findPlayerInDB(search.data.gamelogs[i].player.id);
                if (!mySportsId) {
                    //Need to break out player team incase the team part is null
                    //This is for players that have retired or are not currently on a team in mySportsDB
                    let playerTeam = ``;
                    if (search.data.gamelogs[i].team !== null) {
                        playerTeam = search.data.gamelogs[i].team.abbreviation;
                    } else {
                        playerTeam = `UNK`;
                    };
                    //If they are not in the database then I need to first update the PlayerData collection
                    mySportsId = addPlayerData(search.data.gamelogs[i].player, playerTeam, search.data.gamelogs[i].stats, season, week);
                } else {
                    //Need to ensure the player is set to active when their stats are entered in
                    setPlayerToActive(mySportsId);
                    addWeeksStats(mySportsId, search.data.gamelogs[i].stats, season, week)
                };
            };
        };

        //TODO Do more than just send the same thing
        const response = {
            status: 200,
            text: `DB Updated`
        }
        console.log(`get weekly data done week ${week} season ${season}`)
        return response;
    },
    getAndSaveUserScore: async function (userRoster, season, week, userId, groupScore, groupId) {
        let weeklyRosterScore = [];
        let weekScore = 0;
        for (let ii = 0; ii < userRoster.length; ii++) {
            const currentScore = await this.getPlayerWeeklyScore(userRoster[ii], season, week, groupScore);
            const currentScoreNum = +currentScore.toFixed(2);
            weekScore += currentScoreNum;
            weeklyRosterScore[ii] = currentScoreNum;
        };
        saveWeeklyUserScore(userId, groupId, week, season, weeklyRosterScore);
        saveUserScore(userId, groupId, season, week, weekScore);
        return;
    },
    calculateWeeklyScore: async function (groupList, season, week, groupId, groupScore) {

        for (const user of groupList) {
            await this.getAndSaveUserScore(user.R, season, week, user.U, groupScore, groupId);
        };

        return;
    },
    getPlayerWeeklyScore: async (playerId, season, week, groupScore) => {
        return new Promise(async (res, rej) => {
            if (playerId === 0) {
                res(0);
            };
            let weeklyScore = 0
            weeklyScore = await playerScoreHandler(playerId, season, week, groupScore);
            res(weeklyScore);
        });
    },
    rankPlayers: async function (season, week, groupScore) {
        console.log(`Ranking Players for `, season, week, groupScore);
        //Loop through the positions of the players to then rank them
        //We are doing the offense here, since D will be different
        for (const position of positions.positionArray) {
            console.log(`Pulling ${position} for scoring`);
            const playersByPosition = await db.PlayerData.find({ 'P': position }, { M: 1, N: 1, P: 1 });
            const rankingArray = [];

            //Iterate through every player, get their total score for the season
            for (let player of playersByPosition) {
                const scoredPlayer = player.toObject();
                scoredPlayer.score = 0;
                for (let i = 1; i <= week; i++) {
                    scoredPlayer.score += await playerScoreHandler(player.M, season, i, groupScore)
                };
                //Put them in an array to rank them
                rankingArray.push(scoredPlayer);
            };

            //Sort the array by score so we can then divide it into the top performers
            rankingArray.sort((a, b) => { return b.score - a.score });
            //Get them into 7 different categories, each 10 big until the 7th rank, which is just all the rest
            for (let i = 1; i <= 7; i++) {
                let currentRank = [];
                if (i !== 7) {
                    currentRank = rankingArray.splice(0, 9)
                } else {
                    currentRank = rankingArray;
                }
                for (let player of currentRank) {
                    await db.PlayerData.findByIdAndUpdate(player._id, { R: i });
                };
            };
        };

        console.log(`Done Ranking`);
        return 200;
    },
    fillUserRoster: async (playerIdRoster, playerScoreArray) => {
        const filledRoster = [];
        for (let i = 0; i < playerIdRoster.length; i++) {
            if (playerIdRoster[i] !== 0) {
                const { P, T, M, N } = await db.PlayerData.findOne({ M: playerIdRoster[i] }, { P: 1, T: 1, M: 1, N: 1 });
                filledRoster.push({ P, T, M, N, S: playerScoreArray.SC[i] });
            } else {
                filledRoster.push(0);
            };
        };
        return filledRoster;
    },
    getUserWeeklyScore: async (userId, groupId, season, week) => {
        return new Promise(async (res, rej) => {
            await db.WeeklyUserScore.findOne({ U: userId, G: groupId, S: season, W: week }, (err, weeklyUserScore) => {
                if (weeklyUserScore === null) {
                    var newUserScore = new db.WeeklyUserScore({ U: userId, G: groupId, S: season, W: week, SC: [] });
                    newUserScore.save(err => {
                        if (err) {
                            console.log(err);
                        };
                        res(newUserScore);
                    });
                };
                res(weeklyUserScore);
            });
        })
    },
    pullMatchUpsForDB: async (season, week) => {
        return new Promise(async (res, rej) => {
            for (let i = 1; i <= week; i++) {
                console.log(i)
                const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${i}/games.json`, {
                    auth: {
                        username: mySportsFeedsAPI,
                        password: `MYSPORTSFEEDS`
                    }
                });
                const parsedGames = search.data.games.map(game => {
                    const H = game.schedule.homeTeam.abbreviation;
                    const A = game.schedule.awayTeam.abbreviation;
                    let W = '';
                    if (game.schedule.weather) {
                        W = game.schedule.weather.description;
                    };
                    return ({ H, A, W });
                });

                await saveOrUpdateMatchups(parsedGames, season, i);
            }
            res(`Completed`);
        });
    },
    getMatchups: async function (season, week) {
        return new Promise(async (res, rej) => {
            const pulledWeek = await db.MatchUps.findOne({ 'W': week, 'S': season });
            if (pulledWeek === null || pulledWeek === undefined) {
                res(await this.pullMatchUpsForDB(season, week));
            } else {
                res(pulledWeek);
            };
        });
    }
};