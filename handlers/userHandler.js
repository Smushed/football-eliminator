import db from '../models/index.js';

const fieldAlreadyExists = async (fieldToCheck, checkField1, checkField2) => {
  try {
    switch (fieldToCheck) {
      case 'username': {
        const searched = await db.User.findOne({ username: checkField1 })
          .collation({ locale: 'en_US', strength: 2 })
          .lean()
          .exec();
        if (searched !== null) {
          return true;
        } else {
          return false;
        }
      }
      case 'email': {
        const searched = await db.User.findOne({ email: checkField1 })
          .collation({ locale: 'en_US', strength: 2 })
          .lean()
          .exec();
        if (searched !== null) {
          return true;
        } else {
          return false;
        }
      }
      case 'group': {
        const dbUser = await db.User.findById(checkField1);
        const alreadyInGroup = await dbUser.GL.filter(
          (groupId) => groupId.toString() === checkField2.toString()
        );
        if (alreadyInGroup.length > 0) {
          return true;
        } else {
          return false;
        }
      }
    }
  } catch (err) {
    console.log('Error checking duplicate in user field: ', {
      fieldToCheck,
      checkField1,
      checkField2,
      err,
    });
    throw { status: 500, message: 'Server Error' };
  }
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
  updateProfile: async (userId, request) => {
    try {
      let toUpdate = {};
      if (request.username !== undefined) {
        if (await fieldAlreadyExists('username', request.username)) {
          throw { status: 409, message: 'Username is in use' };
        }
        if (request.username.length > 20 || request.username.length < 6) {
          throw {
            status: 413,
            message: 'Username must be at least 6 and under 20 characters',
          };
        }
        toUpdate.username = request.username.trim();
      }
      if (request.email !== undefined) {
        if (await fieldAlreadyExists('email', request.email)) {
          throw { status: 409, message: 'Email is in use' };
        }
        toUpdate.email = request.email;
      }
      if (request.mainGroup !== undefined) {
        const foundGroup = await db.Group.findById(request.mainGroup);
        if (foundGroup) {
          toUpdate.mainGroup = request.mainGroup;
        } else {
          throw { status: 400, message: 'Group Id not found' };
        }
      }
      db.User.updateOne({ _id: userId }, { $set: toUpdate }, (err) => {
        if (err) {
          throw { status: 500, message: 'Error Updating User Profile' };
        }
      });
      return {
        status: 200,
        message: 'Updated',
        username: request.username,
        email: request.email,
      };
    } catch (err) {
      console.log('Error inside of update profile: ', { userId, request, err });
      throw err;
    }
  },
  saveNewUser: async (newUser) => {
    if (await fieldAlreadyExists('username', newUser.username)) {
      throw {
        status: 409,
        message: 'Username is in use, enter a different username.',
      };
    }
    if (await fieldAlreadyExists('email', newUser.email)) {
      throw {
        status: 409,
        message: 'Email is in use, sign in or enter a different email.',
      };
    }
    const newUserInDB = await db.User.create(newUser);
    return { newUserInDB };
  },
  getUserByEmail: async (email) => {
    const foundUser = await db.User.findOne({ email }).lean().exec();
    const response = await fillOutUserForFrontEnd(foundUser);

    return response;
  },
  getUserByID: async (userId) => {
    let response;
    let status = 200;
    try {
      response = await db.User.findById(userId);
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
        console.log('User Deleted');
      }
    });
    db.UserRoster.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('User Roster Deleted');
      }
    });
    db.UserScores.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('User Score Deleted');
      }
    });
    db.Group.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Group Deleted');
      }
    });
    db.GroupRoster.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Group Roster Deleted');
      }
    });
    db.GroupScore.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Group Score Deleted');
      }
    });
    db.SeasonAndWeek.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Season & Week Deleted');
      }
    });
    db.UsedPlayers.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('UsedPlayers Deleted');
      }
    });
    db.UserReminderSettings.deleteMany({}, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('UserEmailSetting Deleted');
      }
    });
  },
  addGroupToList: async (userId, groupId) => {
    const isInGroup = await fieldAlreadyExists('group', userId, groupId);
    if (isInGroup) {
      return { status: 409, message: 'Group already added to user!' };
    } else {
      await db.User.findByIdAndUpdate(userId, { $push: { GL: groupId } });
    }
    return { status: 200, message: 'All Good' };
  },
  fillUserListFromGroup: (userList) =>
    new Promise(async (res) => {
      const userIdList = userList.map((user) => user.userId);
      res(
        await db.User.find({ _id: { $in: userIdList } })
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
};
