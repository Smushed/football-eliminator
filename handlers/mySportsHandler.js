const db = require(`../models`);
const axios = require(`axios`);
const nflTeams = require(`../constants/nflTeams`);
const scoringSystem = require(`../constants/scoring`);
const positions = require(`../constants/positions`);
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API;
const currentSeason = process.env.CURRENT_SEASON;

const playerScoreHandler = (player, season, week) => {
    let weeklyScore = 0;

    const stats = player.stats[season][week];
    const categories = Object.keys(stats)

    for (category of categories) {
        const scoringFields = Object.keys(stats[category]);
        for (field of scoringFields) {
            weeklyScore += calculateScore(field, stats[category][field]);
        };
    };

    return weeklyScore;
}

const calculateScore = (fieldToScore, result) => {
    //This is only currently in there to help debug
    if (typeof scoringSystem[fieldToScore] === `undefined`) {
        return 0;
    };
    return result * scoringSystem[fieldToScore];
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
        player.F = stats.fumbles.fumLost || 0;
    } else {
        player.F = 0;
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
        player.F = stats.fumbles.fumLost || 0;
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
const parseRoster = async (playerArray, team, season) => {
    const totalPlayerArray = [];
    for (let i = 0; i < playerArray.length; i++) {
        const position = playerArray[i].player.primaryPosition || playerArray[i].player.position;
        if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {
            let mySportsId = await findPlayerInDB(playerArray[i].player.id);
            if (!mySportsId) {
                mySportsId = await addPlayerData(playerArray[i].player, team);
            } else {
                updatePlayerTeam();
            }
            //This then takes the player that it pulled out of the player array and updates them in the database
            //If the updatePlayerTeam returns a certian value pass it along to the new player array to then add to the database
            //This happens if the player on the roster is not currently in the database and needs to be added
            if (mySportsId === undefined) { console.log(playerArray[i].player.lastName) }
            totalPlayerArray.push(mySportsId);
        };
    };

    //Grab all the players in the database for that team so then we can check against the recent players in the API
    const dbNFLRoster = await db.PlayerData.find({ T: team }).exec();
    //Iterate through the players we have sitting in the database
    //Take out all the players which we just wrote to the database and update all the rest to be inactive

    //This makes a new set of mySportsIds that we then iterate over and see if the dbRoster contains these Ids. If they don't then add them to the new Array
    const totalPlayerArrayIds = new Set(totalPlayerArray);
    console.log(totalPlayerArrayIds)
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
    db.FantasyStats.findOneAndUpdate({ 'M': mySportsId }, { 'team': team, 'active': true });
    return;
};

const savePlayerScore = async (userId, allWeekScores, group) => {
    let status = 200;

    await db.UserScores.findOne({ 'userId': userId }, (err, userScore) => {
        allWeekScores.groupId = group;
        //First check if the userScore is not in the DB
        if (userScore === null) {
            var newUserScore = new db.UserScores({ userId: userId, weeklyScore: allWeekScores });
            newUserScore.save(err => {
                if (err) {
                    console.log(err);
                }
            });
        };

        // Update it if it there is a record in the DB
        userScore.weeklyScore = allWeekScores;
        userScore.save(err => {
            if (err) {
                console.log(err);
            };
        });
    });

    //TODO Error handling
    return status;
};

module.exports = {

    updateRoster: async (season) => {
        // This loops through the array of all the teams above and gets the current rosters
        for (const team of nflTeams.teams) {
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
                await parseRoster(response.data.players, team, season);
            }).catch(err => {
                //TODO Error handling if the AJAX failed
                console.log(err);
            });
        };

        //TODO Better response
        return { text: `Rosters updated!` };
    },
    getMassData: async function () {
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
                    //If they are not in the database then I need to first update the PlayerData collection
                    mySportsId = addPlayerData(search.data.gamelogs[i].player, search.data.gamelogs[i].team.abbreviation, search.data.gamelogs[i].stats, season, week);
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
    weeklyScore: async function (userRoster, season, week) {
        //Starting at 1 because we always start with week one
        const allWeekScores = {};
        allWeekScores.totalScore = 0;
        for (let i = 1; i <= week; i++) {
            //Now I need to parse through this roster and every player that isn't marked with a 0 I need to query the DB
            let weekScore = 0;
            for (let ii = 1; ii <= 8; ii++) { //8 because that is the amount of players in the roster
                //TODO Change this when I have groups of players allowed to change their rules
                if (ii === 1) {
                    weekScore += await this.getPlayerWeeklyScore(userRoster[i].QB, season, i); //Here i is the current week number
                } else if (ii === 2) {
                    weekScore += await this.getPlayerWeeklyScore(userRoster[i].RB1, season, i);
                } else if (ii === 3) {
                    weekScore += await this.getPlayerWeeklyScore(userRoster[i].RB2, season, i);
                } else if (ii === 4) {
                    weekScore += await this.getPlayerWeeklyScore(userRoster[i].WR1, season, i);
                } else if (ii === 5) {
                    weekScore += await this.getPlayerWeeklyScore(userRoster[i].WR2, season, i);
                } else if (ii === 6) {
                    weekScore += await this.getPlayerWeeklyScore(userRoster[i].Flex, season, i);
                } else if (ii === 7) {
                    weekScore += await this.getPlayerWeeklyScore(userRoster[i].TE, season, i);
                } else if (ii === 8) {
                    weekScore += await this.getPlayerWeeklyScore(userRoster[i].K, season, i);
                }
            }
            allWeekScores.totalScore += parseFloat(weekScore.toFixed(2));
            allWeekScores[i] = weekScore.toFixed(2);
        };
        return allWeekScores;
    },
    calculateWeeklyScore: async function (userRosters, season, week, group) {
        let status = 500;

        const userIdArray = Object.keys(userRosters);

        for (const userId of userIdArray) {
            console.log(`Calcing `, userId)
            const allWeekScores = await this.weeklyScore(userRosters[userId].roster, season, week);
            status = await savePlayerScore(userId, allWeekScores, group);
        }

        return (status);
    },
    getPlayerWeeklyScore: async (playerId, season, week) => {
        if (playerId === 0) {
            return 0;
        };
        let weeklyScore = 0
        try {
            let player = await db.FantasyStats.findOne({ mySportsId: playerId }, 'stats').exec();
            if (player === null) {
                return 0;
            };
            player = player.toObject()

            weeklyScore = playerScoreHandler(player, season, week);
        } catch (err) {
            console.log(err, `Id:`, playerId);
        };
        return weeklyScore;
    },
    rankPlayers: async function (season) {

        //Loop through the positions of the players to then rank them
        //We are doing the offense here, since D will be different
        for (const position of positions.offense) {
            console.log(`Pulling ${position} for scoring`);
            const playersByPosition = await db.FantasyStats.find({ 'position': position }, { mySportsId: 1, full_name: 1, position: 1, stats: 1 });
            const rankingArray = [];

            //Iterate through every player, get their total score for the season
            for (let player of playersByPosition) {
                player.toObject();
                player.score = 0;

                for (let i = 1; i <= 17; i++) {
                    player.score += playerScoreHandler(player, season, i)
                };

                //Put them in an array to rank them
                rankingArray.push(player);
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
                    delete player.score;
                    player.rank = i;
                    await player.save();
                };
            };
        };

        console.log(`Done Ranking`);
        return 200;
    },
};