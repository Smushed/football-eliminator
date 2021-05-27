require(`dotenv`).config();
const userHandler = require(`../handlers/userHandler`);
const rosterHandler = require(`../handlers/rosterHandler`);

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

    //This is email specific for pulling users who are logged in
    app.get(`/api/getUser/:email`, async (req, res) => {
        const email = req.params.email;
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

    app.get(`/api/currentSeasonAndWeek`, async (req, res) => {
        //Finds the current season and week for today's date according to the server.
        //This should only drive the starting values for the selects
        const seasonAndWeek = await userHandler.pullSeasonAndWeekFromDB();
        res.status(200).send(seasonAndWeek);
    });

    app.post(`/api/createRoster/:userid`, async (req, res) => {
        const userId = req.params.userid;
        console.log(userId);

        res.status(200).send(`working`)
    });

    app.post(`/api/createAllRosters/:season/`, async (req, res) => {
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

    app.put(`/api/uploadAvatar/:userId`, (req, res) => {
        //Here in Req.body the base64 image is received.
        //Need to verify that the image is 200 x 200 (if not then make it so)
        //Get the request from amazon (tutorial)
        const { userId } = req.params;
        console.log(req.body)
        const { image } = req.body;
        userHandler.uploadAvatar(userId, image)

        res.status(200).send(req.body)
    });
}