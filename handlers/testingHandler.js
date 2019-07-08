const axios = require(`axios`);
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API

module.exports = {
    currentRoster: async () => {

        const season = '2019-2020-regular';

        const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            },
            params: {
                season: season,
                team: `NYJ`,
                rosterstatus: `assigned-to-roster`
            }
        });
        return search.data.players;
    }
}