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
};

const getUserScoreList = async (groupId, season, week) => {
    return await db.UserScores.find({ G: groupId, S: season }, `U ${week.toString()} TS`).exec();
};

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
        const groupDetail = await db.Group.findOneAndUpdate({ N: groupName }, { $push: { UL: newUserForGroup } });

        return groupDetail;
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
    getLeaderBoard: async (groupId, season, week, filledRosters) => {

        const arrayForLeaderBoard = [];

        const userScoreList = await getUserScoreList(groupId, season, week);

        for (const user of userScoreList) {
            const { UN } = filledRosters.find(roster => roster.UID.toString() === user.U.toString());
            const filledOutUser = {
                UID: user.U,
                TS: user.TS,
                UN,
                W: user[week]
            };
            arrayForLeaderBoard.push(filledOutUser);
        };
        arrayForLeaderBoard.sort((a, b) => b.TS - a.TS);
        return arrayForLeaderBoard;
    },
    createAllGroup: async function () { //TODO Break this out to use the Create Group function above. Just not sure about the mod part
        //If there is no Dupe general group we are good to go ahead and add it
        if (!checkDuplicate('group', 'The Eliminator')) { return false };
        const allGroup = {
            N: `The Eliminator`,
            D: `All players for the football eliminator compete here`
        };
        const allGroupFromDB = await db.Group.create(allGroup);
        this.createGroupRoster(allGroupFromDB._id);
        this.createGroupScore(allGroupFromDB._id);
        return `working`;
    },
    createGroupScore: (groupId) => {
        db.GroupScore.create({ G: groupId });
    },
    findGroupIdByName: async (groupName) => {
        const foundGroup = await db.Group.findOne({ N: groupName });

        return foundGroup._id;
    },
    createGroupRoster: async (groupId) => {
        const dbResponse = db.GroupRoster.create({ G: groupId });
        return dbResponse;
    },
    getGroupPositions: async (groupId) => {
        const dbResponse = await db.GroupRoster.findOne({ G: groupId });
        return dbResponse.P;
    },
    groupPositionsForDisplay: async (rawPositionData) => {
        const positionsToDisplay = [false, false, false, false, false, false]; //QB, RB, WR, TE, K, D
        for (const position of rawPositionData) {
            if (position.I === 0) {
                positionsToDisplay[0] = true;
            } else if (position.I === 1) {
                positionsToDisplay[1] = true;
            } else if (position.I === 2) {
                positionsToDisplay[2] = true;
            } else if (position.I === 3) {
                positionsToDisplay[3] = true;
            } else if (position.I === 4) {
                positionsToDisplay[4] = true;
            } else if (position.I === 5) {
                positionsToDisplay[5] = true;
            } else if (position.I === 6) {
                positionsToDisplay[1] = true;
                positionsToDisplay[2] = true;
            } else if (position.I === 7) {
                positionsToDisplay[1] = true;
                positionsToDisplay[2] = true;
                positionsToDisplay[3] = true;
            } else if (position.I === 8) {
                positionsToDisplay[0] = true;
                positionsToDisplay[1] = true;
                positionsToDisplay[2] = true;
                positionsToDisplay[3] = true;
            };
        };
        return positionsToDisplay;
    },
    getGroupScore: async (groupId) => {
        const dbResponse = await db.GroupScore.findOne({ G: groupId });
        return dbResponse;
    }
};