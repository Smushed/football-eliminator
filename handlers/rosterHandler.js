const db = require(`../models`);

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team.abbreviation': 'CHI' })

        return players
    },
    userRoster: async function (userId, currentUser) {
        //TODO dynamically do season and week
        const season = '2019-2020-regular';
        const week = 1;
        //This goes and grabs the user's roster that the page is on

        const currentRoster = await db.UserRoster.findOne({ userId: userId });
        //If the user is currently looking at their page, then currentUser will be true
        //This then will push the currentRoster along further to get the available players
        return this.getRosterPlayers(currentRoster, season, week)
    },
    dummyRoster: async (userId) => {
        //TODO Error handling if userId is undefined
        const season = '2019-2020-regular';
        const week = 1;

        //The userRoster can ONLY be numbers. We will then pull from the sheet at another time
        const dummyRoster = {
            QB: 7549,
            RB1: 8469,
            RB2: 5940,
            WR1: 5946,
            WR2: 6477,
            Flex: 9910,
            TE: 7485,
            K: 8003
        };

        const usedPlayers = [8190, 7564, 13255, 14830, 7198, 8562, 7299, 6460]

        //TODO Can I do a findOneAndUpdate instead of getting it, processing and then rewriting it?
        return new Promise((res, rej) => {
            db.UserRoster.findOne({ userId: userId }, (err, currentRoster) => {
                currentRoster.roster[season][week] = dummyRoster;
                currentRoster.roster[season].usedPlayers = usedPlayers;

                currentRoster.save((err, result) => {
                    if (err) {
                        //TODO Better error handling
                        console.log(err);
                    } else {
                        res(result);
                    };
                });
            });
        });
    },
    getRosterPlayers: async (currentRoster, season, week) => {
        //Goes through the roster of players and pulls in their full data to then display
        currentRoster = currentRoster.roster[season][week].toJSON(); //Must be toJSON otherwise there will be mongo built in keys and methods
        rosterArray = Object.values(currentRoster);

        const responseRoster = {};
        for (const player of rosterArray) {
            //Go through the object that was given to us
            const response = await db.FantasyStats.findOne({ mySportsId: player })

            //Declaring what needs to be declared for the nested objects
            responseRoster[player] = {};
            responseRoster[player].stats = {};
            responseRoster[player].stats[season] = {};

            //Parsing the roster and pulling in all the data we need
            responseRoster[player].team = response.team.abbreviation;
            responseRoster[player].stats[season] = response.stats[season];
            responseRoster[player].full_name = response.full_name;
            responseRoster[player].mySportsId = response.mySportsId;
            responseRoster[player].position = response.team.position;
        };

        //We also return the array so the drag & drop component can populate this without having to pull it again
        responseRoster.playerArray = rosterArray
        return (responseRoster);
    }//Next method goes here
};