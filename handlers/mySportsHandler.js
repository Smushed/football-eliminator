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

const writePlayerToDB = async (player) => {
    const playerInDB = await db.FantasyStats.find({ mySports_id: player.id });
    console.log(playerInDB);
    //TODO Start here. Make it so I can write players to the database
    //First check if the player is currently in the database
    //If they are not then create the record
    //If they are in the database then update the current week
    if (playerInDB == true) {
        console.log(`true`)
    } else {
        console.log(`false`)
    }
}

const getStats = (player, stats, season, week) => {
    const combinedStats = {};

    combinedStats.name = `${player.firstName} ${player.lastName}`;
    combinedStats.id = player.id;
    combinedStats.position = player.position;

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
        console.log(playerArray[i])
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
                team: `CHI`,
                rosterstatus: `assigned-to-roster`
            }
        });
        parseRoster(search.data.players);

        return ['Working', 0, 0, 0]
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

                player = getStats(search.data.gamelogs[i].player, search.data.gamelogs[i].stats, season, week);
                writePlayerToDB(player)
                weeklyPlayerArray.push(player)
            };
        };
        //TODO Send the weekly player array (or something like it) to a function to then write it to the database
        return weeklyPlayerArray;
    },
    getPlayerData: async (season, week) => {
        const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${week}/player_gamelogs.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            },
            params: {
                team: `CHI`,
                position: `qb`
            }
        });

        const builtPlayerArray = [{
            name: `${search.data.gamelogs[0].player.firstName} ${search.data.gamelogs[0].player.lastName}`,
            position: search.data.gamelogs[0].player.position,
            passYards: search.data.gamelogs[0].stats.passing.passingYards
        }];

        console.log(builtPlayerArray)
        return builtPlayerArray
    }
};