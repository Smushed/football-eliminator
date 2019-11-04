const rosterHandler = require(`../handlers/rosterHandler`);
const mySportsHandler = require(`../handlers/mySportsHandler`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await rosterHandler.byRoster();

        res.status(200).send(response);
    });

    app.get(`/api/getAllRosters/:season`, async (req, res) => {
        const { season } = req.params;
        const dbResponse = await rosterHandler.getAllRosters(season);
        res.status(200).send(dbResponse);
    });

    app.get(`/api/availablePlayers`, async (req, res) => {
        //req.query passes the array as an object. We turn this back to an array
        const { userId, searchedPosition, season } = req.query;
        //Then iterate over the array and turn the strings into numbers to compare it to the DB
        const availablePlayers = await rosterHandler.availablePlayers(userId, searchedPosition, season);

        res.status(200).send(availablePlayers);
    });

    app.get(`/api/userRoster/:userId`, async (req, res) => {
        const { userId } = req.params;
        const { week, season } = req.query;
        if (userId !== 'undefined' && week !== 0 && season !== ``) { //Checks if this route received the userId before it was ready in react
            //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly
            const userRoster = await rosterHandler.userRoster(userId, week, season);
            res.status(200).send(userRoster);
        } else {
            //TODO Do something with this error
            res.status(400).send(`userId is undefined. Try refreshing if this persists`);
        };
    });

    app.put(`/api/dummyRoster/`, async (req, res) => {
        const { userId, week, season, dummyRoster } = req.body;
        const dbResponse = await rosterHandler.dummyRoster(userId, week, season, dummyRoster);

        res.status(200).send(dbResponse);
    });

    app.put(`/api/updateUserRoster/`, async (req, res) => {
        const { userId, dbReadyRoster, droppedPlayer, week, season, saveWithNoDrop } = req.body;

        console.log(droppedPlayer);

        const dbResponse = await rosterHandler.updateUserRoster(userId, dbReadyRoster, droppedPlayer, week, season, saveWithNoDrop);

        res.status(200).send(dbResponse);
    });

    app.get(`/api/checkLockPeriod`, (req, res) => {
        const lockPeriod = rosterHandler.checkLockPeriod();

        res.status(200).send(lockPeriod);
    });

    app.get(`/api/getUsedPlayers/:userId/:season`, async (req, res) => {
        const { userId, season } = req.params;

        const usedPlayers = await rosterHandler.usedPlayersForTable(userId, season);

        res.status(200).send(usedPlayers);
    });

    app.get(`/api/getPlayersByTeam/:userId/:team/:season`, async (req, res) => {
        const { userId, team, season } = req.params;
        console.log(userId);

        const playersByTeam = await rosterHandler.searchPlayerByTeam(userId, team, season);

        res.status(200).send(playersByTeam);
    });

    app.get(`/api/getLeaderboard/:groupId/:week/:season`, async (req, res) => {
        console.log(`Calculating users scores`);

        const { groupId, season, week } = req.params;
        let userRosters = {};
        let allUserArray = [];

        if (groupId === `allUsers`) { // This is for the front page userboard
            userRosters = await rosterHandler.getAllRosters(season);

            //Manually puttting in allUsers to ensure it's data for the whole leaderboard
            await mySportsHandler.calculateWeeklyScore(userRosters, week, season, `allUsers`);

            console.log(`userarray`, allUserArray)
            console.log(`rosters`, userRosters)

            //now I need to iterate through the arrays and recalculate everyone's stats

            //Now that we have the userList and all the user's rosters
            // for (let i = 0; i < allUserArray.length; i++) {
            //     //userDetail is going to be each element in the array
            //     const userDetail = { userId: allUserArray[i]._id, username: allUserArray[i].username, email: allUserArray[i].email };
            //     // Here we count down from the week we are currently on to grab all the players that the user has used
            //     const previousWeekPlayers = {};
            //     for (let ii = week; ii > 0; ii--) {
            //         //For this we drill into the object of roster data that was returned from the DB.
            //         //We look up this user's roster through their id which is a key
            //         previousWeekPlayers[ii] = userRosters[allUserArray[i]._id].roster[ii];
            //     };

            //     //We then take the roster that we populated above and send it to the DB
            //     // const weekScores = await axios.get(`/api/weeklyRosterScore`,
            //     //     { params: { userRoster: previousWeekPlayers, week, season } });

            //     console.log(previousWeekPlayers)
            //     const weekScores = await mySportsHandler.weeklyScore(previousWeekPlayers, season, week);

            //     let totalScore = 0;
            //     for (let iii = week; iii > 0; iii--) {
            //         //Now iterate over the weeks and pull out the total score
            //         totalScore += parseFloat(weekScores.data[iii]); //Must be Float because there are decimals in the scores
            //     };
            //     userDetail.weekScores = weekScores.data;
            //     userDetail.totalScore = totalScore.toFixed(2);

            //     userList.push(userDetail);
            // };
        } else {
            //TODO Add the support for groups
        };
        res.status(200).send(`bazinga`);
    });
};