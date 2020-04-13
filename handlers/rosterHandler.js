const db = require(`../models`);
const { getPlayerWeeklyScore } = require(`./mySportsHandler`);
const userHandler = require(`./userHandler`);
const axios = require(`axios`);
require(`dotenv`).config();

//This is here for when a user adds or drops a player. It fills out the object of the current week with 0s
fillOutRoster = async (rosterFromDB) => {
    const filledOutRoster = [];
    //TODO DO THIS NEXT. FILL OUT ROSTER WITH PLAYERS
    for (let i = 0; i < rosterFromDB.length; i++) {
        if (rosterFromDB[i] === 0) {
            filledOutRoster.push({});
        } else {
            const player = await db.PlayerData.find({ M: rosterFromDB[i] });
            filledOutRoster.push(player);
        };
    };
    return filledOutRoster;
};

checkDuplicateRoster = async (checkedField, userId, groupId, season, week) => {
    let result = false;
    let searched;
    switch (checkedField) {
        case `userRoster`:
            try {
                searched = await db.UserRoster.findOne({ U: userId, W: week, G: groupId, S: season }).exec();
                if (searched !== null) {
                    result = true;
                };
            } catch (err) {
                console.log(err);
            };
            break;
        case `usedPlayers`:
            try {
                searched = await db.UsedPlayers.findOne({ U: userId, S: season, G: groupId }).exec();
                if (searched !== null) {
                    result = true;
                };
            } catch (err) {
                console.log(err);
            };
            break;
    };
    return result;
};

usedPlayersInReactTableFormat = (sortedPlayers) => {
    let checkLongest = 0;
    let arrayForTable = [];
    if (sortedPlayers.RB.length > sortedPlayers.WR.length) {
        checkLongest = sortedPlayers.RB.length;
    } else {
        checkLongest = sortedPlayers.WR.length;
    };

    for (let i = 0; i < checkLongest; i++) {
        arrayForTable[i] = {};
        if (typeof sortedPlayers.QB[i] !== `undefined`) {
            arrayForTable[i].QB = sortedPlayers.QB[i];
        };
        if (typeof sortedPlayers.RB[i] !== `undefined`) {
            arrayForTable[i].RB = sortedPlayers.RB[i];
        };
        if (typeof sortedPlayers.WR[i] !== `undefined`) {
            arrayForTable[i].WR = sortedPlayers.WR[i];
        };
        if (typeof sortedPlayers.TE[i] !== `undefined`) {
            arrayForTable[i].TE = sortedPlayers.TE[i];
        };
        if (typeof sortedPlayers.K[i] !== `undefined`) {
            arrayForTable[i].K = sortedPlayers.K[i];
        };
    };
    return arrayForTable;
};

checkForAvailablePlayers = (usedPlayers, searchedPlayers) => {
    //usedPlayers is the array from the database of all players that the user has used
    //We need to grab ALL the playerIds that are currently active in the database and pull out any that are in the usedPlayers array

    //This turns the array into a set which then we iterate over the fantasy players we pulled from the DB and pull out duplicates
    const usedPlayerSet = new Set(usedPlayers);

    //This creates an array of objects. We need to turn this into an object for all the players and an array of all player Ids
    const availablePlayerArray = searchedPlayers.filter((player) => !usedPlayerSet.has(player.mySportsId));

    const sortedPlayerArray = sortPlayersByRank(availablePlayerArray);

    return sortedPlayerArray;
};

sortPlayersByRank = (playerArray) => {
    playerArray.sort((a, b) => { return a.rank - b.rank });
    return playerArray;
};

getUsedPlayers = async (userId, season) => {
    const currentUser = await db.UserRoster.findOne({ userId: userId }).exec();

    return currentUser.roster[season].usedPlayers;
};

getPlayerScore = async (currentRoster, season, week) => {
    //Goes through the roster of players and pulls in their full data to then display
    currentRoster = currentRoster.roster[season][week].toObject();

    rosterArray = Object.values(currentRoster);

    const responseRoster = [];
    for (const player of rosterArray) {
        if (player !== 0) {
            //Go through the object that was given to us
            const response = await db.FantasyStats.findOne({ mySportsId: player }, { mySportsId: 1, full_name: 1, position: 1, rank: 1, team: 1 })
            responseRoster.push(response)
        };
    };

    //We also return the array so the drag & drop component can populate this without having to pull it again
    return responseRoster;
};

createUsedPlayers = async (userId, season, groupId) => {
    const isDupe = await checkDuplicateRoster(`usedPlayers`, userId, groupId, season, null);
    if (!isDupe) {
        return db.UsedPlayers.create({ U: userId, S: season, G: groupId });
    };
};

