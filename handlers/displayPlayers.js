const db = require(`../models`);
const axios = require(`axios`);

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team.abbreviation': 'CHI' })

        return players
    },
    playerRoster: () => {

    }
}