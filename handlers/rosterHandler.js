const db = require(`../models`);

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team.abbreviation': 'CHI' })

        return players
    },
    userRoster: async function (userId) {
        //TODO dynamically do season and week
        const season = '2019-2020-regular';
        const week = 1;

        //This goes and grabs the user's roster that the page is currently on
        const currentRoster = await db.UserRoster.findOne({ userId: userId });

        //Parse the data we pulled out of the database and send it back in a useable format
        const parsedRoster = await this.getRosterPlayers(currentRoster, season, week)


        return parsedRoster;
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

        //usedPlayers in the database is an array of mySportsIds. This will overwrite all the used players if there are any in the database
        const usedPlayers = [7549, 8469, 5940, 5946, 6477, 9910, 7485, 8003]

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
            responseRoster[player].position = response.position;
        };

        //We also return the array so the drag & drop component can populate this without having to pull it again
        responseRoster.playerArray = rosterArray;
        return responseRoster;
    },
    availablePlayers: async (userId, searchedPosition) => {
        //TODO dynamically do season and week
        const season = '2019-2020-regular';

        const currentPlayer = await db.UserRoster.findOne({ userId: userId });

        const usedPlayers = currentPlayer.roster[season].usedPlayers;

        //usedPlayers is the array from the database of all players that the user has used
        //We need to grab ALL the playerIds that are currently active in the database and pull out any that are in the usedPlayers array
        //Then maybe sort by position? There needs to be some sort of sorting, otherwise we are going to have a GIGANTIC list of available players
        const activePlayers = await db.FantasyStats.find({ active: true, position: searchedPosition });
        //This turns the array into a set which then we iterate over the fantasy players we pulled from the DB and pull out duplicates
        const usedPlayerSet = new Set(usedPlayers);

        //This creates an array of objects. We need to turn this into an object for all the players and an array of all player Ids
        const availablePlayerArray = activePlayers.filter((player) => !usedPlayerSet.has(player.mySportsId));

        const availablePlayerIdArray = availablePlayerArray.map(({ mySportsId }) => mySportsId);

        const responseAvailablePlayers = { idArray: availablePlayerIdArray };

        for (const player of availablePlayerArray) {
            //Go through the object that was given to us
            //Declaring what needs to be declared for the nested objects
            responseAvailablePlayers[player.mySportsId] = {};
            responseAvailablePlayers[player.mySportsId].stats = {};
            responseAvailablePlayers[player.mySportsId].stats[season] = {};

            //Parsing the roster and pulling in all the data we need
            responseAvailablePlayers[player.mySportsId].team = player.team.abbreviation;
            responseAvailablePlayers[player.mySportsId].stats[season] = player.stats[season];
            responseAvailablePlayers[player.mySportsId].full_name = player.full_name;
            responseAvailablePlayers[player.mySportsId].mySportsId = player.mySportsId;
            responseAvailablePlayers[player.mySportsId].position = player.position;
        };

        return responseAvailablePlayers;
    },
    updateUserRoster: async (userId, newRoster, droppedPlayer) => {
        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        console.log(date)

        // return new Promise((res, rej) => {
        //     db.UserRoster.findOne({ userId }, (err, currentRoster) => {
        //         currentRoster.roster[season][week] = dummyRoster;
        //         currentRoster.roster[season].usedPlayers = usedPlayers;

        //         currentRoster.save((err, result) => {
        //             if (err) {
        //                 //TODO Better error handling
        //                 console.log(err);
        //             } else {
        //                 res(result);
        //             };
        //         });
        //     });
        // });
        return `working`
    }
};