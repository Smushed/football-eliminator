import 'dotenv/config.js';
import userHandler from '../handlers/userHandler.js';
import rosterHandler from '../handlers/rosterHandler.js';
import s3Handler from '../handlers/s3Handler.js';
import groupHandler from '../handlers/groupHandler.js';
import {
  authMiddleware,
  verifyUserIsSameEmailUserId,
} from '../handlers/authHandler.js';
import { returnError } from '../utils/ExpressUtils.js';

export default (app) => {
  app.put('/api/user/update', authMiddleware, async (req, res) => {
    const { userId, request } = req.body;
    try {
      await verifyUserIsSameEmailUserId(req.currentUser, userId);
      const updateRes = await userHandler.updateProfile(userId, request);
      res.status(updateRes.status).send(updateRes.message);
    } catch (err) {
      console.log('Error updating user:', { userId, request, err });
      returnError(res, err, 'Error updating user');
    }
  });

  app.post('/api/user/newUser', async (req, res) => {
    const { username, email } = req.body;
    try {
      await userHandler.saveNewUser({ username, email });
      res.status(200).send('User Created');
    } catch (err) {
      console.log('Error creating new user: ', { username, email, err });
      returnError(res, err);
    }
  });

  app.get('/api/user/email/:email', authMiddleware, async (req, res) => {
    const { email } = req.params;
    try {
      const userInfo = await userHandler.getUserByEmail(email);
      const emailSettings = await userHandler.getEmailSettings(userInfo._id);
      res.status(200).send({ userInfo, emailSettings });
    } catch (err) {
      console.log('Error pulling user by email:', { email, err });
      returnError(res, err, 'Error retrieving user settings');
    }
  });

  app.get('/api/user/reminderPref/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
      const emailPres = await userHandler.getEmailSettings(id);
      res.status(200).send(emailPres);
    } catch (err) {
      console.log('Error getting reminder data: ', { id, err });
      returnError(res, err, 'Error pulling reminder settings');
    }
  });

  app.get('/api/user/getAllUsers', authMiddleware, async (req, res) => {
    try {
      const dbResponse = await userHandler.getUserList();
      res.status(200).send(dbResponse);
    } catch (err) {
      console.log('Error pulling entire userlist: ', { err });
      returnError(res, err, 'Error pulling userlist');
    }
  });

  app.get('/api/user/id/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;
    try {
      const foundUser = await userHandler.getUserByID(userId);
      res.status(foundUser.status).send(foundUser.response);
    } catch (err) {
      console.log('Error getting user by id:', { userId });
      returnError(res, err, 'Error getting user data');
    }
  });

  app.get('/api/user/name/:username', authMiddleware, async (req, res) => {
    const { username } = req.params;
    try {
      const user = await userHandler.getUserByUsername(username);
      if (!user) {
        return res.status(400).send(`User ${username} not found!`);
      }
      const avatar = await s3Handler.getUserAvatar(user._id);
      res.status(200).send({ user, avatar });
    } catch (err) {
      console.log('Error getting user by username: ', { username, err });
      returnError(res, err, 'Error getting user data');
    }
  });

  app.get('/api/user/profile/box/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;
    Promise.all([
      s3Handler.getUserAvatar(userId),
      rosterHandler.getTotalScore(userId),
      userHandler.getUserByID(userId),
    ])
      .then(([avatar, totalScore, user]) =>
        res
          .status(200)
          .send({ username: user.response.username, avatar, score: totalScore })
      )
      .catch((err) => {
        console.log('Error getting user profile for box:', { userId, err });
        returnError(res, err, 'Error getting user data');
      });
  });

  app.delete('/api/user/group/:userId/:groupId', async (req, res) => {
    //TODO Fix this, not used and broken
    const { groupId, userId } = req.params;
    const { season } = await mySportsHandler.pullSeasonAndWeekFromDB();
    const group = await groupHandler.getGroupDataById(groupId);
    const dbRes = await groupHandler.removeUser(group, userId, season);
    if (dbRes.status) {
      res.sendStatus(200);
    } else {
      res.status(400).send(dbRes.message);
    }
  });

  app.put(
    '/api/user/group/main/:groupId/:userId',
    authMiddleware,
    async (req, res) => {
      const { groupId, userId } = req.params;
      try {
        await verifyUserIsSameEmailUserId(req.currentUser, userId);
        await groupHandler.updateMainGroup(groupId, userId);
        res.sendStatus(200);
      } catch (err) {
        console.log('Error updating user: ', { groupId, userId, err });
        returnError(res, err, 'Error updating user');
      }
    }
  );

  app.put(
    '/api/user/email/settings/:userId',
    authMiddleware,
    async (req, res) => {
      try {
        const { userId } = req.params;
        const { updatedFields } = req.body;
        const response = await userHandler.updateEmailSettings(
          userId,
          updatedFields
        );
        res.status(response.status).send(response.message);
      } catch (err) {
        returnError(res, err, 'Error updating email settings');
      }
    }
  );

  app.put('/api/user/email/unsubscribe/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      await userHandler.unsubscribeEmails(userId);
      res.sendStatus(200);
    } catch (err) {
      returnError(res, err);
    }
  });
};
