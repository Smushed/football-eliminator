const db = require(`../models`);
const axios = require(`axios`);
const nflTeams = require(`../constants/nflTeams`);
const scoringSystem = require(`../constants/scoring`);
const positions = require(`../constants/positions`);
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API;

const getPlayerWeeklyScore = async (playerId, position, season, week) => {
    if (playerId === 0) {
        return 0;
    };
    let weeklyScore = 0
    try {
        let player = await db.FantasyStats.findOne({ mySportsId: playerId }, 'stats');
        if (player === null) {
            return 0;
        };
        player = player.toObject()

        weeklyScore = playerScoreHandler(player, season, week);
    } catch (err) {
        console.log(err, `Id:`, playerId);
    };
    return weeklyScore;
};

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

const placeholderStats = (stats) => {
    //This goes through the returned stats and adds a blank object to any field where the player doesn't have any information
    //This is done for the getStats function. It needs to have an object to read & assign new values to
    const scoringArray = [`passing`, `rushing`, `receiving`, `fumbles`, `kickoffReturns`, `puntReturns`, `twoPointAttempts`, `extraPointAttempts`, `fieldGoals`];

    for (let i = 0; i < scoringArray.length; i++) {
        if (typeof (stats[scoringArray[i]]) == `undefined`) {
            stats[scoringArray[i]] = {};
        }
    };
    return stats;
};

const addPlayerToDB = (playerArray) => {
    db.FantasyStats.collection.insertMany(playerArray, (err, writtenObj) => {
        if (err) {
            //TODO Handle the error
            console.log(err);
        } else {
            return playerArray;
        };
    });
};

const completeStats = (player, stats, season, week) => {
    //First we iterate through and ensure that the objects are there to put stats in
    const fullStats = placeholderStats(stats);

    //Add in the object if it is not there. We need this for new players, we have to define the objects before we use bracket notation
    if (typeof player.stats[season] === 'undefined' || typeof player.stats[season][week] === 'undefined') {
        player.stats = {
            [season]: {
                [week]: {}
            }
        };
    };

    player.stats[season][week] = {
        //Needs the 0s here in case the object is blank from placeholderStats
        passing: {
            passTD: fullStats.passing.passTD || 0,
            passYards: fullStats.passing.passYards || 0,
            passInt: fullStats.passing.passInt || 0,
            passAttempts: fullStats.passing.passAttempts || 0,
            passCompletions: fullStats.passing.passCompletions || 0,
            twoPtPassMade: fullStats.twoPointAttempts.twoPtPassMade || 0
        },
        rushing: {
            rushAttempts: fullStats.rushing.rushAttempts || 0,
            rushYards: fullStats.rushing.rushYards || 0,
            rushTD: fullStats.rushing.rushTD || 0,
            rush20Plus: fullStats.rushing.rush20Plus || 0,
            rush40Plus: fullStats.rushing.rush40Plus || 0,
            rushFumbles: fullStats.rushing.rushFumbles || 0
        },
        receiving: {
            targets: fullStats.receiving.targets || 0,
            receptions: fullStats.receiving.receptions || 0,
            recYards: fullStats.receiving.recYards || 0,
            recTD: fullStats.receiving.recTD || 0,
            rec20Plus: fullStats.receiving.rec20Plus || 0,
            rec40Plus: fullStats.receiving.rec40Plus || 0,
            recFumbles: fullStats.receiving.recFumbles || 0
        },
        fumbles: {
            fumbles: fullStats.fumbles.fumbles || 0,
            fumbles: fullStats.fumbles.fumLost || 0
        },
        fieldGoals: {
            fgMade1_19: fullStats.fieldGoals.fgMade1_19 || 0,
            fgMade20_29: fullStats.fieldGoals.fgMade20_29 || 0,
            fgMade30_39: fullStats.fieldGoals.fgMade30_39 || 0,
            fgMade40_49: fullStats.fieldGoals.fgMade40_49 || 0,
            fgMade50Plus: fullStats.fieldGoals.fgMade50Plus || 0
        }
    };
    return player;
};

