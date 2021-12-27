require(`dotenv`).config();
const db = require(`../models`);
const userHandler = require(`./userHandler`);
const groupHandler = require(`./groupHandler`);
const mySportsHandler = require(`./mySportsHandler`);

const checkDuplicateRoster = async (checkedField, userId, groupId, season, week) => {
    let result = false;
    let searched;
    switch (checkedField) {
        case `userRoster`:
            try {
                searched = await db.UserRoster.findOne({ U: userId, W: week, G: groupId, S: season }).exec();
                if (searched !== null) {
                    return true;
                }
            } catch (err) {
                console.log(err);
            }
            break;
        case `usedPlayers`:
            try {
                searched = await db.UsedPlayers.findOne({ U: userId, S: season, G: groupId }).exec();
                if (searched !== null) {
                    return true;
                }
            } catch (err) {
                console.log(err);
            }
            break;
    }
    return result;
};

const checkForAvailablePlayers = (usedPlayers, searchedPlayers) => {
    const usedPlayerSet = new Set(usedPlayers);

    const availablePlayerArray = searchedPlayers.filter((player) => !usedPlayerSet.has(player.M));

    const sortedPlayerArray = sortPlayersByRank(availablePlayerArray);

    return sortedPlayerArray;
};

const sortPlayersByRank = (playerArray) => {
    playerArray.sort((a, b) => { return a.R - b.R });
    return playerArray;
};

const getUsedPlayers = async (userId, season, groupId) => {
    const currentUser = await db.UsedPlayers.findOne({ U: userId, S: season, G: groupId }).exec();
    if (currentUser === null) {
        const createdUsedPlayers = await createUsedPlayers(userId, season, groupId);
        return createdUsedPlayers.UP;
    } else {
        return currentUser.UP;
    }
};

const createUsedPlayers = (userId, season, groupId) => {
    return new Promise(async (res, rej) => {
        const isDupe = await checkDuplicateRoster(`usedPlayers`, userId, groupId, season, null);
        let newRecord;
        if (!isDupe) {
            newRecord = await db.UsedPlayers.create({ U: userId, S: season, G: groupId });
        }
        res(newRecord);
    })
};

const checkDupeWeeklyRoster = async (userId, week, season, groupId) => {
    const search = await db.UserRoster.findOne({ U: userId, W: week, S: season, G: groupId }).exec();
    if (search !== null) {
        return true;
    } else {
        return false;
    }
};

const createWeeklyRoster = async function (userId, week, season, groupId) {
    const groupRoster = await db.GroupRoster.findOne({ G: groupId });
    //The roster on the UserRoster Schema is an array of MySportsPlayerIDs
    const dupe = await checkDupeWeeklyRoster(userId, week, season, groupId);
    if (dupe) { return false }

    const userRoster = groupRoster.P.map(position => ({ M: 0, S: 0 }));
    const weeksRoster = { U: userId, W: week, S: season, G: groupId, R: userRoster };
    return await db.UserRoster.create(weeksRoster);
};

const getAllRostersByGroupAndWeek = async (season, week, groupId) => {
    return new Promise(async (res, rej) => {
        const group = await db.Group.findById([groupId]).exec();
        const userRosters = await db.UserRoster.find({ S: season, W: week, G: groupId }).exec();
        const completeRosters = userRosters.slice(0);
        if (group.UL.length !== userRosters.length) {
            for (let user of group.UL) {
                let isIncluded = false;
                for (let userRoster of userRosters) {
                    if (userRoster.U.toString() === user.ID.toString()) {
                        isIncluded = true;
                    }
                }
                if (!isIncluded) {
                    completeRosters.push(await createWeeklyRoster(user.ID, week, season, groupId));
                }
            }
        }
        res(completeRosters);
    });
};

const sortUsersByScore = async (userRosterArray, groupId, season) => {
    return new Promise(async res => {
        const sortedScores = [];
        for (let user of userRosterArray) {
            const userScore = await db.UserScores.findOne({ U: user.UID, G: groupId, S: season }, 'TS').exec();
            if (!userScore) { continue; }
            sortedScores.push({ UID: user.UID, UN: user.UN, R: user.R, TS: userScore.TS });
        }
        sortedScores.sort((a, b) => b.TS - a.TS);
        res(sortedScores);
    });
};

const pullGroupRostersForScoring = async (season, week, groupId) => {
    return new Promise(async (res, rej) => {
        const allRosters = await getAllRostersByGroupAndWeek(season, week, groupId);
        res(allRosters);
    });
};

