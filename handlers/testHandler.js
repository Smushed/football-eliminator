const db = require(`../models`);
const axios = require(`axios`);
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API

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
            },
            params: {
                team: `CHI`,
                position: `qb`
            }
        });
        console.log(search.data.gamelogs[0].stats.passing)
        return ['Working', 0, 0, 0]
    }
}