const mergeMySportsWithDB = (playerInDB) => {
    //Merge the player with the current pull. Take the current stats and then send it
    db.FantasyStats.findByIdAndUpdate(playerInDB._id, playerInDB, (err) => {
        if (err) {
            //TODO Do more than just log the error
            console.log(err)
        };
    });
};

const findPlayerInDB = async (playerID) => {

    try {
        const playerInDB = await db.FantasyStats.findOne({ 'mySportsId': playerID });
        //First check if the player is currently in the database
        if (playerInDB === null) {
            return false;
        } else {
            return playerInDB;
        }
    } catch (err) {
        //TODO Do something more with the error
        console.log(`what`, err);
    };
};

const getNewPlayerStats = (player, stats, team, season, week) => {
    const combinedStats = {};

    combinedStats.full_name = `${player.firstName} ${player.lastName}`;
    combinedStats.mySportsId = player.id;
    combinedStats.position = player.primaryPosition || player.position;
    combinedStats.team = team;
    combinedStats.active = true;

    //This runs through the stats and fills in any objects that aren't available
    combinedStats.stats = placeholderStats(stats)
    const newPlayer = completeStats(combinedStats, stats, season, week);
    //Iterate through the different stats and check if available. If so then put them into the player objects

    return newPlayer;
};

//Goes through the roster of the team and pulls out all offensive players
const parseRoster = async (playerArray, team, season) => {
    const newPlayerArray = [];
    const totalPlayerArray = [];
    for (let i = 0; i < playerArray.length; i++) {
        const position = playerArray[i].player.primaryPosition || playerArray[i].player.position;
        if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {
            //This then takes the player that it pulled out of the player array and updates them in the database
            const dbResponse = await updatePlayerTeam(playerArray[i].player, team, season);
            //If the updatePlayerTeam returns a certian value pass it along to the new player array to then add to the database
            //This happens if the player on the roster is not currently in the database and needs to be added
            if (dbResponse.newPlayer) {
                newPlayerArray.push(dbResponse.player);
            };
            totalPlayerArray.push(dbResponse.player);
        };
    };
    // If the amount of new players are over one, then add them all to the database
    if (newPlayerArray.length >= 1) {
        addPlayerToDB(newPlayerArray);
    };

    //Grab all the players in the database for that team so then we can check against the recent players in the API
    const dbNFLRoster = await db.FantasyStats.find({ team: team });
    //Iterate through the players we have sitting in the database
    //Take out all the players which we just wrote to the database and update all the rest to be inactive

    //This makes a new set of mySportsIds that we then iterate over and see if the dbRoster contains these Ids. If they don't then add them to the new Array
    const totalPlayerArrayIds = new Set(totalPlayerArray.map(({ mySportsId }) => mySportsId));
    const inactivePlayerArray = dbNFLRoster.filter((player) => !totalPlayerArrayIds.has(player.mySportsId));

    //Now that we have all the players who are still registered as on team in the DB but not in the API we inactivate them
    inactivatePlayers(inactivePlayerArray);

    return inactivePlayerArray;
};

