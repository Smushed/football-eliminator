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

    app.get(`/api/group/profile`, async (req, res) => {
        const { name, avatar, positions } = req.query;
        const group = {};
        const groupData = await groupHandler.getGroupData(name);

        group.D = groupData.D;
        group.N = groupData.N;
        group._id = groupData._id;

        let gAvatar;
        let pos;
        if (avatar === `true`) {
            gAvatar = await s3Handler.getAvatar(groupData._id.toString());
        }
        if (positions === `true`) {
            pos = await groupHandler.getGroupPositions(groupData._id.toString());
        }
        group.UL = await userHandler.groupUserList(groupData.UL);

        if (groupData) {
            res.status(200).send({ group, avatar: gAvatar || null, positions: pos || null });
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

    app.get(`/api/group/leaderboard/:season/:week/:groupId`, async (req, res) => {
        const { season, week, groupId } = req.params;
        const leaderboard = await groupHandler.getLeaderBoard(groupId, season, +week);
        res.status(200).send({ leaderboard });
    });

    app.get(`/api/group/roster/bestAndLead/:season/:week/:groupId`, async (req, res) => {
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

    app.get(`/api/group/profile/box/:name`, async (req, res) => {
        const { name } = req.params;
        Promise.all([
            userHandler.pullSeasonAndWeekFromDB(),
            groupHandler.getGroupData(name)
        ]).then(async ([{ season, week }, groupData]) => {
            const userScores = await groupHandler.getCurrAndLastWeekScores(groupData._id, season, +week);
            Promise.all([
                groupHandler.getBestUserForBox(userScores),
                s3Handler.getAvatar(groupData._id.toString())
            ]).then(([topUser, groupAvatar]) => {
                res.status(200).send({ name: name, score: topUser.TS, avatar: groupAvatar })
            }
            )
        })
    });
};