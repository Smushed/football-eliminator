const db = require(`../models`);
const groupHandler = require(`./groupHandler`);

const checkDuplicateUser = async (checkedField, userId) => {
    let result = false;
    let searched;
    //TODO Do something other than log these errors
    switch (checkedField) {
        case `userScore`:
            try {
                searched = await db.UserScores.findOne({ ID: userId }).exec();
                //If there is a group with that name return true
                if (searched !== null) {
                    result = true;
                };
            } catch (err) {
                console.log(err);
            };
            break;
    }
    return result;
};

//This is for updating the user profile once created
//The user only has access to the local profile
module.exports = {
    getUserList: async () => {
        const userlist = await db.User.find({});
        const filteredList = userlist.map(user => { return { username: user.UN, email: user.E, _id: user._id, groupList: user.GL } });

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
        await db.User.updateOne({ _id: userId }, { $set: { A: true } }, (err, data) => {
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
        const generalGroup = await db.Group.findOne({ N: 'The Eliminator' });
        newUser.GL = generalGroup._id;

        const usernameExists = await db.User.findOne({ UN: newUser.UN });
        const emailExists = await db.User.findOne({ E: newUser.E });
        //TODO Do more with this than just return false
        // if (usernameExists !== null || emailExists !== null) { return false };

        const newUserInDB = await db.User.create(newUser);
        const newUserInDBObj = newUserInDB.toObject();
        console.log(`user hit`)
        groupHandler.addUser(newUserInDBObj._id, `The Eliminator`)

        return newUserInDBObj;
    },
    getUserByEmail: async (email) => {
        const foundUser = await db.User.findOne({ 'E': email });
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
    // getSeasonAndWeek: async function () {
    //     const currentTime = DateTime.local().setZone(`America/Chicago`);
    //     const year = parseInt(currentTime.c.year);
    //     const month = parseInt(currentTime.c.month);
    //     const day = parseInt(currentTime.c.day);

    //     let season = ``;
    //     let week = 1;

    //     //First we check if the user is trying to access the game outside of the normal date range
    //     if (typeof weekDates[year] === `undefined` || typeof weekDates[year][month] === `undefined` || typeof weekDates[year][month][day] === `undefined`) {
    //         //If we are late in 2019 or early in 2020 then we want it to be the last week of the season
    //         if ((year === 2019 && month === 12) || (year === 2020 && month < 5)) {
    //             season = `2019-2020-regular`;
    //             week = 17;
    //         } else if (year === 2019) { //If it is not late in the year (month 12) we want it to default to week 1 of 2019-2020 season
    //             season = `2019-2020-regular`;
    //             week = 1;
    //         } else if (year === 2020) {
    //             return { season: `2020-2021-regular`, week: 1 }
    //         } else if ((year === 2020 && month === 12) || (year === 2021 && month < 5)) {
    //             season = `2020-2021-regular`;
    //             week = 17;
    //         };
    //     } else { //This is if this is inside the season. There's an object in weekDates that I put the calendar in
    //         season = weekDates[year].season;
    //         week = weekDates[year][month][day];
    //     };


    //     return { season, week };
    // },
    initSeasonAndWeekInDB: async () => {
        db.SeasonAndWeek.create({});
    },
    pullSeasonAndWeekFromDB: async () => {
        return new Promise(async (res, rej) => {
            const dbResponse = await db.SeasonAndWeek.find({}).exec();
            const season = dbResponse[0].S;
            const week = dbResponse[0].W;
            const lockWeek = dbResponse[0].LW;

            res({ season, week, lockWeek });
        })
    },
    createUserScore: async (userId, season, groupId) => {
        const checkDupeUser = await checkDuplicateUser(`userScore`, userId);
        if (!checkDupeUser) {
            db.UserScores.create({ ID: userId, G: groupId, S: season });
        };
        return;
    }
};