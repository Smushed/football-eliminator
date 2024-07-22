import 'dotenv/config.js';
import userHandler from '../handlers/userHandler.js';
import groupHandler from '../handlers/groupHandler.js';
import scoringSystem from '../constants/scoringSystem.js';
import rosterHandler from '../handlers/rosterHandler.js';
import s3Handler from '../handlers/s3Handler.js';
import emailHandler from '../handlers/emailHandler.js';
import mySportsHandler from '../handlers/mySportsHandler.js';
import {
  authMiddleware,
  verifyGroupAdminByEmail,
  verifyUserIsSameEmailUserId,
} from '../handlers/authHandler.js';
import { returnError } from '../utils/ExpressUtils.js';

export default (app) => {
  app.put('/api/group/join/', async (req, res) => {
    const { userId, groupId } = req.body;
    try {
      await groupHandler.addUser(userId, groupId);
      await userHandler.addGroupToList(userId, groupId);
      res.status(200).send('Added');
    } catch (err) {
      returnError(res, err, 'Error joining group, please try again');
    }
  });

  app.get('/api/group/profile', async (req, res) => {
    const { name, avatar, positions } = req.query;
    const group = { group: null, gAvatar: null, pos: null };
    try {
      group.group = await groupHandler.getGroupDataByName(name);

      if (avatar === 'true') {
        group.gAvatar = await s3Handler.getUserAvatar(groupData._id.toString());
      }
      if (positions === 'true') {
        group.pos = await groupHandler.getGroupPositions(
          groupData._id.toString()
        );
      }
      groupData.userlist = await userHandler.fillUserListFromGroup(
        groupData.userlist
      );

      if (!groupData) {
        throw { status: 500, message: 'No Group Found' };
      }
      res.status(200).send(group);
    } catch (err) {
      returnError(res, err);
    }
  });

  app.get(
    '/api/group/details/all/user/:userId',
    authMiddleware,
    async (req, res) => {
      try {
        const { userId } = req.params;
        const groupInfoArray = await groupHandler.getGroupDataByUserId(userId);
        res.status(200).send(groupInfoArray);
      } catch (err) {
        returnError(res, err, 'Error getting group details');
      }
    }
  );

  app.get('/api/group/details/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const groupInfo = await groupHandler.getGroupDataById(id);
      groupInfo.userlist = await userHandler.fillUserListFromGroup(
        groupInfo.userlist
      );
      res.status(200).send(groupInfo);
    } catch (err) {
      console.log('Error pulling group details by groupId ', { err });
      returnError(res, err, 'Error getting group details');
    }
  });

  app.get('/api/group/positions/:groupId', async (req, res) => {
    try {
      const { groupId } = req.params;
      const positions = await groupHandler.getGroupPositions(groupId);
      res.status(200).send(positions);
    } catch (err) {
      returnError(res, err);
    }
  });

  app.get('/api/group/getScoring', async (req, res) => {
    res.status(200).send(scoringSystem);
  });

  app.post('/api/group/create', async (req, res) => {
    const { userId, newGroupScore, groupName, groupDesc, groupPositions } =
      req.body;
    try {
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
    } catch (err) {
      returnError(res, err);
    }
  });

  app.get('/api/group/list', authMiddleware, async (req, res) => {
    try {
      const dbResponse = await groupHandler.getGroupList();
      res.status(200).send(dbResponse);
    } catch (err) {
      returnError(res, err, 'Error getting group list');
    }
  });

  app.get(
    '/api/group/leaderboard/:season/:week/:groupId',
    authMiddleware,
    async (req, res) => {
      try {
        const { season, week, groupId } = req.params;
        const leaderboard = await groupHandler.getLeaderBoard(
          groupId,
          season,
          +week
        );
        res.status(200).send({ leaderboard });
      } catch (err) {
        console.log('Error getting leaderboard for group :', {
          params: req.params,
          err,
        });
        returnError(res, err);
      }
    }
  );

  app.get(
    '/api/group/roster/bestAndLead/:season/:week/:groupId',
    authMiddleware,
    async (req, res) => {
      try {
        const { season, week, groupId } = req.params;
        if (+week === 1) {
          //Setting this blank roster if we are currently in week 1 there is no previous week to compare
          const blankRoster = await groupHandler.getBlankRoster(groupId);
          const bestRoster = { roster: blankRoster, username: '' };
          res.status(200).send({ bestRoster, roster: blankRoster });
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
          ])
            .then(async ([bestRoster, roster]) => {
              if (!bestRoster) {
                const blankRoster = await groupHandler.getBlankRoster(groupId);
                bestRoster = { roster: blankRoster, username: '' };
              }
              return res.status(200).send({ bestRoster, roster });
            })
            .catch((err) => {
              returnError(res, err);
              return;
            });
        }
      } catch (err) {
        console.log('Error getting best and leader roster for group ', {
          parmas: req.params,
          err,
        });
        returnError(res, err, 'Error pulling best roster for the group');
      }
    }
  );

  app.get('/api/group/profile/box/:username/:groupname', async (req, res) => {
    const { username, groupname } = req.params;
    Promise.all([
      mySportsHandler.pullSeasonAndWeekFromDB(),
      groupHandler.getGroupDataByName(groupname),
      userHandler.getUserByUsername(username),
    ])
      .then(([{ season, week }, groupData, userData]) => {
        groupHandler
          .getCurrAndLastWeekScores(groupData._id, season, +week)
          .then((userScores) => {
            groupHandler
              .getBestUserForBox(userScores)
              .then((topUser) => {
                const currUserScore = userScores.find(
                  (score) => score.userId.toString() === userData._id.toString()
                );

                res.status(200).send({
                  groupData: groupData,
                  userScore: {
                    username: username,
                    totalScore: currUserScore.totalScore,
                  },
                  topScore: topUser,
                });
              })
              .catch((err) => {
                console.log('Error level 1 in group profile pull: ', {
                  username,
                  groupname,
                  err,
                });
                returnError(res, err, 'Error pulling group data');
                return;
              });
          })
          .catch((err) => {
            console.log('Error level 2 in group profile pull: ', {
              username,
              groupname,
              err,
            });
            returnError(res, err, 'Error pulling group data');
            return;
          });
      })
      .catch((err) => {
        console.log('Error level 3 in group profile pull: ', {
          username,
          groupname,
          err,
        });
        returnError(res, err, 'Error pulling group data');
        return;
      });
  });

  app.get('/api/group/scoring/:groupId', async (req, res) => {
    const { withDesc } = req.query;
    const { groupId } = req.params;
    const response = {};

    try {
      response.groupScore = await groupHandler.getGroupScore(groupId);
    } catch (err) {
      returnError(res, err);
      return;
    }

    if (withDesc === 'true') {
      response.map = scoringSystem.groupScoreMap;
      response.bucketMap = scoringSystem.groupScoreBucketMap;
    }
    res.status(200).send(response);
  });

  app.put('/api/group/', authMiddleware, async (req, res) => {
    try {
      const { data } = req.body;
      await verifyGroupAdminByEmail(req.currentUser, data.groupId);
      const response = await groupHandler.updateGroup(data);
      res.status(response.status).send(response.message);
    } catch (err) {
      returnError(res, err);
    }
  });

  app.get('/api/group/topScore/:groupId/:season', async (req, res) => {
    const { groupId, season } = req.params;
    try {
      const topScore = await groupHandler.topScoreForGroup(groupId, season);
      res.status(200).send(topScore);
    } catch (err) {
      returnError(res, err);
    }
  });

  app.delete(
    '/api/group/user/:groupId/:delUserId/:adminId',
    async (req, res) => {
      const { groupId, delUserId, adminId } = req.params;
      try {
        if (delUserId === adminId) {
          throw { status: 400, message: 'Cannot remove self from group!' };
        }
        const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
        const group = await groupHandler.getGroupDataById(groupId);
        const adminCheck = await groupHandler.checkAdmin(group, adminId);
        if (!adminCheck) {
          throw { status: 400, message: 'Not authorized to remove people!' };
        }
        await groupHandler.removeUser(group, delUserId, season);

        res.status(200).send('User removed');
      } catch (err) {
        returnError(res, err);
      }
    }
  );

  app.delete(
    '/api/group/user/:groupId/:userId',
    authMiddleware,
    async (req, res) => {
      const { groupId, userId } = req.params;
      try {
        await verifyUserIsSameEmailUserId(req.currentUser, userId);
        const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
        const group = await groupHandler.getGroupDataByIdNoLean(groupId);
        await groupHandler.removeUser(group, userId, season);
        res.status(200).send('winnder');
      } catch (err) {
        returnError(res, err);
      }
    }
  );

  app.get(
    '/api/group/admin/verify/:userId/:groupId',
    authMiddleware,
    async (req, res) => {
      const { userId, groupId } = req.params;
      try {
        const group = await groupHandler.getGroupDataById(groupId);
        const onlyAdmin = await groupHandler.singleAdminCheck(group, userId);
        if (onlyAdmin.status) {
          res.status(210).send(onlyAdmin.nonAdmins);
        } else {
          res.sendStatus(200);
        }
      } catch (err) {
        returnError(res, err);
      }
    }
  );

  app.put(
    '/api/group/admin/upgrade/:userId/:groupId',
    authMiddleware,
    async (req, res) => {
      const { userId, groupId } = req.params;
      try {
        const group = await groupHandler.getGroupDataById(groupId);
        await groupHandler.upgradeToAdmin(group, userId);
        res.sendStatus(200);
      } catch (err) {
        returnError(res, err);
      }
    }
  );

  app.put(
    '/api/group/score/calculate/all',
    authMiddleware,
    async (req, res) => {
      try {
        const { season, week } =
          await mySportsHandler.pullSeasonAndWeekFromDB();
        rosterHandler.scoreAllGroups(season, week);
        res.sendStatus(200);
      } catch (err) {
        returnError(res, err, 'Error calculating score for group');
      }
    }
  );

  app.get(
    '/api/group/bestOfSeason/:groupId/:season/:maxWeek',
    authMiddleware,
    async (req, res) => {
      const { groupId, season, maxWeek } = req.params;
      try {
        const groupDetails = await groupHandler.getGroupDataById(groupId);
        const yearlyWinner = await groupHandler.getYearlyWinner(
          groupId,
          season
        );
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
      } catch (err) {
        returnError(res, err);
      }
    }
  );
};
