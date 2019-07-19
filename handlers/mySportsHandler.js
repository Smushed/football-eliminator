const db = require(`../models`);
const axios = require(`axios`);
const nflTeams = require(`../constants/nflTeams`)
require(`dotenv`).config();

const mySportsFeedsAPI = process.env.MY_SPORTS_FEEDS_API

const placeholderStats = (stats) => {
    //This goes through the returned stats and adds a blank object to any field where the player doesn't have any information
    //This is done for the getStats function. It needs to have an object to read & assign new values to
    const scoringArray = [`passing`, `rushing`, `receiving`, `fumbles`, `kickoffReturns`, `puntReturns`, `twoPointAttempts`, `extraPointAttempts`, `fieldGoals`];

    for (let i = 0; i <= 8; i++) {
        if (typeof (stats[scoringArray[i]]) == `undefined`) {
            stats[scoringArray[i]] = {};
        }
    };
    return stats;
};

const addPlayerToDB = (playerArray) => {
    db.FantasyStats.collection.insertMany(playerArray, (err, writtenObj) => {
        if (err) {
            //TODO Handle the error
            console.log(err);
        } else {
            return playerArray;
        }
    });
};

const updatePlayerWithCurrentWeek = (playerInDB, newWeekStats, season, week) => {

    const fullStats = placeholderStats(newWeekStats);

    playerInDB.stats[season][week] = {
        //Needs the 0s here in case the object is blank from placeholderStats
        passing: {
            passTD: fullStats.passing.passTD || 0,
            passYards: fullStats.passing.passYards || 0,
            passInt: fullStats.passing.passInt || 0,
            passAttempts: fullStats.passing.passAttempts || 0,
            passCompletions: fullStats.passing.passCompletions || 0,
            twoPtPassMade: fullStats.twoPointAttempts.twoPtPassMade || 0
        },
        rushing: {
            rushAttempts: fullStats.rushing.rushAttempts || 0,
            rushYards: fullStats.rushing.rushYards || 0,
            rushTD: fullStats.rushing.rushTD || 0,
            rush20Plus: fullStats.rushing.rush20Plus || 0,
            rush40Plus: fullStats.rushing.rush40Plus || 0,
            rushFumbles: fullStats.rushing.rushFumbles || 0
        },
        receiving: {
            targets: fullStats.receiving.targets || 0,
            receptions: fullStats.receiving.receptions || 0,
            recYards: fullStats.receiving.receptions || 0,
            recTD: fullStats.receiving.recTD || 0,
            rec20Plus: fullStats.receiving.rec20Plus || 0,
            rec40Plus: fullStats.receiving.rec40Plus || 0,
            recFumbles: fullStats.receiving.recFumbles || 0
        },
        fumbles: {
            fumbles: fullStats.fumbles.fumbles || 0,
            fumbles: fullStats.fumbles.fumLost || 0
        },
        fieldGoals: {
            fgMade1_19: fullStats.fieldGoals.fgMade1_19 || 0,
            fgMade20_29: fullStats.fieldGoals.fgMade20_29 || 0,
            fgmade30_39: fullStats.fieldGoals.fgmade30_39 || 0,
            fgMade40_49: fullStats.fieldGoals.fgMade40_49 || 0,
            fgMade50Plus: fullStats.fieldGoals.fgMade50Plus || 0
        }
    };
    mergeMySportsWithDB(playerInDB);
};

const mergeMySportsWithDB = (playerInDB) => {
    //Merge the player with the current pull. Take the current stats and then send it
    db.FantasyStats.findByIdAndUpdate(playerInDB._id, playerInDB, (err) => {
        console.log("updating DB")
        if (err) {
            //TODO Do more than just log the error
            console.log(err)
        };
    });
};

