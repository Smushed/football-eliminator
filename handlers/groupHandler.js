const db = require(`../models`);

const checkDuplicate = async (checkedField, groupToSearch, userID) => {
    let result = false;
    let searchedGroup;
    //TODO Do something other than log these errors
    switch (checkedField) {
        case `group`:
            try {
                searchedGroup = await db.Group.findOne({ N: groupToSearch }).exec();
                //If there is a group with that name return true
                if (searchedGroup !== null) {
                    result = true;
                };
            } catch (err) {
                console.log(err);
            };
            break;
        case `userlist`:
            //Grabs the group that the user is looking to add the user to 
            try {
                searchedGroup = await db.Group.findOne({ N: groupToSearch });
            } catch (err) {
                console.log(err);
            };
            try {
                const isInGroup = await searchedGroup.UL.filter(user => user._id === userID);
                if (isInGroup.length > 0) {
                    result = true;
                };
            } catch (err) {
                console.log(err);
            };
            break;
    }
    return result;
}

module.exports = {
    createGroup: async (userID, groupName, groupDescription) => {
        //Checks if there is already a group by that name
        //If there is return a bad status code which then can be used to display data to the user
        const isDuplicate = await checkDuplicate(`group`, groupName);
        //Is true if there is a duplicate
        if (isDuplicate) {
            return 500;
        };
        const newGroup = {
            name: groupName,
            description: groupDescription,
            userlist: {
                _id: userID,
                isAdmin: true,
                isMod: true,
                isBanned: false
            }
        };
        const addedGroup = await db.Group.create(newGroup);

        //Add the new group to the user who created it
        await db.User.findByIdAndUpdate([userID], { $push: { grouplist: addedGroup._id } }); //Also saved the group that the user just added to their profile

        return addedGroup;
    },
    // Invite other users to the group
    addUser: async (addedUserID, groupName) => {
        //Checks if the user is already added to the group and returns 500 if they are
        const isDuplicate = await checkDuplicate(`userlist`, groupName, addedUserID);
        //TODO update this so it returns an error message
        if (isDuplicate) {
            return 500;
        };

        const newUserForGroup = {
            A: false,
            B: false,
            ID: addedUserID
        };

        //get the user ID, add them to the array userlist within the group
        await db.Group.findOneAndUpdate({ N: groupName }, { $push: { UL: newUserForGroup } });

        return 200;
    },
    checkGroupMod: async (userID, groupID) => {
        //Looks up the group in the database
        const foundGroup = await db.Group.findById([groupID], err => { if (err) { console.log(err) } });
        //Finds the current user
        const currentUser = await foundGroup.userlist.find(users => users._id == userID);
        //Checks if that user is a mod and returns a boolean
        const isModerator = currentUser.isMod;
        return isModerator;
    },
    getGroupData: async (groupID) => {
        const groupData = await db.Group.findById([groupID]);

        return groupData;
    },
    getLeaderBoard: async (groupId) => {

        let userList;
        const arrayForLeaderBoard = [];

        if (groupId === `allUsers`) {
            userList = await db.User.find().exec();
        } else {
            //TODO Add data for other groups
        };

        const scores = await db.UserScores.find({ 'weeklyScore.groupId': groupId }).exec();

        for (const user of userList) {
            for (const score of scores) {
                if (user._id.toString() === score.userId.toString()) {
                    //Setting this outside to make it easier to add just the weekly scores in userRecord
                    const totalScore = score.weeklyScore.totalScore.toFixed(2);
                    const weeklyScore = score.weeklyScore;
                    delete weeklyScore.groupId;
                    delete weeklyScore.totalScore;

                    const userRecord = {
                        email: user.local.email,
                        userId: user._id,
                        username: user.local.username,
                        totalScore: totalScore,
                        weekScores: weeklyScore
                    };
                    arrayForLeaderBoard.push(userRecord);
                };
            };
        };
        return arrayForLeaderBoard;
    },
    createAllGroup: async function () {
        //If there is no Dupe general group we are good to go ahead and add it
        if (!checkDuplicate('group', 'The Eliminator')) { return false };
        const allGroup = {
            N: `The Eliminator`,
            D: `All players for the football eliminator compete here`
        };
        const allGroupFromDB = await db.Group.create(allGroup);
        this.createGroupScore(allGroupFromDB._id);
        return `working`;
    },
    createGroupScore: (groupId) => {
        db.GroupScore.create({ GID: groupId });
    }
};