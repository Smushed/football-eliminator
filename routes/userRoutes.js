require(`dotenv`).config();
const userHandler = require(`../handlers/userHandler`);
const rosterHandler = require(`../handlers/rosterHandler`);
const s3Handler = require(`../handlers/s3Handler`);
const groupHandler = require(`../handlers/groupHandler`);

module.exports = (app) => {
  app.put(`/api/user/updateProfile`, async (req, res) => {
    const { userId, request } = req.body;
    const updatedUser = await userHandler.updateProfile(userId, request);
    res.status(200).send(updatedUser);
  });

  app.put(`/api/updateUserToAdmin/:userId/:pass`, async (req, res) => {
    const { userId, pass } = req.params;
    if (pass !== process.env.DB_ADMIN_PASS) {
      res.status(401).send(`Get Outta Here!`);
      return;
    }
    const response = await userHandler.updateToAdmin(userId);

    res.status(200).send(response);
  });

  app.post(`/api/user/newUser`, async (req, res) => {
    //Called before the user signs up with Firebase
    const newUser = {
      UN: req.body.username,
      E: req.body.email,
      A: false,
    };
    const { newUserInDB } = await userHandler.saveNewUser(newUser);

    res.json(newUserInDB);
  });

  app.get(`/api/user/email/:email`, async (req, res) => {
    const { email } = req.params;
    const foundUser = await userHandler.getUserByEmail(email);
    const emailSettings = await userHandler.getEmailSettings(foundUser._id);
    res.status(200).send({ ...foundUser, ...emailSettings });
  });

  app.get(`/api/user/emailPref/:id`, async (req, res) => {
    const { id } = req.params;
    const emailPres = await userHandler.getEmailSettings(id);
    res.status(200).send(emailPres);
  });

  app.get(`/api/user/getAllUsers`, async (req, res) => {
    const dbResponse = await userHandler.getUserList();
    res.status(200).send(dbResponse);
  });

  app.get(`/api/user/id/:userId`, async (req, res) => {
    const { userId } = req.params;
    const foundUser = await userHandler.getUserByID(userId);
    res.status(foundUser.status).send(foundUser.response);
  });

  app.get(`/api/user/name/:username`, async (req, res) => {
    const { username } = req.params;
    const user = await userHandler.getUserByUsername(username);
    const avatar = await s3Handler.getUserAvatar(user._id);
    res.status(200).send({ user, avatar });
  });

  app.post(`/api/user/purgeUserAndGroupDB/:pass`, (req, res) => {
    const { pass } = req.params;
    if (pass !== process.env.DB_ADMIN_PASS) {
      res.status(401).send(`Get Outta Here!`);
      return;
    }
    userHandler.purgeDB();
    res.status(200).send(`success`);
  });

  app.put(`/api/user/avatar/:id`, (req, res) => {
    const { id } = req.params;
    const { image } = req.body;
    s3Handler.uploadAvatar(id, image);

    res.status(200).send(`success`);
  });

  app.get(`/api/user/avatar/:id`, async (req, res) => {
    const { id } = req.params;
    const avatar = await s3Handler.getUserAvatar(id);
    res.status(200).send(avatar);
  });

  app.post(`/api/user/userAvatars`, async (req, res) => {
    const { userIdList } = req.body;
    const response = await s3Handler.getMultipleUserAvatars(userIdList);
    res.status(200).send(response);
  });

  app.post(`/api/user/playerAvatars`, async (req, res) => {
    const { avatars } = req.body;
    const response = await s3Handler.getMultiplePlayerAvatars(avatars);
    res.status(200).send(response);
  });

  app.get(`/api/user/profile/box/:userId`, async (req, res) => {
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

  app.delete(`/api/user/group/:userId/:groupId`, async (req, res) => {
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

  app.put(`/api/user/group/main/:groupId/:userId`, async (req, res) => {
    const { groupId, userId } = req.params;
    await groupHandler.updateMainGroup(groupId, userId);
    res.sendStatus(200);
  });

  app.put(`/api/user/email/settings/:userId/:LE/:RE`, (req, res) => {
    const { userId, LE, RE } = req.params;
    userHandler.updateEmailSettings(userId, LE, RE);
    res.sendStatus(200);
  });

  app.put(`/api/user/email/unsubscribe/:userId`, async (req, res) => {
    const { userId } = req.params;
    try {
      await userHandler.unsubscribeEmails(userId);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err);
    }
  });
};