const findPlayerInDB = async (playerID) => {

    try {
        const playerInDB = await db.FantasyStats.findOne({ 'mySportsId': playerID });
        //First check if the player is currently in the database
        if (playerInDB === null) {
            //Send the player data back, they are not currently in the DB and can be added as is
            return false;
        } else {
            //The player is currently in the DB, send the current player in the DB and the mySports Player to a function
            // const mergedPlayer = mergeMySportsWithDB(playerInDB);
            // updatePlayerWithCurrentWeek(mergedPlayer)
            return playerInDB;
        }
    } catch (err) {
        //TODO Do something more with the error
        console.log("what", err);
    };
};

const getNewPlayerStats = (player, stats, team, season, week) => {
    const combinedStats = {};

    combinedStats.full_name = `${player.firstName} ${player.lastName}`;
    combinedStats.mySportsId = player.id;
    combinedStats.position = player.primaryPosition;
    combinedStats.team = { id: team.id, abbreviation: team.abbreviation };
    combinedStats.active = true;

    //This runs through the stats and fills in any objects that aren't available
    const fullStats = placeholderStats(stats)

    //Iterate through the different stats and check if available. If so then put them into the player objects
    combinedStats.stats = {
        [season]: {
            [week]: {
                //Needs the 0s here in case the object is blank from placeholderStats
                passing: {
                    passTD: fullStats.passing.passTD || 0,
                    passYards: fullStats.passing.passYards || 0,
                    passInt: fullStats.passing.passInt || 0,
                    passAttempts: fullStats.passing.passAttempts || 0,
                    passCompletions: fullStats.passing.passCompletions || 0,
                    twoPtPassMade: fullStats.twoPointAttempts.twoPtPassMade || 0
                },
                rushing: {
                    rushAttempts: fullStats.rushing.rushAttempts || 0,
                    rushYards: fullStats.rushing.rushYards || 0,
                    rushTD: fullStats.rushing.rushTD || 0,
                    rush20Plus: fullStats.rushing.rush20Plus || 0,
                    rush40Plus: fullStats.rushing.rush40Plus || 0,
                    rushFumbles: fullStats.rushing.rushFumbles || 0
                },
                receiving: {
                    targets: fullStats.receiving.targets || 0,
                    receptions: fullStats.receiving.receptions || 0,
                    recYards: fullStats.receiving.receptions || 0,
                    recTD: fullStats.receiving.recTD || 0,
                    rec20Plus: fullStats.receiving.rec20Plus || 0,
                    rec40Plus: fullStats.receiving.rec40Plus || 0,
                    recFumbles: fullStats.receiving.recFumbles || 0
                },
                fumbles: {
                    fumbles: fullStats.fumbles.fumbles || 0,
                    fumbles: fullStats.fumbles.fumLost || 0
                },
                fieldGoals: {
                    fgMade1_19: fullStats.fieldGoals.fgMade1_19 || 0,
                    fgMade20_29: fullStats.fieldGoals.fgMade20_29 || 0,
                    fgmade30_39: fullStats.fieldGoals.fgmade30_39 || 0,
                    fgMade40_49: fullStats.fieldGoals.fgMade40_49 || 0,
                    fgMade50Plus: fullStats.fieldGoals.fgMade50Plus || 0
                }
            }
        }
    };
    return combinedStats;
};

