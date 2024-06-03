import 'dotenv/config.js';
import userHandler from '../handlers/userHandler.js';
import groupHandler from '../handlers/groupHandler.js';
import scoringSystem from '../constants/scoringSystem.js';
import rosterHandler from '../handlers/rosterHandler.js';
import s3Handler from '../handlers/s3Handler.js';
import emailHandler from '../handlers/emailHandler.js';
import mySportsHandler from '../handlers/mySportsHandler.js';

export default (app) => {
  app.put('/api/group/join/', async (req, res) => {
    const { userId, groupId } = req.body;
    await groupHandler.addUser(userId, groupId);
    await userHandler.addGroupToList(userId, groupId);
    res.status(200).send('Added');
  });

  app.get('/api/group/profile', async (req, res) => {
    const { name, avatar, positions } = req.query;
    const group = { group: null, gAvatar: null, pos: null };
    group.group = await groupHandler.getGroupData(name);

    if (avatar === 'true') {
      group.gAvatar = await s3Handler.getUserAvatar(groupData._id.toString());
    }
    if (positions === 'true') {
      group.pos = await groupHandler.getGroupPositions(
        groupData._id.toString()
      );
    }
    groupData.userlist = await userHandler.fillUserListFromGroup(groupData.UL);

    if (groupData) {
      res.status(200).send(group);
    } else {
      res.status(500).send({ error: 'No Group Found' });
    }
  });

  app.get('/api/group/details/byUser/:userId', async (req, res) => {
    const { userId } = req.params;
    const groupInfoArray = await groupHandler.getGroupDataByUserId(userId);
    res.status(200).send(groupInfoArray);
  });

  app.get('/api/group/details/:id', async (req, res) => {
    const { id } = req.params;
    const groupInfo = await groupHandler.getGroupDataById(id);
    res.status(200).send(groupInfo);
  });

  app.get('/api/group/positions/:groupId', async (req, res) => {
    const { groupId } = req.params;
    try {
      const positions = await groupHandler.getGroupPositions(groupId);
      res.status(200).send(positions);
    } catch (err) {
      res.status(406).send('Positions Not Found');
    }
  });

  app.get('/api/group/getScoring', async (req, res) => {
    res.status(200).send(scoringSystem);
  });

  app.post('/api/group/create', async (req, res) => {
    const { userId, newGroupScore, groupName, groupDesc, groupPositions } =
      req.body;
    const groupResponse = await groupHandler.createGroup(
      userId,
      newGroupScore,
      groupName,
      groupDesc,
      groupPositions
    );
    if (groupResponse === false) {
      res.sendStatus(400);
      return;
    }
    const addUserResponse = await groupHandler.addUser(
      userId,
      groupResponse._id,
      true
    );
    res.status(200).send(addUserResponse);
  });

  app.get('/api/group/list', async (req, res) => {
    const dbResponse = await groupHandler.getGroupList();
    res.status(200).send(dbResponse);
  });

  app.get('/api/group/leaderboard/:season/:week/:groupId', async (req, res) => {
    const { season, week, groupId } = req.params;
    const leaderboard = await groupHandler.getLeaderBoard(
      groupId,
      season,
      +week
    );
    res.status(200).send({ leaderboard });
  });

  app.get(
    '/api/group/roster/bestAndLead/:season/:week/:groupId',
    async (req, res) => {
      const { season, week, groupId } = req.params;
      if (+week === 1) {
        //Setting this blank roster if we are currently in week 1 there is no previous week to compare
        const blankRoster = await groupHandler.getBlankRoster(groupId);
        const bestRoster = { roster: blankRoster, username: '' };
        res.status(200).send({ bestRoster, leaderRoster: blankRoster });
        return;
      } else {
        const userScores = await groupHandler.getCurrAndLastWeekScores(
          groupId,
          season,
          +week
        );
        Promise.all([
          groupHandler.getBestRoster(groupId, season, +week, userScores),
          groupHandler.getLeaderRoster(userScores, groupId, week, season),
        ]).then(async ([bestRoster, leaderRoster]) => {
          if (!bestRoster) {
            const blankRoster = await groupHandler.getBlankRoster(groupId);
            bestRoster = { roster: blankRoster, username: '' };
          }
          return res.status(200).send({ bestRoster, leaderRoster });
        });
      }
    }
  );

  app.get('/api/group/profile/box/:groupId', async (req, res) => {
    const { groupId } = req.params;
    Promise.all([
      mySportsHandler.pullSeasonAndWeekFromDB(),
      groupHandler.getGroupDataById(groupId),
    ]).then(async ([{ season, week }, groupData]) => {
      const userScores = await groupHandler.getCurrAndLastWeekScores(
        groupData._id,
        season,
        +week
      );
      Promise.all([
        groupHandler.getBestUserForBox(userScores),
        s3Handler.getUserAvatar(groupData._id.toString()),
      ]).then(([topUser, groupAvatar]) => {
        res.status(200).send({
          name: groupData.name,
          score: topUser.totalScore,
          avatar: groupAvatar,
        });
      });
    });
  });

  app.get('/api/group/scoring/:groupId', async (req, res) => {
    const { withDesc } = req.query;
    const { groupId } = req.params;
    const response = {};

    response.groupScore = await groupHandler.getGroupScore(groupId);

    if (withDesc === 'true') {
      response.map = scoringSystem.groupScoreMap;
      response.bucketMap = scoringSystem.groupScoreBucketMap;
    }
    res.status(200).send(response);
  });

  app.put('/api/group/', async (req, res) => {
    const { data, id } = req.body;
    if (data && Object.keys(data).length === 0 && data.constructor === Object) {
      res.status(400).send('Nothing to update!');
      return;
    }
    const response = await groupHandler.updateGroup(data, id);
    if (response.length === 0) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });

  app.get('/api/group/topScore/:groupId/:season', async (req, res) => {
    const { groupId, season } = req.params;
    const topScore = await groupHandler.topScoreForGroup(groupId, season);
    res.status(200).send(topScore);
  });

  app.delete(
    '/api/group/user/:groupId/:delUserId/:adminId',
    async (req, res) => {
      const { groupId, delUserId, adminId } = req.params;
      if (delUserId === adminId) {
        res.status(400).send('Cannot remove self from group!');
        return;
      }
      const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
      const group = await groupHandler.getGroupDataById(groupId);
      const adminCheck = await groupHandler.checkAdmin(group, adminId);
      if (!adminCheck) {
        res.status(400).send('Not authorized to remove people!');
        return;
      }
      const dbRes = await groupHandler.removeUser(group, delUserId, season);

      if (dbRes.status) {
        res.sendStatus(200);
      } else {
        res.status(400).send(dbRes.message);
      }
    }
  );

  app.get('/api/group/admin/verify/:userId/:groupId', async (req, res) => {
    const { userId, groupId } = req.params;
    const group = await groupHandler.getGroupDataById(groupId);
    const onlyAdmin = await groupHandler.singleAdminCheck(group, userId);
    if (onlyAdmin.status) {
      res.status(210).send(onlyAdmin.nonAdmins);
    } else {
      res.sendStatus(200);
    }
  });

  app.put('/api/group/admin/upgrade/:userId/:groupId', async (req, res) => {
    const { userId, groupId } = req.params;
    const group = await groupHandler.getGroupDataById(groupId);
    await groupHandler.upgradeToAdmin(group, userId);
    res.sendStatus(200);
  });

  app.put('/api/group/score/calculate/all', async (req, res) => {
    const { season, week } = await mySportsHandler.pullSeasonAndWeekFromDB();
    rosterHandler.scoreAllGroups(season, week);
    res.sendStatus(200);
  });

  app.get(
    '/api/group/bestOfSeason/:groupId/:season/:maxWeek',
    async (req, res) => {
      const { groupId, season, maxWeek } = req.params;
      const groupDetails = await groupHandler.getGroupDataById(groupId);
      const yearlyWinner = await groupHandler.getYearlyWinner(groupId, season);
      const highestScoreUserWeek = await rosterHandler.getBestUserWeek(
        groupId,
        season,
        maxWeek
      );
      const bestIdealRoster = await rosterHandler.getBestIdealRoster(
        groupId,
        season,
        maxWeek
      );
      const bestScorePlayerByUser =
        await rosterHandler.getBestScorePlayerByUser(groupId, season);
      emailHandler.sendYearlyRecapEmail(
        maxWeek,
        season,
        groupDetails,
        yearlyWinner,
        highestScoreUserWeek,
        bestIdealRoster,
        bestScorePlayerByUser
      );
      res.sendStatus(200);
    }
  );
};
