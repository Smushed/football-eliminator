import { Schema, Types, model } from 'mongoose';

const UserReminderSettingSchema = new Schema({
  U: {
    //User ID
    type: Types.ObjectId,
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
  RT: {
    //Text reminders
    type: Boolean,
    default: false,
  },
  PN: {
    //Phone Numbers
    type: String,
    default: '',
  },
});

export default model('UserReminderSettings', UserReminderSettingSchema);