//Goes through the roster of the team and pulls out all offensive players
const parseRoster = async (playerArray, team, season) => {
    const newPlayerArray = [];
    const totalPlayerArray = [];
    for (let i = 0; i < playerArray.length; i++) {
        const position = playerArray[i].player.primaryPosition;
        if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {
            //This then takes the player that it pulled out of the player array and updates them in the database
            const dbResponse = await updatePlayerTeam(playerArray[i].player, team, season);
            //TODO iterate through the dbNFLRoster right now and pull out all players which are not part of the current roster
            //Then pass them through to another function and mark them all as inactive

            //If the updatePlayerTeam returns a certian value pass it along to the new player array to then add to the database
            //This happens if the player on the roster is not currently in the database and needs to be added
            if (dbResponse.newPlayer) {
                newPlayerArray.push(dbResponse.newPlayer);
            };
            totalPlayerArray.push(dbResponse.player);
        };
    };
    // If the amount of new players are over one, then add them all to the database
    if (newPlayerArray.length >= 1) {
        addPlayerToDB(newPlayerArray)
    }

    const dbNFLRoster = await db.FantasyStats.find({ 'team.abbreviation': team.abbreviation }); //TODO UPDATE CHI BACK TO team

    //TODO TESTING THIS
    //Get the length of the array of the players we just updated
    // const playerArrayLength = updatedPlayerArray.length + newPlayerArray.length;

    //Iterate through the players we have sitting in the database
    //Take out all the players which we just wrote to the database and update all the rest to be inactive
    //TODO start here - https://stackoverflow.com/questions/54142112/compare-2-arrays-of-objects-and-remove-duplicates
    const inactivePlayerArray = dbNFLRoster.filter((player, index, self) => {
        for (updatedPlayer of totalPlayerArray) { //updatedPlayer since it is what the database returned. The player has been updated
            //We iterate through the players that are currently in the database. If the player is in the DB but not in the API call we assume that they are no longer on the roster
            if (updatedPlayer.mySportsId === player.mySportsId) {
                return false;
            } else {
                //We then make a new array of players who are no longer on the team
                return true;
            };
        }
    });
    console.log(inactivePlayerArray)
    return inactivePlayerArray;
}

//This works but pulls out the players that are in both. I want players that are ONLY in dbNFLRoster
// const inactivePlayerArray = [];
// for (dbPlayer of dbNFLRoster) {
//     for (updatedPlayer of totalPlayerArray) { //updatedPlayer since it is what the database returned. The player has been updated
//         console.log(updatedPlayer.mySportsId, dbPlayer.mySportsId)
//         if (updatedPlayer.mySportsId === dbPlayer.mySportsId) {
//             inactivePlayerArray.push(dbPlayer);
//         };
//     };
// };


// const playerNoLongerActive = await dbNFLRoster.filter(player => {
//     for (let i = 0; i < playerArrayLength; i++) {
//         if (updatedPlayerArray[i].player.id === player.mySportsId || newPlayerArray[i].player.id === player.mySportsId) {
//             console.log(player.mySportsId)
//             return false;
//         } else {
//             return true;
//         }
//     };
// });


const updatePlayerTeam = async (player, team, season) => {
    //Check the database for the player
    const dbPlayer = await findPlayerInDB(player.id);
    const response = {};

    //If dbPlayer is false then we need to write them into the database
    //If the dbPlayer is not false then we need to overwrite the team that the player is currently on
    if (!dbPlayer) {
        //Stats are going to be passed in a blank object. The Team API call doesn't return stats, so we just want to feed it an empty object
        //The getNewPlayerStats needs stats to be passed in, but if there are none available it will default them to 0.
        //A player must be created with stats
        //Week here can be 17 because only new players should be added. If any of them aren't new then this will overwrite their week 17 stats
        //TODO Something better then feeding in bogus data. Likely make the getNewPlayer more robust by adding another field
        response.newPlayer = true;
        response.player = getNewPlayerStats(player, {}, team, season, 17);
    } else {
        response.newPlayer = false;
        response.player = await db.FantasyStats.findOneAndUpdate({ 'mySportsId': player.id }, { 'team': team, 'active': true }, { new: true });
    };
    return response;
};

