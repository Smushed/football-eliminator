import { Schema, Types, model } from 'mongoose';

const UserReminderSettingSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    unique: true,
  },
  reminderEmail: {
    type: Boolean,
    default: false,
  },
  leaderboardEmail: {
    type: Boolean,
    default: true,
  },
  reminderText: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: String,
    default: '',
  },
});

export default model('UserReminderSettings', UserReminderSettingSchema);
