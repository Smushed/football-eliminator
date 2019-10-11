const db = require(`../models`);
const weekDates = require(`../constants/weekDates`);
const { DateTime } = require('luxon');

//This is here for when a user adds or drops a player. It fills out the object of the current week with 0s
fillOutRoster = (dbReadyRoster) => {
    const positions = [`QB`, `RB1`, `RB2`, `WR1`, `WR2`, `Flex`, `TE`, `K`];
    let filledRoster = {};

    //Iterate through the positions and ensure that it is full
    //This is done in case a user drops a player without adding a new one
    positions.forEach(position => {
        filledRoster[position] = dbReadyRoster[position] || 0;
    });

    return filledRoster;
};

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team.abbreviation': 'CHI' })

        return players
    },
    userRoster: async function (userId, week, season) {
        //This goes and grabs the user's roster that the page is currently on
        const currentRoster = await db.UserRoster.findOne({ userId: userId });

        //Parse the data we pulled out of the database and send it back in a useable format
        const parsedRoster = await this.getRosterPlayers(currentRoster, season, week)

        return parsedRoster;
    },
    dummyRoster: async (userId, week, season, dummyRoster) => { //Brute force updating a user's roster
        return new Promise((res, rej) => {
            db.UserRoster.findOne({ userId: userId }, (err, userRoster) => {
                const currentRoster = userRoster.roster[season][week].toJSON(); //Need to toJSON to chop off all the Mongo bits
                const currentUsedPlayerArray = userRoster.roster[season].usedPlayers;
                const currentRosterArray = Object.values(currentRoster);

                //Need to filter out all the 0s before we try and save it down into usedPlayers
                const filteredRosterArray = currentRosterArray.filter(playerId => playerId !== 0);
                const currentRosterSet = new Set(filteredRosterArray);
                //Filter out all the players that we removed from the roster that was in there
                const usedPlayers = currentUsedPlayerArray.filter((playerId) => !currentRosterSet.has(playerId));

                //TODO Some kind of flag or throw an error if the dummy player is already in there
                const dummyRosterArray = Object.values(dummyRoster);
                for (const player of dummyRosterArray) {
                    if (parseInt(player) !== 0) {
                        usedPlayers.push(player);
                    };
                };

                userRoster.roster[season][week] = dummyRoster;
                userRoster.roster[season].usedPlayers = usedPlayers;

                userRoster.save((err, result) => {
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
        const rosterWithoutDummyData = [];

        const responseRoster = {};
        for (const player of rosterArray) {
            if (player !== 0) {
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

                rosterWithoutDummyData.push(player);
            };
        };

        //We also return the array so the drag & drop component can populate this without having to pull it again
        responseRoster.playerArray = rosterWithoutDummyData;
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
    updateUserRoster: async (userId, dbReadyRoster, droppedPlayer, week, season, saveWithNoDrop) => {

        return new Promise((res, rej) => {
            db.UserRoster.findOne({ userId }, (err, currentRoster) => {
                //If the player is adding someone from the available player pool we remove the player they dropped and add the new player

                if (parseInt(droppedPlayer) !== 0) {
                    //Pulling the player they dropped out of the usedArray
                    const playerIndex = currentRoster.roster[season].usedPlayers.indexOf(parseInt(droppedPlayer));
                    currentRoster.roster[season].usedPlayers.splice(playerIndex, 1);

                    //Figuring out the player they just added to the array
                    //TODO Refactor this out. We use this exact thing below and for dummyRoster
                    const newRoster = Object.values(dbReadyRoster);
                    const dbSet = new Set(currentRoster.roster[season].usedPlayers);
                    const addedPlayer = newRoster.filter((playerId) => !dbSet.has(playerId));
                    if (addedPlayer.length !== 0) { //This checks if they dropped the only player for the current week
                        currentRoster.roster[season].usedPlayers.push(addedPlayer[0]);
                    };
                };

                if (saveWithNoDrop) {
                    const newRoster = Object.values(dbReadyRoster);
                    const dbSet = new Set(currentRoster.roster[season].usedPlayers);
                    const addedPlayer = newRoster.filter((playerId) => !dbSet.has(playerId));
                    currentRoster.roster[season].usedPlayers.push(addedPlayer[0]);
                };

                //Fills out the roster with 0s. This is in case a user drops a player without adding a new one
                const filledOutRoster = fillOutRoster(dbReadyRoster);

                //This iterates through the positions on the dbReadyRoster provided from the client and puts the players they want in the correct positions without overwriting the 0s
                Object.keys(filledOutRoster).forEach(position => {
                    currentRoster.roster[season][week][position] = filledOutRoster[position];
                });


                currentRoster.save((err, result) => {
                    if (err) {
                        //TODO Better error handling
                        res(err);
                    } else {
                        res(result);
                    };
                });
            });
        });
    },
    getAllRosters: async (season) => {
        //TODO Error handling
        return new Promise(async (res, rej) => {
            const rosterList = {};

            //Use the Exec for full promises in Mongoose
            const rosters = await db.UserRoster.find({}).exec();
            rosters.forEach(roster => rosterList[roster.userId] = { roster: roster.roster[season] });
            res(rosterList);
        });
    },
    checkLockPeriod: () => {
        const currentTime = DateTime.local().setZone(`America/Chicago`);
        const year = parseInt(currentTime.c.year);
        let lockYear = ``;

        if (year === 2020) {
            lockYear = `2019-2020-regular`;
        } else if (year === 2019) {
            lockYear = `2018-2019-regular`;
        };

        //Check if it's week 0
        if (currentTime < DateTime.fromISO(weekDates[year].lockDates[0].lockTime)) {
            return 0;
        };
        //Breaking this out to it's own function to ensure that people aren't saving their rosters past the lock period
        //If this wasn't it's own function and relied on the client to define the lock
        for (let i = 0; i < weekDates[year].lockDates.length; i++) {
            if (currentTime > DateTime.fromISO(weekDates[year].lockDates[i].lockTime)) {
                return { lockWeek: weekDates[year].lockDates[i].lockWeek, lockYear };
            };
        };
    }
};