const db = require(`../models`);

//This is for updating the user profile once created
//The user only has access to the local profile
module.exports = {
    getUserList: async () => {
        const userlist = await db.User.find({});
        return userlist;
    },
    updateProfile: (userID, updatedValue, request) => {
        //Switch statement here to decide on what the user is updating
        //They can only update one part of their profile at a time
        let updatedField = ``;
        switch (request) {
            case `username`:
                //TODO Add something to display if the username was already taken
                //Verify that the username isn't taken manually, in addition to having the protection in the database
                //The manual verification should not be case sensitive
                //Mongoose won't let them save a duplicate username but currently won't tell them
                updatedField = `local.username`;
                break;
            case `firstname`:
                updatedField = `local.firstname`;
                break;
            case `lastname`:
                updatedField = `local.lastname`;
                break;
            case `email`:
                //TODO Add something to display if the username was already taken
                //Sweet Alert 2 handles email validation
                updatedField = `local.email`;
                break;
        };
        //TODO Check for duplicates
        db.User.updateOne({ _id: userID }, { $set: { [updatedField]: updatedValue } }, (err, data) => {
            if (err) {
                return err;
            } else {
                return "Updated Successfully"
            }
        });
    },
    isLoggedIn: (req, res, next) => {
        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated()) {
            return next();
        }
        // if they aren't redirect them to the home page
        res.redirect(`/`);
    },
    getProfile: async (userID) => {
        const userProfile = await db.User.findById([userID]);
        return userProfile;
    },
    saveNewUser: async (newUser) => {
        const newUserInDB = await db.User.create(newUser);

        console.log(newUserInDB)

        //This then creates a new roster for the user that just signed up
        const newUserRoster = {
            userId: newUserInDB._id
        }
        await db.UserRoster.create(newUserRoster)
        return newUserInDB;
    },
    getUserByEmail: async (email) => {
        const foundUser = await db.User.findOne({ 'local.email': email });
        return foundUser;
    },
    userSearch: async (query, searchParam) => {
        //On the front end we control what can be searched with a select dropdown
        let userArray = [];
        switch (searchParam) {
            case `username`:
                userArray = await db.User.find({ 'local.username': query });
                break;
            case `email`:
                userArray = await db.User.find({ 'local.email': query });
                break;
        }

        const userArrayToShow = userArray.map(user => {
            const dataToShow = {
                userID: user._id,
                email: user.local.email,
                username: user.local.username,
                firstname: user.local.firstname,
                lastname: user.local.lastname,
            }
            return dataToShow
        })
        return userArrayToShow;
    },
    getUserByID: async (userID) => {
        const foundUser = await db.User.findById([userID]);
        return foundUser;
    }
};