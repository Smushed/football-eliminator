const db = require(`../models`);

const checkDuplicateUser = async (checkedField, checkField1, checkField2) => {
    let result = false;
    let searched;
    switch (checkedField) {
        case `username`: {
            searched = await db.User.findOne({ UN: checkField1 });
            if (searched !== null) {
                result = true;
            }
            break;
        }
        case `email`: {
            searched = await db.User.findOne({ E: checkField1 });
            if (searched !== null) {
                result = true;
            }
            break;
        }
        case `group`: {
            const dbUser = await db.User.findById(checkField1);
            const alreadyInGroup = await dbUser.GL.filter(groupId => groupId.toString() === checkField2.toString());
            if (alreadyInGroup.length > 0) {
                result = true;
            }
        }
    }
    return result;
};

const fillOutUserForFrontEnd = async (user) => {
    const groupList = [];
    for (let i = 0; i < user.GL.length; i++) {
        const groupData = await db.Group.findById([user.GL[i]]).exec();
        groupList.push({
            N: groupData.N,
            D: groupData.D,
            _id: groupData._id
        });
    }
    const filledUser = {
        UN: user.UN,
        _id: user._id,
        A: user.A,
        GL: groupList,
        MG: user.MG
    };

    return filledUser;
};

module.exports = {
    getUserList: async () => {
        const userlist = await db.User.find({});
        const filteredList = userlist.map(user => { return { username: user.UN, email: user.E, _id: user._id, groupList: user.GL } });

        return filteredList;
    },
    updateProfile: async (userId, request) => {
        //Switch statement here to decide on what the user is updating
        //They can only update one part of their profile at a time
        if (request.UN) {
            const dupeUser = await checkDuplicateUser(`username`, request.UN);
            if (dupeUser) {
                return { status: 409, message: `Username is in use` };
            }
            db.User.updateOne({ _id: userId }, { $set: { UN: request.UN } }, (err) => {
                if (err) {
                    return err;
                }
            });
        }
        if (request.E) {
            const dupeUser = await checkDuplicateUser(`email`, request.E);
            if (dupeUser) {
                return { status: 409, message: `Email is in use` }
            }
            db.User.updateOne({ _id: userId }, { $set: { E: request.E } }, (err) => {
                if (err) {
                    return err;
                }
            });
        }
        return { status: 200, message: `Updated` }
    },
    updateToAdmin: async (userId) => {
        let dbResponse = ``;
        await db.User.updateOne({ _id: userId }, { $set: { A: true } }, (err) => {
            if (err) {
                dbResponse = err;
            } else {
                dbResponse = `${userId} is now an admin!`;
            }
        });
        return dbResponse;
    },
    saveNewUser: async (newUser) => {
        if (!checkDuplicateUser(`username`, newUser.UN) || !checkDuplicateUser(`email`, newUser.E)) { return false }

        const newUserInDB = await db.User.create(newUser);

        return { newUserInDB };
    },
    getUserByEmail: async (email) => {
        const foundUser = await db.User.findOne({ 'E': email });
        const response = await fillOutUserForFrontEnd(foundUser);

        return response;
    },
    getUserByID: async (userID) => {
        let response;
        let status = 200;
        try {
            response = await db.User.findById(userID);
        } catch (err) {
            response = 'No User Found!';
            status = 400;
        }
        return { response, status };
    },
    getUserByUsername: async (username) => {
        const user = await db.User.findOne({ UN: username }).collation({ locale: `en_US`, strength: 2 }).exec();
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
            }
        })
    },
    updateCurrWeek: (currentWeek) => {
        return new Promise(async (res, rej) => {
            try {
                await db.SeasonAndWeek.updateMany({}, { $set: { W: currentWeek } });
                res(`success!`);
            } catch (e) {
                console.log(e);
                res(`failure, check logs!`);
            }
        })
    },
    updateLockWeek: (lockWeek) => {
        return new Promise(async (res, rej) => {
            try {
                await db.SeasonAndWeek.updateMany({}, { $set: { LW: lockWeek } });
                res(`success!`);
            } catch (e) {
                console.log(e);
                res(`failure, check logs!`);
            }
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
    },
    groupUserList: function (userList) {
        return new Promise(async (res) => {
            const filledUserList = [];
            for (const user of userList) {
                const userData = await await db.User.findById(user.ID);
                filledUserList.push({
                    A: user.A, //using the GroupList admin
                    E: userData.E,
                    UN: userData.UN,
                    _id: userData._id
                });
            }
            res(filledUserList);
        })
    },
    getEmailSettings: async (userId) => {
        let emailSettings = await db.UserEmailSettings.findOne({ U: userId }).exec();
        if (emailSettings === null) {
            emailSettings = await db.UserEmailSettings.create({ U: userId });
        }
        return emailSettings;
    },
    updateEmailSettings: async (userId, LE, RE) => {
        try {
            await db.UserEmailSettings.findOneAndUpdate({ U: userId }, { LE, RE });
        } catch (err) {
            console.log(err);
        }
    }
};