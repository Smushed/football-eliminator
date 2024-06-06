import db from '../models/index.js';

const checkDuplicateUser = async (checkedField, checkField1, checkField2) => {
  let result = false;
  let searched;
  switch (checkedField) {
    case 'username': {
      searched = await db.User.findOne({ username: checkField1 });
      if (searched !== null) {
        result = true;
      }
      break;
    }
    case 'email': {
      searched = await db.User.findOne({ email: checkField1 });
      if (searched !== null) {
        result = true;
      }
      break;
    }
    case 'group': {
      const dbUser = await db.User.findById(checkField1);
      const alreadyInGroup = await dbUser.GL.filter(
        (groupId) => groupId.toString() === checkField2.toString()
      );
      if (alreadyInGroup.length > 0) {
        result = true;
      }
    }
  }
  return result;
};

const fillOutUserForFrontEnd = async (user) => {
  const groupData = await db.Group.find({
    _id: { $in: user.grouplist },
  }).exec();
  const groupList = groupData.map((group) => {
    return { name: group.name, description: group.description, _id: group._id };
  });
  const filledUser = {
    username: user.username,
    email: user.email,
    _id: user._id,
    admin: user.admin,
    grouplist: groupList,
    mainGroup: user.mainGroup,
  };
  return filledUser;
};

export default {
  getUserList: async () => {
    const userlist = await db.User.find({}).exec();
    const filteredList = userlist.map((user) => ({
      username: user.username,
      email: user.email,
      _id: user._id,
      groupList: user.grouplist,
    }));
    return filteredList;
  },
  getUsersEmail: async (userIdArray) =>
    await db.User.find({ _id: { $in: userIdArray } }, { email: 1 }).exec(),
  updateProfile: async (userId, request) => {
    let toUpdate = {};
    if (request.UN !== undefined) {
      const dupeUser = await checkDuplicateUser('username', request.username);
      if (dupeUser) {
        return { status: 409, message: 'Username is in use' };
      }
      if (request.UN.length > 20) {
        return {
          status: 413,
          message: 'Username must be at least 6 and under 20 characters',
        };
      }
      toUpdate.UN = request.UN;
    }
    if (request.E !== undefined) {
      const dupeUser = await checkDuplicateUser('email', request.email);
      if (dupeUser) {
        return { status: 409, message: 'Email is in use' };
      }
      toUpdate.E = request.E;
    }
    if (request.MG !== undefined) {
      const foundGroup = await db.Group.findById(request.MG);
      if (foundGroup) {
        toUpdate.MG = request.MG;
      } else {
        return { status: 400, message: 'Group Id not found' };
      }
    }
    db.User.updateOne({ _id: userId }, { $set: toUpdate }, (err) => {
      if (err) {
        return { status: 400, message: 'Error Updating User Profile' };
      }
    });
    return {
      status: 200,
      message: `Updated`,
      UN: request.username,
      E: request.email,
    };
  },
  updateToAdmin: async (userId) => {
    const res = await db.User.updateOne(
      { _id: userId },
      { $set: { admin: true } }
    )
      .lean()
      .exec();

    return `${res.username} is now an admin!`;
  },
  saveNewUser: async (newUser) => {
    if (
      !checkDuplicateUser(`username`, newUser.username) ||
      !checkDuplicateUser(`email`, newUser.email)
    ) {
      return false;
    }

    const newUserInDB = await db.User.create(newUser).lean().exec();

    return { newUserInDB };
  },
  getUserByEmail: async (email) => {
    const foundUser = await db.User.findOne({ email }).lean().exec();
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
    try {
      const user = await db.User.findOne({ username: username })
        .collation({ locale: 'en_US', strength: 2 })
        .lean()
        .exec();
      return user;
    } catch (err) {
      return { status: 400, message: `User ${username} not found` };
    }
  },
  purgeDB: () => {
    db.User.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`User Deleted`);
      }
    });
    db.UserRoster.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`User Roster Deleted`);
      }
    });
    db.UserScores.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`User Score Deleted`);
      }
    });
    db.Group.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Group Deleted`);
      }
    });
    db.GroupRoster.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Group Roster Deleted`);
      }
    });
    db.GroupScore.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Group Score Deleted`);
      }
    });
    db.SeasonAndWeek.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Season & Week Deleted`);
      }
    });
    db.UsedPlayers.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`UsedPlayers Deleted`);
      }
    });
    db.UserReminderSettings.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`UserEmailSetting Deleted`);
      }
    });
  },
  addGroupToList: async (userId, groupId) => {
    const isInGroup = await checkDuplicateUser(`group`, userId, groupId);
    if (isInGroup) {
      return { status: 409, message: 'Group already added to user!' };
    } else {
      await db.User.findByIdAndUpdate([userId], { $push: { GL: groupId } });
    }
    return { status: 200, message: 'All Good' };
  },
  fillUserListFromGroup: (userList) =>
    new Promise(async (res) => {
      const userIdList = userList.map((id) => id);
      res(
        await db.User.find({ $in: userIdList }, { email: 1, username: 1 })
          .lean()
          .exec()
      );
    }),
  getEmailSettings: async (userId) => {
    let emailSettings = await db.UserReminderSettings.findOne({
      userId,
    })
      .lean()
      .exec();
    if (emailSettings === null) {
      emailSettings = await db.UserReminderSettings.create({ userId });
    }
    return emailSettings;
  },
  updateEmailSettings: async (userId, updatedFields) => {
    if (updatedFields.phoneNumber !== undefined) {
      updatedFields.phoneNumber = updatedFields.phoneNumber.replace(/\D/g, '');
      if (updatedFields.phoneNumber[0] === '1') {
        updatedFields.phoneNumber = updatedFields.phoneNumber.substring(1);
      }
      if (updatedFields.phoneNumber.length !== 10) {
        return { status: 400, message: 'Invalid Phone Number' };
      }
    }
    try {
      await db.UserReminderSettings.findOneAndUpdate(
        { userId },
        updatedFields
      ).exec();
      return {
        status: 200,
        message: 'User Updated',
      };
    } catch (err) {
      return { status: 500, message: 'Error saving reminder settings' };
    }
  },
  unsubscribeEmails: async (userId) => {
    try {
      await db.UserReminderSettings.findOneAndUpdate(
        { userId },
        { leaderboardEmail: false, reminderEmail: false }
      ).exec();
    } catch (err) {
      console.log(err);
    }
  },
  getGroupEmailSettings: async (userList) =>
    await db.UserReminderSettings.find(
      {
        userId: { $in: userList },
        leaderboardEmail: true,
      },
      { userId: 1 }
    )
      .lean()
      .exec(),
};
