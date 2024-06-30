import 'dotenv/config.js';
import userHandler from '../handlers/userHandler.js';
import rosterHandler from '../handlers/rosterHandler.js';
import s3Handler from '../handlers/s3Handler.js';
import groupHandler from '../handlers/groupHandler.js';
import {
  authMiddleware,
  verifyUserIsSameEmailUserId,
} from '../handlers/authHandler.js';

export default (app) => {
  app.put('/api/user/updateProfile', async (req, res) => {
    try {
      const { userId, request } = req.body;
      const updateRes = await userHandler.updateProfile(userId, request);
      res.status(updateRes.status).send(updateRes.message);
    } catch (err) {
      res.status(err.status).send(err.message);
    }
  });

  app.put('/api/updateUserToAdmin/:userId/:pass', async (req, res) => {
    const { userId, pass } = req.params;
    if (pass !== process.env.DB_ADMIN_PASS) {
      res.status(401).send('Get Outta Here!');
      return;
    }
    const response = await userHandler.updateToAdmin(userId);

    res.status(200).send(response);
  });

  app.post('/api/user/newUser', async (req, res) => {
    try {
      const { username, email } = req.body;
      await userHandler.saveNewUser({ username, email });
      res.status(200).send('User Created');
    } catch (err) {
      console.log({ err });
      res.status(err.status).send(err.message);
    }
  });

  app.get('/api/user/email/:email', authMiddleware, async (req, res) => {
    try {
      const { email } = req.params;
      const userInfo = await userHandler.getUserByEmail(email);
      const emailSettings = await userHandler.getEmailSettings(userInfo._id);
      res.status(200).send({ userInfo, emailSettings });
    } catch (err) {
      res.status(500).send('Error retrieving user settings');
    }
  });

  app.get('/api/user/reminderPref/:id', async (req, res) => {
    const { id } = req.params;
    const emailPres = await userHandler.getEmailSettings(id);
    res.status(200).send(emailPres);
  });

  app.get('/api/user/getAllUsers', async (req, res) => {
    const dbResponse = await userHandler.getUserList();
    res.status(200).send(dbResponse);
  });

  app.get('/api/user/id/:userId', async (req, res) => {
    const { userId } = req.params;
    const foundUser = await userHandler.getUserByID(userId);
    res.status(foundUser.status).send(foundUser.response);
  });

  app.get('/api/user/name/:username', async (req, res) => {
    const { username } = req.params;
    const user = await userHandler.getUserByUsername(username);
    if (!user) {
      return res.status(400).send(`User ${username} not found!`);
    }
    const avatar = await s3Handler.getUserAvatar(user._id);
    res.status(200).send({ user, avatar });
  });

  // app.post(`/api/user/purgeUserAndGroupDB/:pass`, (req, res) => {
  //   const { pass } = req.params;
  //   if (pass !== process.env.DB_ADMIN_PASS) {
  //     res.status(401).send(`Get Outta Here!`);
  //     return;
  //   }
  //   userHandler.purgeDB();
  //   res.status(200).send(`success`);
  // });

  app.get('/api/user/profile/box/:userId', async (req, res) => {
    const { userId } = req.params;
    Promise.all([
      s3Handler.getUserAvatar(userId),
      rosterHandler.getTotalScore(userId),
      userHandler.getUserByID(userId),
    ]).then(([avatar, totalScore, user]) =>
      res
        .status(200)
        .send({ name: user.response.UN, avatar, score: totalScore })
    );
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
      try {
        const { groupId, userId } = req.params;
        await verifyUserIsSameEmailUserId(req.currentUser, userId);
        await groupHandler.updateMainGroup(groupId, userId);
        res.sendStatus(200);
      } catch (err) {
        console.log({ err });
        res.status(err.status).send(err.message);
      }
    }
  );

  app.put('/api/user/email/settings/:userId', async (req, res) => {
    const { userId } = req.params;
    const { updatedFields } = req.body;
    const response = await userHandler.updateEmailSettings(
      userId,
      updatedFields
    );
    res.status(response.status).send(response.message);
  });

  app.put('/api/user/email/unsubscribe/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      await userHandler.unsubscribeEmails(userId);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err);
    }
  });
};
