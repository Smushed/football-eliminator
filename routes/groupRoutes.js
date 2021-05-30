require(`dotenv`).config();
const userHandler = require(`../handlers/userHandler`);
const groupHandler = require(`../handlers/groupHandler`);
const mySportsHandler = require(`../handlers/mySportsHandler`);
const scoringSystem = require(`../constants/scoringSystem`);
const s3Handler = require("../handlers/s3Handler");

module.exports = app => {

    app.put(`/api/requestJoinGroup`, async (req, res) => {
        const { userId, groupId } = req.body;

        await groupHandler.addUser(userId, groupId);
        await userHandler.addGroupToList(userId, groupId);
        res.status(200).send(`Added`);
        // return "You need to be a moderator to add users to the group";
    });

    app.get(`/api/getGroupData/:groupName`, async (req, res) => {
        const { groupName } = req.params;
        const groupData = await groupHandler.getGroupData(groupName);
        if (groupData) {
            res.status(200).send(groupData);
        } else {
            res.status(500).send({ 'error': `No Group Found` })
        }
    });

    app.post(`/api/createClapper/:pass`, async (req, res) => {
        const { pass } = req.params;
        if (pass !== process.env.DB_ADMIN_PASS) {
            res.status(401).send(`Get Outta Here!`);
            return;
        };
        groupHandler.createClapper();
        userHandler.initSeasonAndWeekInDB();
        console.log(`Group Created`)
        res.sendStatus(200);
    });

    app.get(`/api/getGroupPositions/:groupId`, async (req, res) => {
        const { groupId } = req.params;
        const positions = await groupHandler.getGroupPositions(groupId);
        res.status(200).send(positions);
    });

    app.get(`/api/getGroupPositionsForDisplay/:groupId`, async (req, res) => {
        const { groupId } = req.params;
        const positions = await groupHandler.getGroupPositions(groupId);
        const forDisplay = await groupHandler.groupPositionsForDisplay(positions);
        res.status(200).send({ positions, forDisplay });
    });

    app.get(`/api/getScoring`, async (req, res) => {
        res.status(200).send(scoringSystem);
    });

    app.post(`/api/createGroup`, async (req, res) => {
        const { userId, newGroupScore, groupName, groupDesc, groupPositions } = req.body;
        const groupResponse = await groupHandler.createGroup(userId, newGroupScore, groupName, groupDesc, groupPositions);
        const addUserResponse = await groupHandler.addUser(userId, groupResponse._id, true);
        console.log(addUserResponse)
        res.status(200).send(addUserResponse);
    });

    app.get(`/api/getGroupList`, async (req, res) => {
        const dbResponse = await groupHandler.getGroupList();
        res.status(200).send(dbResponse);
    });

    app.get(`/api/getLeaderboard/:season/:week/:groupId`, async (req, res) => {
        const { season, week, groupId } = req.params;
        const leaderboard = await groupHandler.getLeaderBoard(groupId, season, +week);
        res.status(200).send({ leaderboard });
    });

    app.get(`/api/getIdealRoster/:season/:week/:groupId`, async (req, res) => {
        const { season, week, groupId } = req.params;
        const previousWeek = +week - 1;
        if (previousWeek === 0) {
            const blankRoster = await groupHandler.getBlankRoster(groupId);
            res.status(200).send(blankRoster);
            return;
        }
        const idealRoster = await groupHandler.getIdealRoster(groupId, season, +previousWeek);
        const response = await mySportsHandler.fillUserRoster(idealRoster.R);
        res.status(200).send(response);
    });

    app.get(`/api/getBestCurrLeadRoster/:season/:week/:groupId`, async (req, res) => {
        const { season, week, groupId } = req.params;
        if (+week === 1) {
            //Setting this blank roster if we are currently in week 1 there is no previous week to compare
            const blankRoster = await groupHandler.getBlankRoster(groupId);
            const bestRoster = { R: blankRoster, U: `` }; //Filling out dummy data for the front end to display
            res.status(200).send({ bestRoster, leaderRoster: blankRoster });
            return;
        } else {
            const userScores = await groupHandler.getCurrAndLastWeekScores(groupId, season, +week);
            Promise.all([
                groupHandler.getBestRoster(groupId, season, +week, userScores),
                groupHandler.getLeaderRoster(userScores, groupId, week, season)
            ]).then(([
                bestRoster, leaderRoster
            ]) => res.status(200).send({ bestRoster, leaderRoster }));
        }
    });

    app.get(`/api/getGroupForBox/:groupName`, async (req, res) => {
        const { groupName } = req.params;
        Promise.all([
            userHandler.pullSeasonAndWeekFromDB(),
            groupHandler.getGroupData(groupName)
        ]).then(async ([{ season, week }, groupData]) => {
            const userScores = await groupHandler.getCurrAndLastWeekScores(groupData._id, season, +week);
            Promise.all([
                groupHandler.getBestUserForBox(userScores),
                s3Handler.getAvatar(groupData._id)
            ]).then(([topUser, groupAvatar]) => {
                res.status(200).send({ name: groupName, score: topUser.TS, avatar: groupAvatar })
            }
            )
        })
    });

    app.get(`/api/groupData/profile/:groupName`, async (req, res) => {
        const { groupName } = req.params;
        const groupData = await groupHandler.getGroupData(groupName);
        if (groupData) {
            const positions = await groupHandler.getGroupPositions(groupData._id);
            res.status(200).send({ group: groupData, positions });
        } else {
            res.status(500).send({ 'error': `No Group Found` })
        }
    });
};