const inactivatePlayers = (inactivePlayerArray) => {
    //This takes all the players which we determined as inactive before and updates them in the database
    for (const player of inactivePlayerArray) {
        db.FantasyStats.findOne({ mySportsId: player.mySportsId }, (err, dbPlayer) => {
            dbPlayer.active = false;

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

const updatePlayerTeam = async (player, team, season) => {
    //Check the database for the player
    const dbPlayer = await findPlayerInDB(player.id);
    const response = {};

    //If dbPlayer is false then we need to write them into the database
    //If the dbPlayer is not false then we need to overwrite the team that the player is currently on
    if (!dbPlayer) {
        //Stats are going to be passed in a blank object. The Team API call doesn't return stats, so we just want to feed it an empty object
        //The getNewPlayerStats needs stats to be passed in, but if there are none available it will default them to 0.
        //Week here can be 17 because only new players should be added. If any of them aren't new then this will overwrite their week 17 stats
        response.newPlayer = true;
        response.player = getNewPlayerStats(player, {}, team, season, 17);
    } else {
        response.newPlayer = false;
        response.player = await db.FantasyStats.findOneAndUpdate({ 'mySportsId': player.id }, { 'team': team, 'active': true }, { new: true });
    };
    return response;
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
        userScore.weeklyScore = allWeekScores
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
        const seasonList = [`2019-2020-regular`]; //TODO Need to update it here every year (unless I include this in the request)
        const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

        for (let i = 0; i < seasonList.length; i++) {
            for (let ii = 0; ii < weeks.length; ii++) {
                //We send what week we're currently on to the weeklydata where that's used to update pull the API and parse the data
                console.log(`hitting season ${seasonList[i]} - week ${weeks[ii]}`)
                await this.getWeeklyData(seasonList[i], weeks[ii]);
                console.log('data has been updated')
            };
        };

        //After this is done we want to run the updateRoster function to pull in players who have retired
        //There is no way in the API to get if they currently play when pulling historical data
        this.updateRoster(`2019-2020-regular`);

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
        const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${week}/player_gamelogs.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            }
        });

        console.log(`weekly data received, parsing`)

        const weeklyPlayerArray = [];

        for (let i = 0; i < search.data.gamelogs.length; i++) {
            const position = search.data.gamelogs[i].player.position || search.data.gamelogs[i].player.primaryPosition;
            let player = {};

            if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {

                //This is going to go two ways after this point
                //If the player is found in the database then go and update the record
                //This searches the database and then returns true if they are in there and false if they are not
                //If they are in the database then the findPlayerInDB function convers it. Since we are already accessing the database with this, there is no reason to try and pass it back and then go out again
                const playerInDB = await findPlayerInDB(search.data.gamelogs[i].player.id);

                if (!playerInDB) {
                    //They are not in the database. Init the object and then add them to an array which whill then be written to the database
                    player = await getNewPlayerStats(search.data.gamelogs[i].player, search.data.gamelogs[i].stats, search.data.gamelogs[i].team, season, week);
                    //If they are not found in the database, add them to an array and then
                    weeklyPlayerArray.push(player);
                } else {
                    //If the player is in the DB then pull all their stats together and add them to the db
                    const dbReadyPlayer = completeStats(playerInDB, search.data.gamelogs[i].stats, season, week);
                    await mergeMySportsWithDB(dbReadyPlayer);
                };
            };
        };
        if (weeklyPlayerArray.length >= 1) {
            await addPlayerToDB(weeklyPlayerArray);
        };
        //TODO Do more than just send the same thing
        const response = {
            status: 200,
            text: `DB Updated`
        }
        console.log(`get weekly data done week ${week} season ${season}`)
        return response;
    },
    weeklyScore: async (userRoster, season, week) => {
        //Starting at 1 because we always start with week one
        const allWeekScores = {};
        allWeekScores.totalScore = 0;
        for (let i = 1; i <= week; i++) {
            //Now I need to parse through this roster and every player that isn't marked with a 0 I need to query the DB
            let weekScore = 0;
            for (let ii = 1; ii <= 8; ii++) { //8 because that is the amount of players in the roster
                //TODO Change this when I have groups of players allowed to change their rules
                if (ii === 1) {
                    weekScore += await getPlayerWeeklyScore(userRoster[i].QB, `QB`, season, i); //Here i is the current week number
                } else if (ii === 2) {
                    weekScore += await getPlayerWeeklyScore(userRoster[i].RB1, `RB`, season, i);
                } else if (ii === 3) {
                    weekScore += await getPlayerWeeklyScore(userRoster[i].RB2, `RB`, season, i);
                } else if (ii === 4) {
                    weekScore += await getPlayerWeeklyScore(userRoster[i].WR1, `WR`, season, i);
                } else if (ii === 5) {
                    weekScore += await getPlayerWeeklyScore(userRoster[i].WR2, `WR`, season, i);
                } else if (ii === 6) {
                    weekScore += await getPlayerWeeklyScore(userRoster[i].Flex, `Flex`, season, i);
                } else if (ii === 7) {
                    weekScore += await getPlayerWeeklyScore(userRoster[i].TE, `TE`, season, i);
                } else if (ii === 8) {
                    weekScore += await getPlayerWeeklyScore(userRoster[i].K, `K`, season, i);
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