const db = require(`../models`);
const axios = require(`axios`);
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API

const placeholderStats = (stats) => {
    //This goes through the returned stats and adds a blank object to any field where the player doesn't have any information
    //This is done for the getStats function. It needs to have an object to read
    const scoringArray = [`passing`, `rushing`, `receiving`, `fumbles`, `kickoffReturns`, `puntReturns`, `twoPointAttempts`, `extraPointAttempts`]

    for (let i = 0; i <= 7; i++) {
        if (typeof (stats[scoringArray[i]]) == `undefined`) {
            stats[scoringArray[i]] = {};
        }
    }
}

const getStats = (player, stats, season, week) => {
    const combinedStats = {};

    combinedStats.name = `${player.firstName} ${player.lastName}`;
    combinedStats.id = player.id;
    combinedStats.position = player.position;

    placeholderStats(stats)

    //TODO Iterate through the different stats and check if available. If so then put them into the player object
    combinedStats.stats = {
        [season]: {
            [week]: {
                passYards: stats.passing.passYards || 0
            }
        }
    };
    return combinedStats;
}

module.exports = {
    getRosterData: async () => {
        const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            },
            params: {
                season: `2018-2019-regular`,
                team: `CHI`,
                rosterstatus: `assigned-to-roster`
            }
        });
        console.log(search.data.players[0], search.data.players.length)
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
                weeklyPlayerArray.push(player)
            };
        };
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