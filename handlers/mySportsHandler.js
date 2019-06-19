const db = require(`../models`);
const axios = require(`axios`);
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API

const placeholderStats = (stats) => {
    //This goes through the returned stats and adds a blank object to any field where the player doesn't have any information
    //This is done for the getStats function. It needs to have an object to read
    const scoringArray = [`passing`, `rushing`, `receiving`, `fumbles`, `kickoffReturns`, `puntReturns`, `twoPointAttempts`, `extraPointAttempts`, `fieldGoals`];

    for (let i = 0; i <= 8; i++) {
        if (typeof (stats[scoringArray[i]]) == `undefined`) {
            stats[scoringArray[i]] = {};
        }
    };
    return stats;
};

const addPlayerToDB = (weeklyPlayerArray) => {
    db.FantasyStats.collection.insertMany(weeklyPlayerArray, (err, writtenObj) => {
        if (err) {
            //TODO Handle the error
            console.log(err);
        } else {
            return weeklyPlayerArray;
        }
    });
};

const updatePlayerWithCurrentWeek = (playerInDB, newWeekStats, season, week) => {

    const fullStats = placeholderStats(newWeekStats);

    playerInDB.stats[season][week] = {
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
            recYards: fullStats.receiving.receptions || 0,
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
            fgmade30_39: fullStats.fieldGoals.fgmade30_39 || 0,
            fgMade40_49: fullStats.fieldGoals.fgMade40_49 || 0,
            fgMade50Plus: fullStats.fieldGoals.fgMade50Plus || 0
        }
    };
    mergeMySportsWithDB(playerInDB);
};

const mergeMySportsWithDB = (playerInDB) => {
    //TODO For some reason when I try and access stats it's undefined
    //Merge the player with the current pull. Take the current stats and then send it
    db.FantasyStats.findByIdAndUpdate(playerInDB._id, playerInDB, (err) => {
        console.log("updating DB")
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
            //Send the player data back, they are not currently in the DB and can be added as is
            return false;
        } else {
            //The player is currently in the DB, send the current player in the DB and the mySports Player to a function
            // const mergedPlayer = mergeMySportsWithDB(playerInDB);
            // updatePlayerWithCurrentWeek(mergedPlayer)
            return playerInDB;
        }
    } catch (err) {
        console.log("what", err);
    };
};

const getNewPlayerStats = (player, stats, team, season, week) => {
    const combinedStats = {};

    combinedStats.full_name = `${player.firstName} ${player.lastName}`;
    combinedStats.mySportsId = player.id;
    combinedStats.position = player.position;
    combinedStats.team = { id: team.id, abbreviation: team.abbreviation }

    //This runs through the stats and fills in any objects that aren't available
    const fullStats = placeholderStats(stats)

    //Iterate through the different stats and check if available. If so then put them into the player objects
    combinedStats.stats = {
        [season]: {
            [week]: {
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
                    recYards: fullStats.receiving.receptions || 0,
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
                    fgmade30_39: fullStats.fieldGoals.fgmade30_39 || 0,
                    fgMade40_49: fullStats.fieldGoals.fgMade40_49 || 0,
                    fgMade50Plus: fullStats.fieldGoals.fgMade50Plus || 0
                }
            }
        }
    };
    return combinedStats;
};

const parseRoster = (playerArray) => {
    for (let i = 0; i < playerArray.length; i++) {
        //TODO Issue with the line below this one
        const position = playerArray[i].player.position;
        if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {
            console.log(playerArray[i])
        }
    };
};

module.exports = {
    getRosterData: async (season) => {
        const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            },
            params: {
                season: season,
                team: `DAL`,
                rosterstatus: `assigned-to-roster`
            }
        });
        parseRoster(search.data.players);

        return ['Working', 0, 0, 0]
    },
    getMassData: async function () {
        const seasonList = [`2017-2018-regular`, `2018-2019-regular`];
        const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

        for (let i = 0; i < seasonList.length; i++) {
            for (let ii = 0; ii < weeks.length; ii++) {
                await this.getWeeklyData(seasonList[i], weeks[ii]);
                console.log('data has been updated')
            };
        };
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

        const weeklyPlayerArray = [];

        for (let i = 0; i < search.data.gamelogs.length; i++) {
            const position = search.data.gamelogs[i].player.position;
            let player = {};

            if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {

                //This is going to go two ways after this point
                //If the player is found in the database then go and update the record
                //This searches the database and then returns true if they are in there and false if they are not
                //If they are in the database then the findPlayerInDB function convers it. Since we are already accessing the database with this, there is no reason to try and pass it back and then go out again
                const playerInDB = await findPlayerInDB(search.data.gamelogs[i].player.id);

                //False is first because false is directly returned in querying the database
                if (!playerInDB) {
                    //They are not in the database. Init the object and then add them to an array which whill then be written to the database
                    console.log(`not in DB`, search.data.gamelogs[i].player.id)
                    player = await getNewPlayerStats(search.data.gamelogs[i].player, search.data.gamelogs[i].stats, search.data.gamelogs[i].team, season, week);
                    //If they are not found in the database, add them to an array and then
                    weeklyPlayerArray.push(player);
                } else {
                    updatePlayerWithCurrentWeek(playerInDB, search.data.gamelogs[i].stats, season, week);
                };
            };
        };
        if (weeklyPlayerArray.length >= 1) {
            addPlayerToDB(weeklyPlayerArray);
        };
        //TODO Do more than just send the same thing
        const response = {
            status: 200,
            text: `DB Updated`
        }
        console.log(`get weekly data done`)
        return response;
    }
};