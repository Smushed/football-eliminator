require(`dotenv`).config();
const userHandler = require(`../handlers/userHandler`);
const rosterHandler = require(`../handlers/rosterHandler`);
const s3Handler = require(`../handlers/s3Handler`);

module.exports = app => {
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
        };
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

    app.get(`/api/getUser/:email`, async (req, res) => {
        const { email } = req.params;
        const foundUser = await userHandler.getUserByEmail(email);
        res.status(200).send(foundUser);
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

    app.get(`/api/getUserById/:userid`, async (req, res) => {
        const userId = req.params.userid;
        const foundUser = await userHandler.getUserByID(userId);
        res.status(200).send(foundUser);
    });

    app.get(`/api/user/name/:username`, async (req, res) => {
        const { username } = req.params;
        const user = await userHandler.getUserByUsername(username);
        const avatar = await s3Handler.getAvatar(user._id);
        res.status(200).send({ user, avatar });
    });

    app.get(`/api/currentSeasonAndWeek`, async (req, res) => {
        //Finds the current season and week for today's date according to the server.
        //This should only drive the starting values for the selects
        const seasonAndWeek = await userHandler.pullSeasonAndWeekFromDB();
        res.status(200).send(seasonAndWeek);
    });

    app.post(`/api/createAllRosters/:season/`, (req, res) => {
        const { season } = req.params;
        const dbResponse = rosterHandler.createAllRosters(season);
        res.status(200).send(dbResponse)
    });

    app.post(`/api/purgeUserAndGroupDB/:pass`, (req, res) => {
        const { pass } = req.params;
        if (pass !== process.env.DB_ADMIN_PASS) {
            res.status(401).send(`Get Outta Here!`);
            return;
        };
        console.log(`deleting`)
        userHandler.purgeDB();
        res.status(200).send(`success`);
    });

    app.put(`/api/updateWeekSeason/:pass/:season/:currentWeek/:lockWeek`, async (req, res) => {
        const { pass, season, currentWeek, lockWeek } = req.params;
        if (pass !== process.env.DB_ADMIN_PASS) {
            res.status(401).send(`Get Outta Here!`);
            return;
        };
        const updated = await userHandler.updateSeasonWeek(season, currentWeek, lockWeek);

        res.status(200).send(updated);
    });

    app.put(`/api/avatar/:id`, (req, res) => {
        const { id } = req.params;
        const { image } = req.body;
        s3Handler.uploadAvatar(id, image)

        res.status(200).send(`success`)
    });

    app.get(`/api/avatar/:id`, async (req, res) => {
        const { id } = req.params;
        const avatar = await s3Handler.getAvatar(id);
        res.status(200).send(avatar);
    });

    app.get(`/api/user/box/:username`, async (req, res) => {
        const { username } = req.params;
        const user = await userHandler.getUserByUsername(username);
        const stringUserId = user._id.toString();
        Promise.all([
            s3Handler.getAvatar(stringUserId),
            rosterHandler.getTotalScore(stringUserId)])
            .then(([avatar, totalScore]) =>
                res.status(200).send({ name: user.UN, avatar, score: totalScore })
            );
    });
}