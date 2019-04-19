const userHandler = require(`../handlers/userHandler`);


module.exports = app => {
    app.put(`/api/updateuser`, async (req, res) => {
        const { userID, value, request } = req.body;

        //Pass the user to change's field, their updated value and what field they would like to change
        const updatedUser = await userHandler.updateProfile(userID, value, request);
        res.status(200).send(updatedUser)
    });

    app.post(`/api/newuser`, async (req, res) => {
        //Called after the user signs up with Firebase
        const newUser = {}
        newUser.local = {
            username: req.body.username,
            email: req.body.email,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        };
        const newUserInDB = await userHandler.saveNewUser(newUser)
        res.json(newUserInDB)
    });

    //This is email specific for pulling users who are logged in
    app.get(`/api/getuser/:email`, async (req, res) => {
        const email = req.params.email;
        const foundUser = await userHandler.getUserByEmail(email);
        res.status(200).send(foundUser);
    });

    //This is the route for the user search
    app.get(`/api/usersearch/:query/:searchParam`, async (req, res) => {
        const { query, searchParam } = req.params;

        const foundUser = await userHandler.userSearch(query, searchParam);
        res.status(200).send(foundUser);
    });

    app.get(`/api/getuserbyid/:userid`, async (req, res) => {
        const userID = req.params.userid;
        const foundUser = await userHandler.getUserByID(userID);
        res.status(200).send(foundUser);
    })
}