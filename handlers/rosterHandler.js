const db = require(`../models`);

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team.abbreviation': 'CHI' })

        return players
    },
    userRoster: (userId) => {

        const currentRoster = db.UserRoster.findOne({ userId: userId });
        return currentRoster;
    },
    dummyRoster: async (userId) => {
        //TODO Error handling if userId is undefined
        const season = '2019-2020-regular';
        const week = 1;
        // const dummyRoster = {
        //     7549: { full_name: 'Tom Brady', mySportsId: 7549, position: 'QB', team: 'NE' },
        //     8102: { full_name: "Le'Veon Bell", mySportsId: 8102, position: 'RB', team: 'NYJ' },
        //     5940: { full_name: 'David Johnson', mySportsId: 5940, position: 'RB', team: 'ARI' },
        //     5946: { full_name: 'Larry Fitzgerald', mySportsId: 5946, position: 'WR', team: 'ARI' },
        //     6477: { full_name: 'A.J. Green', mySportsId: 6477, position: 'WR', team: 'CIN' },
        //     9910: { full_name: 'Tyreek Hill', mySportsId: 9910, position: 'WR', team: 'KC' },
        //     7485: { full_name: 'Kyle Rudolph', mySportsId: 7485, position: 'TE', team: 'NE' },
        //     8003: { full_name: 'Sebastian Janikowski', mySportsId: 8003, position: 'K', team: 'SEA' }
        // };

        //The userRoster can ONLY be numbers. We will then pull from the sheet at another day
        const dummyRoster2 = {
            QB: 7549,
            RB1: 8102,
            RB2: 5940,
            WR1: 5946,
            WR2: 6477,
            Flex: 9910,
            TE: 7485,
            K: 8003
        };

        let updatedRoster = {};

        //TODO Can I do a findOneAndUpdate instead of getting it, processing and then rewriting it?
        await db.UserRoster.findOne({ userId: userId }, (err, currentRoster) => {
            currentRoster.roster[season][week] = dummyRoster2;

            console.log(currentRoster)

            currentRoster.save((err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    updatedRoster = result;
                    console.log(`inside`, updatedRoster)
                    return updatedRoster
                }
            })

        });


        // const updatedRoster = await db.UserRoster.findOneAndUpdate({ userId: userId }, { '$set': { 'roster[season][week]': currentRoster.roster[season][week] } }, { new: true });

    }
}