const rosterHandler = require(`../handlers/rosterHandler`);
const groupHandler = require(`../handlers/groupHandler`);
const mySportsHandler = require(`../handlers/mySportsHandler`);
const positions = require(`../constants/positions`);
const userHandler = require("../handlers/userHandler");

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
        const { userId, searchedPosition, season, groupId } = req.query;
        //Then iterate over the array and turn the strings into numbers to compare it to the DB
        const availablePlayers = await rosterHandler.availablePlayers(userId, searchedPosition, season, groupId);
        res.status(200).send(availablePlayers);
    });

    app.get(`/api/userRoster/:groupId/:userId`, async (req, res) => {
        const { groupId, userId } = req.params;
        const { week, season } = req.query;
        if (userId !== `undefined` && week !== 0 && season !== `` && groupId !== `undefined`) { //Checks if this route received the userId before it was ready in react
            //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly
            const playerIdRoster = await rosterHandler.getUserRoster(userId, week, season, groupId);
            const userRoster = await mySportsHandler.fillUserRoster(playerIdRoster);
            const groupPositions = await groupHandler.getGroupPositions(groupId);
            const response = { userRoster, groupPositions };
            res.status(200).send(response);
        } else {
            //TODO Do something with this error
            res.status(400).send(`userId is undefined. Try refreshing if this persists`);
        };
    });

    app.put(`/api/dummyRoster/`, async (req, res) => {
        const { userId, groupId, week, season, dummyRoster } = req.body;
        if (userId === undefined || groupId === '') {
            res.status(500).send(`Select Someone!`);
            return;
        }
        const dbResponse = await rosterHandler.dummyRoster(userId, groupId, week, season, dummyRoster);

        res.status(200).send(dbResponse);
    });

    app.put(`/api/updateUserRoster/`, (req, res) => {
        const { userId, roster, droppedPlayer, addedPlayer, week, season, groupId } = req.body;

        rosterHandler.updateUserRoster(userId, roster, droppedPlayer, addedPlayer, week, season).then(async () => {
            //TODO COMBINE THIS WITH get userRoster above so it's one function
            const playerIdRoster = await rosterHandler.getUserRoster(userId, week, season, groupId);
            const userRoster = await mySportsHandler.fillUserRoster(playerIdRoster);
            const response = userRoster;

            res.status(200).send(response);
        });

    });

    app.get(`/api/checkLockPeriod`, async (req, res) => {
        const lockPeriod = await rosterHandler.checkLockPeriod();

        res.status(200).send(lockPeriod);
    });

    app.get(`/api/getUsedPlayers/:userId/:season`, async (req, res) => {
        const { userId, season } = req.params;

        const usedPlayers = await rosterHandler.usedPlayersForTable(userId, season);

        res.status(200).send(usedPlayers);
    });

    app.get(`/api/getPlayersByTeam/:groupId/:userId/:team/:season`, async (req, res) => {
        const { groupId, userId, team, season } = req.params;

        const playersByTeam = await rosterHandler.searchPlayerByTeam(groupId, userId, team, season);

        res.status(200).send(playersByTeam);
    });

    app.get(`/api/seasonLongScore/:userId/:season`, async (req, res) => {
        const { userId, season } = req.params;
        const allPlayers = await rosterHandler.allSeasonRoster(userId, season);

        res.status(200).send(allPlayers);
    });

    app.get(`/api/getPositionData`, async (req, res) => {
        res.status(200).send(positions.orderOfDescription);
    });

};