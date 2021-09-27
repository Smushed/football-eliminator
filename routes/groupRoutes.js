require(`dotenv`).config();
const userHandler = require(`../handlers/userHandler`);
const groupHandler = require(`../handlers/groupHandler`);
const scoringSystem = require(`../constants/scoringSystem`);
const rosterHandler = require(`../handlers/rosterHandler`);
const mySportsHandler = require(`../handlers/mySportsHandler`);
const s3Handler = require(`../handlers/s3Handler`);

module.exports = app => {

    app.put(`/api/group/join/`, async (req, res) => {
        const { userId, groupId } = req.body;
        await groupHandler.addUser(userId, groupId);
        await userHandler.addGroupToList(userId, groupId);
        res.status(200).send(`Added`);
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

    app.get(`/api/group/details/:id`, async (req, res) => {
        const { id } = req.params;
        const groupInfo = await groupHandler.getGroupDataById(id);
        res.status(200).send(groupInfo);
    });

    app.post(`/api/createClapper/:pass`, async (req, res) => {
        const { pass } = req.params;
        if (pass !== process.env.DB_ADMIN_PASS) {
            res.status(401).send(`Get Outta Here!`);
            return;
        }
        groupHandler.createClapper();
        userHandler.initSeasonAndWeekInDB();
        res.sendStatus(200);
    });

    app.get(`/api/group/positions/:groupId`, async (req, res) => {
        const { groupId } = req.params;
        const positions = await groupHandler.getGroupPositions(groupId);
        res.status(200).send(positions);
    });

    app.get(`/api/getScoring`, async (req, res) => {
        res.status(200).send(scoringSystem);
    });

    app.post(`/api/group/create`, async (req, res) => {
        const { userId, newGroupScore, groupName, groupDesc, groupPositions } = req.body;
        const groupResponse = await groupHandler.createGroup(userId, newGroupScore, groupName, groupDesc, groupPositions);
        if (groupResponse === false) { res.sendStatus(400); return; }
        const addUserResponse = await groupHandler.addUser(userId, groupResponse._id, true);
        res.status(200).send(addUserResponse);
    });

    app.get(`/api/group/list`, async (req, res) => {
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

    app.get(`/api/group/profile/box/:groupId`, async (req, res) => {
        const { groupId } = req.params;
        Promise.all([
            userHandler.pullSeasonAndWeekFromDB(),
            groupHandler.getGroupDataById(groupId)
        ]).then(async ([{ season, week }, groupData]) => {
            const userScores = await groupHandler.getCurrAndLastWeekScores(groupData._id, season, +week);
            Promise.all([
                groupHandler.getBestUserForBox(userScores),
                s3Handler.getAvatar(groupData._id.toString())
            ]).then(([topUser, groupAvatar]) => {
                res.status(200).send({ name: groupData.N, score: topUser.TS, avatar: groupAvatar })
            });
        });
    });

    app.get(`/api/group/scoring/:groupId`, async (req, res) => {
        const { withDesc } = req.query;
        const { groupId } = req.params;
        const response = {};

        const groupScore = await groupHandler.getGroupScore(groupId);
        response.groupScore = { P: groupScore.P, RU: groupScore.RU, RE: groupScore.RE, FG: groupScore.FG, F: groupScore.F };

        if (withDesc === `true`) {
            response.map = scoringSystem.groupScoreMap;
            response.bucketMap = scoringSystem.groupScoreBucketMap;
        }
        res.status(200).send(response);
    });

    app.put(`/api/group/`, async (req, res) => {
        const { data, id } = req.body;
        if (data && Object.keys(data).length === 0 && data.constructor === Object) {
            res.status(200).send(`Nothing to update!`);
            return;
        }
        const response = await groupHandler.updateGroup(data, id);
        if (response.length === 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });

    app.get(`/api/group/topScore/:groupId/:season`, async (req, res) => {
        const { groupId, season } = req.params;
        const topScore = await groupHandler.topScoreForGroup(groupId, season);
        res.status(200).send(topScore);
    });

    app.delete(`/api/group/user/:groupId/:delUserId/:adminId`, async (req, res) => {
        const { groupId, delUserId, adminId } = req.params;
        if (delUserId === adminId) {
            res.status(400).send(`Cannot remove self from group!`);
            return;
        }
        const { season } = await userHandler.pullSeasonAndWeekFromDB();
        const group = await groupHandler.getGroupDataById(groupId);
        const adminCheck = await groupHandler.checkAdmin(group, adminId);
        if (!adminCheck) {
            res.status(400).send(`Not authorized to remove people!`);
            return;
        }
        const dbRes = await groupHandler.removeUser(group, delUserId, season);

        if (dbRes.status) {
            res.sendStatus(200);
        } else {
            res.status(400).send(dbRes.message);
        }
    });

    app.get(`/api/group/admin/verify/:userId/:groupId`, async (req, res) => {
        const { userId, groupId } = req.params;
        const group = await groupHandler.getGroupDataById(groupId);
        const onlyAdmin = await groupHandler.singleAdminCheck(group, userId);
        if (onlyAdmin.status) {
            res.status(210).send(onlyAdmin.nonAdmins);
            // res.status(100).send('Only Admin in group! Pick another before leaving');
        } else {
            res.sendStatus(200)
        }
    });

    app.put(`/api/group/admin/upgrade/:userId/:groupId`, async (req, res) => {
        const { userId, groupId } = req.params;
        const group = await groupHandler.getGroupDataById(groupId);
        await groupHandler.upgradeToAdmin(group, userId);
        res.sendStatus(200);
    });

    app.put(`/api/calculateScore/:groupId/:season/:week`, async (req, res) => {
        const { groupId, season, week } = req.params;
        for (let i = 1; i <= week; i++) {
            const groupRosters = await rosterHandler.pullGroupRostersForScoring(season, i, groupId);
            const groupScore = await groupHandler.getGroupScore(groupId);
            await mySportsHandler.calculateWeeklyScore(groupRosters, season, i, groupId, groupScore);
            console.log(`done scoring week ${i}`)
        }
        res.status(200).send('working');
    });

    app.put(`/api/group/score/calculate/all`, async (req, res) => {
        const { season, week } = await userHandler.pullSeasonAndWeekFromDB();
        rosterHandler.scoreAllGroups(season, week);
        res.sendStatus(200);
    });
};