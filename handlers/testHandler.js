const db = require(`../models`);
const axios = require(`axios`);
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API

const getStats = (player, stats, season, week) => {
    const combinedStats = {};

    combinedStats.name = `${player.firstName} ${player.lastName}`;
    combinedStats.id = player.id;
    combinedStats.position = player.position;

    //TODO Iterate through the different stats and check if available. If so then put them into the player object
    combinedStats.stats = {
        [season]: {
            [week]: {
                passYards: stats.passing.passYards
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
    getGameData: async (season, week) => {
        const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${week}/player_gamelogs.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            }
        });

        // const builtPlayerArray = [{
        //     name: `${search.data.gamelogs[0].player.firstName} ${search.data.gamelogs[0].player.lastName}`,
        //     position: search.data.gamelogs[0].player.position,
        //     passYards: search.data.gamelogs[0].stats.passing.passingYards
        // }]

        // console.log(builtPlayerArray)

        const weeklyPlayerArray = [];

        for (let i = 0; i < search.data.gamelogs.length; i++) {
            const position = search.data.gamelogs[i].player.position;
            let player = {};

            if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {
                player = getStats(search.data.gamelogs[i].player, search.data.gamelogs[i].stats, season, week);
                console.log(player)
            };
        };
        return ['Working', 0, 0, 0];
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