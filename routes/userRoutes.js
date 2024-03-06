require(`dotenv`).config();
const userHandler = require(`../handlers/userHandler`);
const rosterHandler = require(`../handlers/rosterHandler`);
const s3Handler = require(`../handlers/s3Handler`);
const groupHandler = require(`../handlers/groupHandler`);

module.exports = (app) => {
  app.put(`/api/updateProfile`, async (req, res) => {
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

  app.post(`/api/newUser`, async (req, res) => {
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
    res.status(200).send(foundUser);
  });

  app.get(`/api/user/emailPref/:id`, async (req, res) => {
    const { id } = req.params;
    const emailPres = await userHandler.getEmailSettings(id);
    res.status(200).send(emailPres);
  });

  app.get(`/api/getAllUsers`, async (req, res) => {
    const dbResponse = await userHandler.getUserList();

    res.status(200).send(dbResponse);
  });

  //This is the route for the user search
  app.get(`/api/usersearch/:query/:searchParam`, async (req, res) => {
    const { query, searchParam } = req.params;

    const foundUser = await userHandler.userSearch(query, searchParam);
    res.status(200).send(foundUser);
  });

  app.get(`/api/user/id/:userId`, async (req, res) => {
    const { userId } = req.params;
    const foundUser = await userHandler.getUserByID(userId);
    res.status(foundUser.status).send(foundUser.response);
  });

  app.get(`/api/user/name/:username`, async (req, res) => {
    const { username } = req.params;
    const user = await userHandler.getUserByUsername(username);
    const emailSettings = await userHandler.getEmailSettings(user._id);
    const avatar = await s3Handler.getAvatar(user._id);
    res.status(200).send({ user, avatar, emailSettings });
  });

  app.get(`/api/currentSeasonAndWeek`, async (req, res) => {
    const seasonAndWeek = await userHandler.pullSeasonAndWeekFromDB();
    res.status(200).send(seasonAndWeek);
  });

  app.post(`/api/purgeUserAndGroupDB/:pass`, (req, res) => {
    const { pass } = req.params;
    if (pass !== process.env.DB_ADMIN_PASS) {
      res.status(401).send(`Get Outta Here!`);
      return;
    }
    console.log(`deleting`);
    userHandler.purgeDB();
    res.status(200).send(`success`);
  });

  app.put(
    `/api/updateWeekSeason/:pass/:season/:currentWeek/:lockWeek`,
    async (req, res) => {
      const { pass, season, currentWeek, lockWeek } = req.params;
      if (pass !== process.env.DB_ADMIN_PASS) {
        res.status(401).send(`Get Outta Here!`);
        return;
      }
      const updated = await userHandler.updateSeasonWeek(
        season,
        currentWeek,
        lockWeek
      );

      res.status(200).send(updated);
    }
  );

  app.put(`/api/avatar/:id`, (req, res) => {
    const { id } = req.params;
    const { image } = req.body;
    s3Handler.uploadAvatar(id, image);

    res.status(200).send(`success`);
  });

  app.get(`/api/avatar/:id`, async (req, res) => {
    const { id } = req.params;
    const avatar = await s3Handler.getAvatar(id);
    res.status(200).send(avatar);
  });

  app.post(`/api/playerAvatars`, async (req, res) => {
    const { avatars } = req.body;
    const response = await s3Handler.getMultiplePlayerAvatars(avatars);
    res.status(200).send(response);
  });

  app.get(`/api/user/profile/box/:userId`, async (req, res) => {
    const { userId } = req.params;
    Promise.all([
      s3Handler.getAvatar(userId),
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
    const { season } = await userHandler.pullSeasonAndWeekFromDB();
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

  app.put(`/api/user/emailPref/:userId/:LE/:RE`, (req, res) => {
    const { userId, LE, RE } = req.params;
    userHandler.updateEmailSettings(userId, LE, RE);
    res.sendStatus(200);
  });
};
