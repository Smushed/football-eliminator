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
  const groupData = await db.Group.find({ _id: { $in: user.GL } }).exec();
  const groupList = groupData.map((group) => {
    return { N: group.N, D: group.D, _id: group._id };
  });
  const filledUser = {
    UN: user.UN,
    E: user.E,
    _id: user._id,
    A: user.A,
    GL: groupList,
    MG: user.MG,
  };
  return filledUser;
};

module.exports = {
  getUserList: async () => {
    const userlist = await db.User.find({});
    const filteredList = userlist.map((user) => {
      return {
        username: user.UN,
        email: user.E,
        _id: user._id,
        groupList: user.GL,
      };
    });

    return filteredList;
  },
  updateProfile: async (userId, request) => {
    //They can only update one part of their profile at a time
    let toUpdate = {};
    if (request.UN !== undefined) {
      const dupeUser = await checkDuplicateUser('username', request.UN);
      if (dupeUser) {
        return { status: 409, message: `Username is in use` };
      }
      if (request.UN.length > 20) {
        return {
          status: 413,
          message: `Username must be at least 6 and under 20 characters`,
        };
      }
      toUpdate.UN = request.UN;
    }
    if (request.E !== undefined) {
      const dupeUser = await checkDuplicateUser(`email`, request.E);
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

    toUpdate = {};
    if (request.LE !== undefined) {
      toUpdate.LE = request.LE;
    }
    if (request.RE !== undefined) {
      toUpdate.RE = request.RE;
    }
    db.UserReminderSettings.updateOne(
      { U: userId },
      { $set: toUpdate },
      (err) => {
        if (err) {
          return { status: 400, message: 'Error Saving Email Settings' };
        }
      }
    );
    return { status: 200, message: `Updated`, UN: request.UN, E: request.E };
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
    if (
      !checkDuplicateUser(`username`, newUser.UN) ||
      !checkDuplicateUser(`email`, newUser.E)
    ) {
      return false;
    }

    const newUserInDB = await db.User.create(newUser);

    return { newUserInDB };
  },
  getUserByEmail: async (email) => {
    const foundUser = await db.User.findOne({ E: email });
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
      const user = await db.User.findOne({ UN: username })
        .collation({ locale: `en_US`, strength: 2 })
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
  groupUserList: (userList) =>
    new Promise(async (res) => {
      const filledUserList = [];
      for (const user of userList) {
        const userData = await db.User.findById(user.ID).exec();
        filledUserList.push({
          A: user.A, //using the GroupList admin
          E: userData.E,
          UN: userData.UN,
          _id: userData._id,
        });
      }
      res(filledUserList);
    }),
  getEmailSettings: async (userId) => {
    let emailSettings = await db.UserReminderSettings.findOne({
      U: userId,
    })
      .lean()
      .exec();
    if (emailSettings === null) {
      emailSettings = await db.UserReminderSettings.create({ U: userId });
    }
    return emailSettings;
  },
  updateEmailSettings: async (userId, LE, RE) => {
    try {
      await db.UserReminderSettings.findOneAndUpdate(
        { U: userId },
        { LE, RE }
      ).exec();
    } catch (err) {
      console.log(err);
    }
  },
  unsubscribeEmails: async (userId) => {
    try {
      await db.UserReminderSettings.findOneAndUpdate(
        { U: userId },
        { LE: false, RE: false }
      ).exec();
    } catch (err) {
      console.log(err);
    }
  },
};
