const db = require(`../models`);

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team.abbreviation': 'CHI' })

        return players
    },
    availablePlayers: (userID) => {
        return 'working'
    }
}