createWeeklyRoster = async (userId, week, season, groupId) => {
    const groupRoster = await db.GroupRoster.findOne({ G: groupId });

    //The roster on the UserRoster Schema is an array of MySportsPlayerIDs
    const userRoster = groupRoster.P.map(position => 0);
    const weeksRoster = { U: userId, W: week, S: season, G: groupId, R: userRoster };
    return db.UserRoster.create(weeksRoster).exec();
};

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team': 'CHI' })

        return players
    },
    dummyRoster: async (userId, groupId, week, season, dummyRoster) => { //Brute force updating a user's roster
        return new Promise((res, rej) => {
            db.UserRoster.findOne({ U: userId, G: groupId, W: week, S: season }, async (err, userRoster) => {
                if (userRoster === null) {
                    userRoster = await db.UserRoster.create({ U: userId, G: groupId, W: week, S: season });
                };
                await db.UsedPlayers.findOne({ U: userId, S: season, G: groupId }, async (err, usedPlayers) => {
                    if (usedPlayers === null) {
                        usedPlayers = createUsedPlayers(userId, season, groupId);
                    };
                    //Create a set of players currently in the week. We want to pull them out of the UsedPlayer Array when we update them
                    const rosterArray = Object.values(userRoster);
                    const currentRoster = new Set(rosterArray.filter(playerId => playerId !== 0));
                    const currentUsedPlayerArray = usedPlayers.UP;

                    //filter out all the players who are being pulled from the current week
                    const updatedUsedPlayers = currentUsedPlayerArray.filter((playerId) => !currentRoster.has(playerId));

                    //Add in all the players from the new players to the used player array
                    const dummyRosterArray = Object.values(dummyRoster);

                    for (const player of dummyRosterArray) {
                        if (parseInt(player) !== 0) {
                            updatedUsedPlayers.push(player);
                        };
                    };

                    usedPlayers.UP = updatedUsedPlayers;
                    usedPlayers.save((err, result) => {
                        if (err) {
                            console.log(err);
                        };
                    });
                });
                userRoster.R = dummyRoster;
                userRoster.save((err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res(result);
                    };
                });


                // const currentRoster = userRoster.roster[season][week].toJSON(); //Need to toJSON to chop off all the Mongo bits
                // const currentUsedPlayerArray = userRoster.roster[season].usedPlayers;
                // const currentRosterArray = Object.values(currentRoster);

                //Need to filter out all the 0s before we try and save it down into usedPlayers
                // const filteredRosterArray = currentRosterArray.filter(playerId => playerId !== 0);
                // const currentRosterSet = new Set(filteredRosterArray);
                //Filter out all the players that we removed from the roster that was in there
                // const usedPlayers = currentUsedPlayerArray.filter((playerId) => !currentRosterSet.has(playerId));

                // //TODO Some kind of flag or throw an error if the dummy player is already in there
                // const dummyRosterArray = Object.values(dummyRoster);
                // for (const player of dummyRosterArray) {
                //     if (parseInt(player) !== 0) {
                //         usedPlayers.push(player);
                //     };
                // };

                // userRoster.roster[season][week] = dummyRoster;
                // userRoster.roster[season].usedPlayers = usedPlayers;

                // userRoster.save((err, result) => {
                //     if (err) {
                //         //TODO Better error handling
                //         console.log(err);
                //     } else {
                //         res(result);
                //     };
                // });
            });
        });
    },
    getRosterPlayers: async (currentRoster) => {
        //Goes through the roster of players and pulls in their full data to then display
        currentRoster = currentRoster.roster.toObject();

        rosterArray = Object.values(currentRoster);

        const responseRoster = [];
        for (const player of rosterArray) {
            if (player !== 0) {
                //Go through the object that was given to us
                const response = await db.PlayerStats.findOne({ M: player }, { M: 1, N: 1, P: 1, R: 1, T: 1 });
                responseRoster.push(response);
            };
        };

        //We also return the array so the drag & drop component can populate this without having to pull it again
        return responseRoster;
    },
    availablePlayers: async (userId, searchedPosition, season) => {

        const usedPlayers = await getUsedPlayers(userId, season);

        //usedPlayers is the array from the database of all players that the user has used
        //We need to grab ALL the playerIds that are currently active in the database and pull out any that are in the usedPlayers array
        const searchedPlayers = await db.FantasyStats.find({ active: true, position: searchedPosition }, { mySportsId: 1, full_name: 1, position: 1, rank: 1, team: 1 });

        const availablePlayers = checkForAvailablePlayers(usedPlayers, searchedPlayers);

        return availablePlayers;
    },
    updateUserRoster: async (userId, roster, droppedPlayer, week, season, saveWithNoDrop) => {
        return new Promise((res, rej) => {
            const dbReadyRoster = {};
            for (const position in roster) {
                dbReadyRoster[position] = roster[position].mySportsId;
            };

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
    // checkLockPeriod: async () => {
    //     let currentTime = ``;
    //     let year = ``;
    //     let lockYear = ``;

    //     await axios.get(`http://api.timezonedb.com/v2.1/get-time-zone`, {
    //         params: {
    //             key: timezoneAPI,
    //             format: `json`,
    //             by: `zone`,
    //             zone: `America/Chicago`
    //         }
    //     }).then(res => {
    //         year = parseInt(res.data.formatted.substring(0, 4));

    //         //Making the format work for the Luxon Parser
    //         currentTime = DateTime.fromISO(`${res.data.formatted.replace(/ /g, "T")}Z`);
    //     }).catch(err => {
    //         //If the API fails we use Luxon (which has caused issues on Google Cloud)
    //         currentTime = DateTime.local().setZone(`America/Chicago`);
    //         year = parseInt(currentTime.c.year);
    //     });

    //     if (year === 2020) {
    //         lockYear = `2019-2020-regular`;
    //     } else if (year === 2019) {
    //         lockYear = `2018-2019-regular`;
    //     };

    //     //Check if it's week 0
    //     if (currentTime < DateTime.fromISO(weekDates[year].lockDates[0].lockTime)) {
    //         return 0;
    //     };
    //     //Breaking this out to it's own function to ensure that people aren't saving their rosters past the lock period
    //     //If this wasn't it's own function and relied on the client to define the lock
    //     for (let i = 16; i >= 0; i--) { //Going down to check for the latest locked week
    //         if (currentTime > DateTime.fromISO(weekDates[year].lockDates[i].lockTime)) {
    //             return { lockWeek: weekDates[year].lockDates[i].lockWeek, lockYear };
    //         };
    //     };
    // },
    usedPlayersForTable: async (userId, season) => {
        const sortedPlayers = { 'QB': [], 'RB': [], 'WR': [], 'TE': [], 'K': [] };
        let usedPlayerArray = [];
        let arrayForTable = [];

        const currentRoster = await db.UserRoster.findOne({ userId }).exec();
        usedPlayerArray = currentRoster.roster[season].usedPlayers;

        for (let i = 0; i < usedPlayerArray.length; i++) {
            let player = await db.FantasyStats.findOne({ mySportsId: usedPlayerArray[i] }, { position: 1, full_name: 1 });
            sortedPlayers[player.position].push(player.full_name);
        };

        arrayForTable = usedPlayersInReactTableFormat(sortedPlayers);

        return arrayForTable;
    },
    searchPlayerByTeam: async (userId, team, season) => {

        const usedPlayers = await getUsedPlayers(userId, season);

        const playersByTeam = await db.FantasyStats.find({ team: team }, { mySportsId: 1, rank: 1, full_name: 1, position: 1, team: 1 });

        const availablePlayers = checkForAvailablePlayers(usedPlayers, playersByTeam);

        return availablePlayers;
    },
    allSeasonRoster: async function (userId, season) {
        //This goes through a users data and get each week
        const scoredAllSeason = [];

        //Go to 16 because the javascript needs to start at 0. Just account for it here and on the front end
        for (let i = 16; i >= 0; i--) {
            const weeklyUserRoster = await this.userRoster(userId, i + 1, season);
            const parsedWeeklyRoster = [];

            for (let ii = 0; ii < weeklyUserRoster.length; ii++) {
                const newPlayer = {
                    full_name: weeklyUserRoster[ii].full_name,
                    team: weeklyUserRoster[ii].team,
                    position: weeklyUserRoster[ii].position,
                    mySportsId: weeklyUserRoster[ii].mySportsId
                };

                const playerScore = await getPlayerWeeklyScore(newPlayer.mySportsId, season, i + 1);

                newPlayer.score = playerScore.toFixed(2);

                parsedWeeklyRoster.push(newPlayer);
            };
            scoredAllSeason[i] = parsedWeeklyRoster;
        };

        return scoredAllSeason;
    },
    createAllRosters: async function (season) {
        //Get all the users
        //Then send them to create season roster
        const userList = await userHandler.getUserList();
        for (let i = 0; i < userList.length; i++) {
            for (let ii = 0; ii < userList[i].groupList.length; ii++) {
                createUsedPlayers(userList[i], season, userList[i].groupList[ii]);
                this.createSeasonRoster(userList[i]._id, season, userList[i].groupList[ii])
            };
        };
    },
    // createSeasonRoster: async (userId, season, groupId) => { //TODO Not used right now because if the group switches up the roster construction this won't be able to handle it
    //     //First be sure to create a UserScore document for the user
    //     userHandler.createUserScore(userId, season, groupId);
    //     console.log(`user score created`)
    //     //First check if there has been a roster created for a week
    //     //If so, skip it and move to the next one
    //     for (let i = 1; i <= 17; i++) {
    //         const dupeCheck = await checkDuplicateRoster('userRoster', userId, groupId, season, i);
    //         if (!dupeCheck) {
    //             const roster = {
    //                 U: userId,
    //                 G: groupId,
    //                 W: i,
    //                 S: season
    //             };
    //             await db.UserRoster.create(roster);
    //         };
    //     };
    //     return `working`;
    // },
    getUserRoster: async (userId, week, season, groupId) => {
        //This grabs the user roster, and if not it creates one.
        let roster = await db.UserRoster.findOne({ U: userId, W: week, S: season, G: groupId }, { R: 1 });
        if (roster === null) {
            roster = await createWeeklyRoster(userId, week, season, groupId);
        };
        const filledRoster = fillOutRoster(roster.R);
        return filledRoster;
    }
};