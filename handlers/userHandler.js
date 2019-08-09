const db = require(`../models`);
const weekDates = require(`../constants/weekDates`);

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
    },
    getSeasonAndWeek: async () => {
        const today = new Date();
        // const year = parseInt(today.getFullYear());
        // const month = today.getMonth() + 1; //JS starts January at 0
        // const day = today.getUTCDate();

        const year = 2019;
        const month = 11;
        const day = 6;

        let season = ``;
        let week = 1;

        //First we check if the user is trying to access the game outside of the normal date range
        if (typeof weekDates[year] === `undefined` || typeof weekDates[year][month] === `undefined` || typeof weekDates[year][month][day] === `undefined`) {
            //If we are late in 2019 or early in 2020 then we want it to be the last week of the season
            if ((year === 2019 && month === 12) || (year === 2020 && month < 5)) {
                season = `2019-2020-regular`;
                week = 17;
            } else if (year === 2019) { //If it is not late in the year (month 12) we want it to default to week 1 of 2019-2020 season
                season = `2019-2020-regular`;
                week = 1;
            } else if (year === 2020) {
                return { season: `2020-2021-regular`, week: 1 }
            } else if ((year === 2020 && month === 12) || (year === 2021 && month < 5)) {
                season = `2020-2021-regular`;
                week = 17;
            }
        } else {
            season = weekDates[year].season;
            week = weekDates[year][month][day];
        }

        return { season, week }
    }
};