module.exports = {

    updateRoster: async (season) => {
        // This loops through the array of all the teams above and gets the current rosters
        const updatedRoster = [];
        //TODO UNDO THIS JUST FOR TESTING
        // for (const team of nflTeams.teamMapping) {
        await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            },
            params: {
                season: season,
                team: `CHI`,//TODO Change this back to team.abbreviation
                rosterstatus: `assigned-to-roster`
            }
        }).then(async (response) => {
            // Then parses through the roster and pulls out of all the offensive players and updates their data
            //This also gets any new players and adds them to the DB but inside this function
            //Await because I want it to iterate through the whole roster that was provided before moving onto the next one
            updatedRoster = await parseRoster(response.data.players, { abbreviation: 'CHI', id: 60 }, season) //TODO CHANGE BACK CHI TO team when undoing loop
        }).catch(err => {
            //TODO Error handling if the AJAX failed
        });
        // }

        console.log(updatedRoster)
        return updatedRoster;
    },
    getMassData: async function () {
        const seasonList = [`2018-2019-regular`, `2019-2020-regular`];
        const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

        for (let i = 0; i < seasonList.length; i++) {
            for (let ii = 0; ii < weeks.length; ii++) {
                await this.getWeeklyData(seasonList[i], weeks[ii]);
                console.log('data has been updated')
            };
        };
        const testReturn = {
            status: 200,
            text: `working`
        }
        return testReturn;
    },
    getWeeklyData: async (season, week) => {
        //This gets a specific week's worth of games and iterates through the list of players to come up with an array
        //The array has player id, names, positions and stats in it. It then should feed an update a database
        const search = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}/week/${week}/player_gamelogs.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            }
        });

        const weeklyPlayerArray = [];

        for (let i = 0; i < search.data.gamelogs.length; i++) {
            const position = search.data.gamelogs[i].player.primaryPosition;
            let player = {};

            if (position === `QB` || position === `TE` || position === `WR` || position === `RB` || position === `K`) {

                //This is going to go two ways after this point
                //If the player is found in the database then go and update the record
                //This searches the database and then returns true if they are in there and false if they are not
                //If they are in the database then the findPlayerInDB function convers it. Since we are already accessing the database with this, there is no reason to try and pass it back and then go out again
                const playerInDB = await findPlayerInDB(search.data.gamelogs[i].player.id);

                //False is first because false is directly returned in querying the database
                if (!playerInDB) {
                    //They are not in the database. Init the object and then add them to an array which whill then be written to the database
                    player = await getNewPlayerStats(search.data.gamelogs[i].player, search.data.gamelogs[i].stats, search.data.gamelogs[i].team, season, week);
                    //If they are not found in the database, add them to an array and then
                    weeklyPlayerArray.push(player);
                } else {
                    updatePlayerWithCurrentWeek(playerInDB, search.data.gamelogs[i].stats, season, week);
                };
            };
        };
        if (weeklyPlayerArray.length >= 1) {
            addPlayerToDB(weeklyPlayerArray);
        };
        //TODO Do more than just send the same thing
        const response = {
            status: 200,
            text: `DB Updated`
        }
        console.log(`get weekly data done`)
        return response;
    },
    availablePlayers: async () => {
        //This returns an array of objects from mySports
        const mySportsResponse = await axios.get(`https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json`, {
            auth: {
                username: mySportsFeedsAPI,
                password: `MYSPORTSFEEDS`
            },
            params: {
                season: `2019-2020-regular`,
                team: `CHI`,
                rosterstatus: `assigned-to-roster`
            }
        });
        //Use response.data.players;

        //Returns an array of objects from the DB
        const dbResponse = await db.FantasyStats.find({ 'team.abbreviation': 'CHI' });
        // dbResponse;

        //Iterate through the array of players and mark the ones that are neither in the DB or the API call
        const playerNoLongerActive = await dbResponse.filter(player => {
            for (let i = 0; i < mySportsResponse.data.players.length; i++) {
                //TODO Need to test this mysportsresponse thing not sure
                if (mySportsResponse.data.players[i].player.id === player.mySportsId) {
                    return false;
                } else {
                    if (player.mySportsId === 12816) {
                        console.log(mySportsResponse.data.players[i].player.id, player.mySportsId)
                    }
                    return true;
                }
            };
        });

        return playerNoLongerActive
    }// Next method goes here
};