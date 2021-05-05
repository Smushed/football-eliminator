const db = require(`../models`);

const groupHandler = require(`./groupHandler`);

const checkDuplicateUser = async (checkedField, checkField1, checkField2) => {
    let result = false;
    let searched;
    //TODO Do something other than log these errors
    switch (checkedField) {
        case `username`:
            searched = await db.User.findOne({ UN: checkField1 });
            if (searched !== null) {
                result = true;
            };
            break;
        case `email`:
            searched = await db.User.findOne({ E: checkField1 });
            if (searched !== null) {
                result = true;
            };
            break;
        case `group`:
            const dbUser = await db.User.findById(checkField1);
            const alreadyInGroup = await dbUser.GL.filter(groupId => groupId.toString() === checkField2.toString());
            if (alreadyInGroup.length > 0) {
                result = true;
            };
    };
    return result;
};

const fillOutUserForFrontEnd = async (user) => {
    const groupList = [];
    for (let i = 0; i < user.GL.length; i++) {
        const groupData = await groupHandler.getGroupData(user.GL[i]);
        groupList.push({
            N: groupData.N,
            D: groupData.D,
            _id: groupData._id
        });
    };
    const filledUser = {
        UN: user.UN,
        _id: user._id,
        A: user.A,
        GL: groupList,
        FT: user.FT || 'UNK'
    };

    return filledUser;
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
    saveNewUser: async (newUser) => {
        if (!checkDuplicateUser(`username`, newUser.UN) || !checkDuplicateUser(`email`, newUser.E)) { return false };

        const newUserInDB = await db.User.create(newUser);

        return { newUserInDB };
    },
    getUserByEmail: async (email) => {
        const foundUser = await db.User.findOne({ 'E': email });
        const response = await fillOutUserForFrontEnd(foundUser);

        return response;
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
        const foundUser = await db.User.findById(userID);
        const response = await fillOutUserForFrontEnd(foundUser);
        return response;
    },
    findUserByUsername: async (username) => {
        const user = await db.User.findOne({ UN: username });
        return user;
    },
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
    purgeDB: () => { //TODO If I make Admin Route and Handler, move this over
        db.User.deleteMany({}, (err, res) => { if (err) { console.log(err) } else { console.log(`User Deleted`) } });
        db.UserRoster.deleteMany({}, (err, res) => { if (err) { console.log(err) } else { console.log(`User Roster Deleted`) } });
        db.UserScores.deleteMany({}, (err, res) => { if (err) { console.log(err) } else { console.log(`User Score Deleted`) } });
        db.Group.deleteMany({}, (err, res) => { if (err) { console.log(err) } else { console.log(`Group Deleted`) } });
        db.GroupRoster.deleteMany({}, (err, res) => { if (err) { console.log(err) } else { console.log(`Group Roster Deleted`) } });
        db.GroupScore.deleteMany({}, (err, res) => { if (err) { console.log(err) } else { console.log(`Group Score Deleted`) } });
        db.SeasonAndWeek.deleteMany({}, (err, res) => { if (err) { console.log(err) } else { console.log(`Season & Week Deleted`) } });
    },
    updateSeasonWeek: (season, currentWeek, lockWeek) => {
        return new Promise(async (res, rej) => {
            try {
                await db.SeasonAndWeek.updateMany({}, { $set: { S: season, W: currentWeek, LW: lockWeek } });
                res(`success!`);
            } catch (e) {
                console.log(e);
                res(`failure, check logs!`);
            };
        })
    },
    addGroupToList: async (userId, groupId) => {
        const isInGroup = await checkDuplicateUser(`group`, userId, groupId);
        if (isInGroup) {
            return { status: 409, message: 'Group already added to user!' }
        } else {
            await db.User.findByIdAndUpdate([userId], { $push: { GL: groupId } });
        }
        return { status: 200, message: 'All Good' };
    }
};