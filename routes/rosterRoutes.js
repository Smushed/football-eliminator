const rosterHandler = require(`../handlers/rosterHandler`);
const groupHandler = require(`../handlers/groupHandler`);
const mySportsHandler = require(`../handlers/mySportsHandler`);
const positions = require(`../constants/positions`);

module.exports = app => {
    app.get(`/api/displayplayers`, async (req, res) => {
        const response = await rosterHandler.byRoster();

        res.status(200).send(response);
    });

    app.get(`/api/availablePlayers`, async (req, res) => {
        const { userId, searchedPosition, season, groupId } = req.query;
        const availablePlayers = await rosterHandler.availablePlayers(userId, searchedPosition, season, groupId);
        res.status(200).send(availablePlayers);
    });

    app.get(`/api/userRoster/:groupId/:userId`, async (req, res) => {
        const { groupId, userId } = req.params;
        const { week, season } = req.query;
        if (userId !== `undefined` && week !== 0 && season !== `` && groupId !== `undefined`) { //Checks if this route received the userId before it was ready in react
            //The check already comes in as the string undefined, rather than undefined itself. It comes in as truthly
            const playerIdRoster = await rosterHandler.getUserRoster(userId, week, season, groupId);
            const weekUserScore = await mySportsHandler.getUserWeeklyScore(userId, groupId, season, week);
            const userRoster = await mySportsHandler.fillUserRoster(playerIdRoster, weekUserScore);
            const groupPositions = await groupHandler.getGroupPositions(groupId);
            const groupMap = await groupHandler.mapGroupPositions(groupPositions, positions.positionMap);
            const response = { userRoster, groupPositions, groupMap, positionArray: positions.positionArray };
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
            const weekUserScore = await mySportsHandler.getUserWeeklyScore(userId, groupId, season, week);
            const userRoster = await mySportsHandler.fillUserRoster(playerIdRoster, weekUserScore);
            const response = userRoster;

            res.status(200).send(response);
        });

    });

    app.get(`/api/checkLockPeriod`, async (req, res) => {
        const lockPeriod = await rosterHandler.checkLockPeriod();

        res.status(200).send(lockPeriod);
    });

    app.get(`/api/getUsedPlayers/:userId/:season/:groupId`, async (req, res) => {
        const { userId, season, groupId } = req.params;

        const usedPlayers = await rosterHandler.usedPlayersByPosition(userId, season, groupId);
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

    app.get(`/api/getRosterPositions`, async (req, res) => {
        const { rosterPositions, positionMap, maxOfPosition } = positions;
        res.status(200).send({ rosterPositions, positionMap, maxOfPosition });
    });

    app.get(`/api/getAllRostersForGroup/:season/:week/:groupId/:updateLeaderBoard`, async (req, res) => {
        const { season, week, groupId, updateLeaderBoard } = req.params;
        let leaderboard = [];
        let groupPositions = [];
        const filledRosters = await rosterHandler.getAllRostersForGroup(season, week, groupId);
        if (updateLeaderBoard === `true`) {
            const currWeekForLeaderboard = +week === 1 ? 1 : +week;
            leaderboard = await groupHandler.getLeaderBoard(groupId, season, currWeekForLeaderboard, filledRosters);
            groupPositions = await groupHandler.getGroupPositions(groupId);
        };
        res.status(200).send({ rosters: filledRosters, groupPositions, leaderboard });
    });

};