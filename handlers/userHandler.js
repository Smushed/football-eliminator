const db = require(`../models`);
const weekDates = require(`../constants/weekDates`);
var { DateTime } = require('luxon');

//This is for updating the user profile once created
//The user only has access to the local profile
module.exports = {
    getUserList: async () => {
        const userlist = await db.User.find({});
        const filteredList = userlist.map(user => { return { username: user.local.username, email: user.local.email, _id: user._id } });

        return filteredList;
    },
    updateProfile: (userId, updatedValue, request) => {
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
                //TODO Add something to display if the email was already taken
                //Sweet Alert 2 handles email validation
                updatedField = `local.email`;
                break;
        };
        //TODO Check for duplicates
        db.User.updateOne({ _id: userId }, { $set: { [updatedField]: updatedValue } }, (err, data) => {
            if (err) {
                return err;
            } else {
                return "Updated Successfully";
            };
        });
    },
    updateToAdmin: async (userId) => {
        let dbResponse = ``;
        await db.User.updateOne({ _id: userId }, { $set: { isAdmin: true } }, (err, data) => {
            if (err) {
                dbResponse = err;
            } else {
                dbResponse = `${userId} is now an admin!`;
            };
        });
        return dbResponse;
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

        //This then creates a new roster for the user that just signed up
        const newUserRoster = {
            userId: newUserInDB._id
        }
        await db.UserRoster.create(newUserRoster);
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
        };

        const userArrayToShow = userArray.map(user => {
            const dataToShow = {
                userID: user._id,
                email: user.local.email,
                username: user.local.username,
                firstname: user.local.firstname,
                lastname: user.local.lastname,
            };
            return dataToShow;
        });
        return userArrayToShow;
    },
    getUserByID: async (userID) => {
        const foundUser = await db.User.findById([userID]);
        return foundUser;
    },
    getSeasonAndWeek: async function () {
        const currentTime = DateTime.local().setZone(`America/Chicago`);
        const year = parseInt(currentTime.c.year);
        const month = parseInt(currentTime.c.month);
        const day = parseInt(currentTime.c.day);

        const thursday = DateTime.fromISO('2019-09-05T19:00');

        const compare = currentTime < thursday;

        let season = ``;
        let week = 1;
        let lockWeek = 0; //This is what is the last week that is locked. As in if this is a 2, weeks 1 & 2 should be locked

        //First we check if the user is trying to access the game outside of the normal date range
        if (typeof weekDates[year] === `undefined` || typeof weekDates[year][month] === `undefined` || typeof weekDates[year][month][day] === `undefined`) {
            //If we are late in 2019 or early in 2020 then we want it to be the last week of the season
            if ((year === 2019 && month === 12) || (year === 2020 && month < 5)) {
                season = `2019-2020-regular`;
                week = 17;
                lockWeek = 17;
            } else if (year === 2019) { //If it is not late in the year (month 12) we want it to default to week 1 of 2019-2020 season
                season = `2019-2020-regular`;
                week = 1;
                //No lockWeek for this one. This is pre-season and we don't want anything locked.
            } else if (year === 2020) {
                return { season: `2020-2021-regular`, week: 1 }
            } else if ((year === 2020 && month === 12) || (year === 2021 && month < 5)) {
                season = `2020-2021-regular`;
                week = 17;
            };
        } else { //This is if this is inside the season. There's an object in weekDates that I put the calendar in
            season = weekDates[year].season;
            week = weekDates[year][month][day];

            //TODO FIGURE OUT HOW TO HANDLE WEEK 0
            lockWeek = this.checkLockPeroid(year, currentTime);
        };


        return { season, week };
    },
    checkLockPeroid: (year, currentTime) => {
        //Breaking this out to it's own function to ensure that people aren't saving their rosters past the lock peroid
        //If this wasn't it's own function and relied on the client to define the lock
        for (let i = 0; i < weekDates[year].lockDates.length; i++) {
            if (currentTime < DateTime.fromISO(weekDates[year].lockDates[i].lockTime)) {
                return weekDates[year].lockDates[i].lockWeek;
            };
        };
    }
};