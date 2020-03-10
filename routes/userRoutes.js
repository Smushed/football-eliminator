const userHandler = require(`../handlers/userHandler`);

module.exports = app => {
    app.put(`/api/updateuser`, async (req, res) => {
        const { userId, value, request } = req.body;

        //Pass the user to change's field, their updated value and what field they would like to change
        const updatedUser = await userHandler.updateProfile(userId, value, request);
        res.status(200).send(updatedUser);
    });

    app.put(`/api/updateUserToAdmin/:userId`, async (req, res) => {
        const { userId } = req.params;

        const response = await userHandler.updateToAdmin(userId);

        res.status(200).send(response);
    });

    app.post(`/api/newuser`, async (req, res) => {
        //Called after the user signs up with Firebase
        const newUser = {
            UN: req.body.username,
            E: req.body.email,
            A: false,
            GL: [`Woodbilly`]
        };
        const newUserInDB = await userHandler.saveNewUser(newUser);
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
        const seasonAndWeek = await userHandler.getSeasonAndWeek();

        res.status(200).send(seasonAndWeek);
    });
}