const db = require(`../models`);
const { getPlayerWeeklyScore } = require(`./mySportsHandler`);
const userHandler = require(`./userHandler`);
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
    const availablePlayerArray = searchedPlayers.filter((player) => !usedPlayerSet.has(player.M));

    const sortedPlayerArray = sortPlayersByRank(availablePlayerArray);

    return sortedPlayerArray;
};

sortPlayersByRank = (playerArray) => {
    playerArray.sort((a, b) => { return a.rank - b.rank });
    return playerArray;
};

getUsedPlayers = async (userId, season, groupId) => {
    const currentUser = await db.UsedPlayers.findOne({ U: userId, S: season }).exec();
    if (currentUser === null) {
        const createdUsedPlayers = createUsedPlayers(userId, season, groupId);
        return createdUsedPlayers.UP;
    };

    return currentUser.UP;
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

createUsedPlayers = (userId, season, groupId) => {
    return new Promise(async (res, rej) => {
        const isDupe = await checkDuplicateRoster(`usedPlayers`, userId, groupId, season, null);
        let newRecord;
        if (!isDupe) {
            newRecord = db.UsedPlayers.create({ U: userId, S: season, G: groupId }).exec();
        };
        res(newRecord);
    })
};

createWeeklyRoster = async (userId, week, season, groupId) => {
    //TODO ISSUE CREATING MULTIPLE WEEKLY ROSTERS
    const groupRoster = await db.GroupRoster.findOne({ G: groupId });
    //The roster on the UserRoster Schema is an array of MySportsPlayerIDs

    const userRoster = groupRoster.P.map(position => 0);
    const weeksRoster = { U: userId, W: week, S: season, G: groupId, R: userRoster };
    return await db.UserRoster.create(weeksRoster);
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
                    const rosterArray = Object.values(userRoster.R);
                    const currentRoster = new Set(rosterArray.filter(playerId => playerId !== 0));
                    const currentUsedPlayerArray = usedPlayers.UP;
                    //filter out all the players who are being pulled from the current week
                    const updatedUsedPlayers = currentUsedPlayerArray.filter((playerId) => !currentRoster.has(+playerId));

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
    availablePlayers: async (userId, searchedPosition, season, groupId) => {

        const usedPlayers = await getUsedPlayers(userId, season, groupId);

        //usedPlayers is the array from the database of all players that the user has used
        //We need to grab ALL the playerIds that are currently active in the database and pull out any that are in the usedPlayers array
        const searchedPlayers = await db.PlayerData.find({ A: true, P: searchedPosition }, { M: 1, N: 1, P: 1, R: 1, T: 1 });

        const availablePlayers = checkForAvailablePlayers(usedPlayers, searchedPlayers);

        return availablePlayers;
    },
    //TODO FIGURE OUT THE ADD WITHOUT DROP
    updateUserRoster: async (userId, roster, droppedPlayer, addedPlayer, week, season, saveWithNoDrop) => {
        return new Promise(async (res, rej) => {
            const usedPlayers = await db.UsedPlayers.findOne({ U: userId });
            let newUsedPlayers = [];
            for (const playerId of usedPlayers.UP) {
                //TODO START HERE THIS IS ANNOYING
                if (!saveWithNoDrop) {
                    if (playerId !== +droppedPlayer) {
                        newUsedPlayers.push(playerId);
                    };
                } else {
                    newUsedPlayers = usedPlayers.UP;
                };
                newUsedPlayers.push(addedPlayer);
            };
            usedPlayers.UP = newUsedPlayers;
            await usedPlayers.save();

            const currentRoster = await db.UserRoster.findOne({ U: userId, W: week, S: season });
            const newRoster = [];
            for (const player of roster) {
                newRoster.push(+player.M || 0);
            };
            currentRoster.R = newRoster;
            await currentRoster.save();
            res(currentRoster.R);
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
    getUserRoster: async (userId, week, season, groupId) => {
        //This grabs the user roster, and if not it creates one.
        let roster = await db.UserRoster.findOne({ U: userId, W: week, S: season, G: groupId }, { R: 1 });
        if (roster === null) {
            roster = await createWeeklyRoster(userId, week, season, groupId);
        };
        const filledRoster = (roster.R);
        return filledRoster;
    },
    checkLockPeriod: async () => {
        const lockPeroid = await db.SeasonAndWeek.findOne();
        return lockPeroid;
    }
};