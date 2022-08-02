const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const UserEmailSettingSchema = new Schema({
  U: {
    //User ID
    type: mongoose.Types.ObjectId,
    unique: true,
  },
  RE: {
    //Reminder Emails
    type: Boolean,
    default: true,
  },
  LE: {
    //Leaderboard emails
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model(`UserEmailSettings`, UserEmailSettingSchema);