module.exports = {
    byRoster: async () => {
        const players = await db.FantasyStats.find({ 'team': 'CHI' });

        return players;
    },
    dummyRoster: async (userId, groupId, week, season, dummyRoster) => { //Brute force updating a user's roster
        return new Promise((res, rej) => {

            db.UserRoster.findOne({ U: userId, G: groupId, W: week, S: season }, async (err, userRoster) => {
                if (userRoster === null) {
                    userRoster = await db.UserRoster.create({ U: userId, G: groupId, W: week, S: season });
                }
                await db.UsedPlayers.findOne({ U: userId, S: season, G: groupId }, async (err, usedPlayers) => {
                    if (usedPlayers === null) {
                        usedPlayers = createUsedPlayers(userId, season, groupId);
                    }
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
                        }
                    }

                    usedPlayers.UP = updatedUsedPlayers;
                    usedPlayers.save((err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
                userRoster.R = dummyRoster;
                userRoster.save((err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res(result);
                    }
                });
            });
        });
    },
    getRosterPlayers: async (currentRoster) => {
        //Goes through the roster of players and pulls in their full data to then display
        currentRoster = currentRoster.roster.toObject();

        const rosterArray = Object.values(currentRoster);

        const responseRoster = [];
        for (const player of rosterArray) {
            if (player !== 0) {
                //Go through the object that was given to us
                const response = await db.PlayerStats.findOne({ M: player }, { M: 1, N: 1, P: 1, R: 1, T: 1 }).exec();
                responseRoster.push(response);
            }
        }

        //We also return the array so the drag & drop component can populate this without having to pull it again
        return responseRoster;
    },
    availablePlayers: async (userId, searchedPosition, season, groupId) => {

        const usedPlayers = await getUsedPlayers(userId, season, groupId);

        //usedPlayers is the array from the database of all players that the user has used
        //We need to grab ALL the playerIds that are currently active in the database and pull out any that are in the usedPlayers array
        const searchedPlayers = await db.PlayerData.find({ A: true, P: searchedPosition }, { M: 1, N: 1, P: 1, R: 1, T: 1, I: 1 }).exec();
        const availablePlayers = checkForAvailablePlayers(usedPlayers, searchedPlayers);

        return availablePlayers;
    },
    updateUserRoster: async (userId, groupId, roster, droppedPlayer, addedPlayer, week, season) => {
        return new Promise(async (res, rej) => {
            const usedPlayers = await db.UsedPlayers.findOne({ U: userId, S: season });
            let newUsedPlayers = [];
            for (const playerId of usedPlayers.UP) {
                if (playerId !== +droppedPlayer) {
                    newUsedPlayers.push(playerId);
                }
            }
            newUsedPlayers.push(addedPlayer);
            usedPlayers.UP = newUsedPlayers;
            await usedPlayers.save();

            const currentRoster = await db.UserRoster.findOne({ U: userId, G: groupId, W: week, S: season }).exec();
            const newRoster = [];
            for (const player of roster) {
                newRoster.push({ M: +player.M, S: 0 } || 0);
            }
            currentRoster.R = newRoster;
            await currentRoster.save();
            res(currentRoster.R);
        });
    },
    getAllRostersForGroup: async (season, week, groupId) => {
        return new Promise(async (res, rej) => {
            const userRosters = [];
            const allRosters = await getAllRostersByGroupAndWeek(season, week, groupId);
            for (const roster of allRosters) {
                const filledRoster = await mySportsHandler.fillUserRoster(roster.R);
                const user = await db.User.findById(roster.U);
                userRosters.push({ UID: user._id, UN: user.UN, R: filledRoster });
            }
            const sortedUsers = await sortUsersByScore(userRosters, groupId, season);
            res(sortedUsers);
        });
    },
    usedPlayersByPosition: async (userId, season, groupId) => {
        const sortedPlayers = { 'QB': [], 'RB': [], 'WR': [], 'TE': [], 'K': [] };

        const usedPlayers = await getUsedPlayers(userId, season, groupId);

        for (let playerId of usedPlayers) {
            const player = await db.PlayerData.findOne({ M: playerId }, { N: 1, P: 1, T: 1, M: 1 });
            sortedPlayers[player.P].push(player);
        }

        return sortedPlayers;
    },
    searchPlayerByTeam: async (groupId, userId, team, season) => {

        const usedPlayers = await getUsedPlayers(userId, season, groupId);

        const playersByTeam = await db.PlayerData.find({ A: true, T: team }, { M: 1, N: 1, P: 1, R: 1, T: 1 });

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

                const playerScore = await mySportsHandler.getPlayerWeeklyScore(newPlayer.mySportsId, season, i + 1);

                newPlayer.score = playerScore.toFixed(2);

                parsedWeeklyRoster.push(newPlayer);
            }
            scoredAllSeason[i] = parsedWeeklyRoster;
        }

        return scoredAllSeason;
    },
    getUserRoster: async (userId, week, season, groupId) => {
        //This grabs the user roster, and if not it creates one.
        let roster = await db.UserRoster.findOne({ U: userId, W: week, S: season, G: groupId }, { R: 1 });
        if (roster === null) {
            roster = await createWeeklyRoster(userId, week, season, groupId);
        }
        return roster.R;
    },
    lockPeroid: async () => {
        try {
            const currData = await db.SeasonAndWeek.findOne();
            return { LW: currData.LW };
        } catch (err) {
            return false;
        }
    },
    checkTeamLock: async (season, week, team) => {
        try {
            let teamStart = await db.TeamLocked.findOne({ T: team, W: week, S: season });
            if (!teamStart) {
                await mySportsHandler.checkGameStarted(season, week);
                teamStart = await db.TeamLocked.findOne({ T: team, W: week, S: season });
            }
            const currDate = new Date();
            return (currDate < teamStart.ST);
        } catch (err) {
            console.log(err)
            return false;
        }
    },
    getTotalScore: async (userId) => {
        const { season } = await userHandler.pullSeasonAndWeekFromDB();
        let userScore;
        try {
            userScore = await db.UserScores.findOne({ U: userId, S: season }, { TS: 1 }).exec();
        } catch (err) {
            console.log(err);
        }
        return userScore.TS;
    },
    scoreAllGroups: async (season, week) => {
        const allGroups = await groupHandler.getAllGroups();
        for (let group of allGroups) {
            console.log(`scoring ${group.N}`)
            let groupScore;
            for (let i = 1; i <= week; i++) {
                const groupRosters = await pullGroupRostersForScoring(season, i, group._id);
                groupScore = await groupHandler.getGroupScore(group._id);
                await mySportsHandler.calculateWeeklyScore(groupRosters, season, i, group._id, groupScore);
                console.log(`done scoring week ${i}`)
            }
            if (group.N === `The Clapper`) {
                const rankedPlayers = await mySportsHandler.rankPlayers(season, week, groupScore, true);
                await mySportsHandler.savePlayerRank(rankedPlayers);
            }
        }
    }
};