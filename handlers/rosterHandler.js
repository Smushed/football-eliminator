const db = require(`../models`);

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team.abbreviation': 'CHI' })

        return players
    },
    userRoster: (userId) => {

        const currentRoster = db.UserRoster.findOne({ userId: userId })
        return currentRoster
    }
}